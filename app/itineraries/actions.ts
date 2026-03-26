'use server'

import { runItinerarySkill } from '@/lib/skills/itinerary-generator'
import { itinerarySchema, type Itinerary } from '@/schemas/itinerary'
import { type Requirement } from '@/schemas/requirement'
import { createClient } from '@/lib/supabase/server'
import { RouteConcept } from '@/schemas/route'
import { GoogleGenerativeAI, SchemaType, type GenerationConfig } from '@google/generative-ai'
import { withRetry } from '@/lib/utils/ai-retry'
import { logger } from '@/lib/utils/logger'
import { logAiAudit } from '@/lib/supabase/audit'
import { AgentContext, ItineraryAgentResponse, ItineraryAgentResult } from './itinerary-agent'
import { revalidatePath } from 'next/cache'
import { searchFavorites } from '@/lib/services/favorites-search'

export async function refineItineraryAction(
  currentItinerary: Itinerary, 
  context: AgentContext | null,
  instruction: string
): Promise<ItineraryAgentResult> {
  const apiKey = process.env.GEMINI_API_KEY
  const primaryModelName = process.env.GEMINI_PRIMARY_MODEL || 'gemini-3-flash-preview'
  const fallbackModelName = 'gemini-2.5-flash'
  
  if (!apiKey) {
    logger.error('GEMINI_API_KEY is not set')
    return { success: false, error: 'API key missing' }
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const startTime = Date.now()
  let responseText = ''
  let finalModelUsed = primaryModelName
  let errorCode: string | undefined

  try {
    const contextDesc = context 
      ? `Focus on Day ${context.dayIndex + 1}, Item Type: ${context.type}${context.itemId ? `, Item ID: ${context.itemId}` : ''}`
      : 'No specific context selected.'

    const prompt = `
      You are an expert Activity Planner Agent.
      Your goal is to help the user refine specific details of their travel itinerary.
      
      Current Itinerary JSON:
      ${JSON.stringify(currentItinerary, null, 2)}
      
      User Focus Context:
      ${contextDesc}
      
      User Instruction:
      "${instruction}"
      
      Task:
      1. Analyze the instruction relative to the focus context (if any).
      2. If the user asks for recommendations (e.g., "nearby lunch"), provide specific, high-quality suggestions based on the location of that day.
      3. If the user wants to change a specific item, update only that item but ensure consistency.
      4. If the user wants to change the location (Macro change), update the activities/accommodation for that day to match.
      5. Return the FULL updated itinerary structure.
      
      Constraints:
      - Keep the itinerary structure valid.
      - Ensure 'analysis' provides feedback on logic (e.g., if a restaurant is closed or far away -> Red light).
    `

    const generationConfig: GenerationConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          thought: { type: SchemaType.STRING },
          analysis: {
            type: SchemaType.OBJECT,
            properties: {
              status: { type: SchemaType.STRING, enum: ["green", "red"] },
              message: { type: SchemaType.STRING }
            },
            required: ["status", "message"]
          },
          proposed_itinerary: {
            type: SchemaType.OBJECT,
            properties: {
              days: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    day: { type: SchemaType.INTEGER },
                    date: { type: SchemaType.STRING },
                    activities: {
                      type: SchemaType.ARRAY,
                      items: {
                        type: SchemaType.OBJECT,
                        properties: {
                          time_slot: { type: SchemaType.STRING, enum: ['Morning', 'Afternoon', 'Evening'] },
                          activity: { type: SchemaType.STRING },
                          description: { type: SchemaType.STRING }
                        },
                        required: ["time_slot", "activity", "description"]
                      }
                    },
                    meals: {
                      type: SchemaType.OBJECT,
                      properties: {
                        breakfast: { type: SchemaType.STRING },
                        lunch: { type: SchemaType.STRING },
                        dinner: { type: SchemaType.STRING }
                      },
                      required: ["breakfast", "lunch", "dinner"]
                    },
                    accommodation: { type: SchemaType.STRING }
                  },
                  required: ["day", "date", "activities", "meals", "accommodation"]
                }
              }
            },
            required: ["days"]
          }
        },
        required: ["thought", "analysis", "proposed_itinerary"]
      } as any
    }

    const result = await withRetry(async (attempt) => {
      finalModelUsed = attempt > 0 ? fallbackModelName : primaryModelName;
      const model = genAI.getGenerativeModel({
        model: finalModelUsed,
        generationConfig
      })
      return model.generateContent(prompt)
    })
    
    responseText = result.response.text()
    const parsed = JSON.parse(responseText)
    
    // Validate proposed_itinerary with zod
    itinerarySchema.parse(parsed.proposed_itinerary)

    return { 
      success: true, 
      data: parsed as unknown as ItineraryAgentResponse
    }
  } catch (error: any) {
    errorCode = error.status?.toString() || error.message
    logger.error('Itinerary refinement failed', { error: error.message })
    return { success: false, error: 'Failed to refine itinerary with AI' }
  } finally {
    const duration = Date.now() - startTime
    logAiAudit({
      prompt: instruction,
      response: responseText,
      model: finalModelUsed,
      duration_ms: duration,
      error_code: errorCode
    })
  }
}

export async function generateItinerary(requirement: Requirement, requirementId: string, routeConcept?: RouteConcept) {
  try {
    const supabase = await createClient()
    
    // Get current user session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Fetch user favorites using RAG search
    const destination = requirement.destinations?.[0] || ''
    const { data: favorites } = await searchFavorites({ query: destination })

    const itineraryData = await runItinerarySkill(requirement, routeConcept, (favorites as any) || [])
    
    const { data, error } = await supabase
      .from('itineraries')
      .insert([
        {
          requirement_id: requirementId,
          content: itineraryData,
          user_id: user.id
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase Insertion Error Detail:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error: `無法儲存行程至資料庫: ${error.message}` }
    }

    revalidatePath('/itineraries')
    return { success: true, data: data } // Returns the inserted itinerary record (including id)
  } catch (error: any) {
    console.error('AI Generation Error:', error)
    return { success: false, error: error.message || 'Failed to generate itinerary' }
  }
}

export async function regenerateItinerary(itineraryId: string) {
  try {
    const supabase = await createClient()
    
    // 1. Get original itinerary to find requirement_id
    const { data: original, error: getError } = await supabase
      .from('itineraries')
      .select('requirement_id, requirements(id, origin, destinations, travel_dates, travelers, budget_range, preferences, notes), route_concepts(content)')
      .eq('id', itineraryId)
      .single()

    if (getError || !original) {
      return { success: false, error: '找不到原始行程或需求資料' }
    }

    const requirement = (original as any).requirements
    const routeConcept = (original as any).route_concepts?.content

    // 1.5 Fetch user favorites using RAG search
    const destination = requirement.destinations?.[0] || ''
    const { data: favorites } = await searchFavorites({ query: destination })

    // 2. Run skill again
    const newItineraryData = await runItinerarySkill(requirement, routeConcept, (favorites as any) || [])

    // 3. Update existing itinerary
    const { data, error: updateError } = await supabase
      .from('itineraries')
      .update({ content: newItineraryData })
      .eq('id', itineraryId)
      .select()
      .single()

    if (updateError) {
      return { success: false, error: '更新行程失敗' }
    }

    revalidatePath(`/itineraries/${itineraryId}`)
    revalidatePath('/itineraries')
    return { success: true, data }
  } catch (error: any) {
    console.error('AI Regeneration Error:', error)
    return { success: false, error: error.message || '重新產生行程失敗' }
  }
}

export async function deleteItinerary(id: string) {
  const supabase = await createClient()
  
  // Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  // Delete the itinerary
  const { error } = await supabase
    .from('itineraries')
    .delete()
    .eq('id', id)
    // Security check: must be owner. 
    // The policy "Users can delete their own itineraries" handles this via join, 
    // but the delete request here will fail if the user doesn't own it.
    .eq('user_id', user.id) 

  if (error) {
    console.error('Supabase delete error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/itineraries')
  return { success: true }
}

export async function getItinerary(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Supabase error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getItineraries() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function updateItinerary(id: string, content: Itinerary) {
  // Validate content with Zod before saving
  const validated = itinerarySchema.safeParse(content)
  if (!validated.success) {
    return { success: false, error: validated.error.format() }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('itineraries')
    .update({ content: validated.data })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Supabase Update Error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/itineraries/${id}`)
  revalidatePath('/itineraries')
  return { success: true, data }
}
