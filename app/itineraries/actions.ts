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
import { cachedPlacesService } from '@/lib/services/google-places-cache'
import { verifyItinerary } from '@/lib/skills/itinerary-verifier'

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

    // Fetch user favorites using RAG search with broader query
    const destinations = requirement.destinations || []
    const favoritesPromises = destinations.map(d => searchFavorites({ query: d }))
    const searchResults = await Promise.all(favoritesPromises)
    
    const allFavorites = searchResults.flatMap(res => res.success ? (res.data as any) : [])
    // Deduplicate by ID
    const uniqueFavorites = Array.from(new Map(allFavorites.map(f => [f.id, f])).values())

    // Fetch coordinates for destinations to provide better spatial context
    const destinationCoordsPromises = destinations.map(async (d) => {
      try {
        const results = await cachedPlacesService.searchText(d);
        if (results && results.length > 0 && results[0].location) {
          return { name: d, location: results[0].location };
        }
      } catch (e) {
        logger.error(`Failed to fetch coords for destination: ${d}`, e);
      }
      return null;
    });
    const destinationCoords = (await Promise.all(destinationCoordsPromises)).filter(Boolean) as any[];

    const { itinerary: itineraryData, groundingMetadata } = await runItinerarySkill(
      requirement, 
      routeConcept, 
      (uniqueFavorites as any) || [],
      undefined,
      destinationCoords,
      uniqueFavorites
    )

    // Phase 4: Automated Verification & Refinement
    let finalItinerary = itineraryData;
    const verification = await verifyItinerary(itineraryData, groundingMetadata, routeConcept);
    
    if (!verification.valid) {
      logger.info('Itinerary verification failed, attempting refinement...', { errors: verification.errors });
      
      const correctionPrompt = `
        您之前生成的行程在邏輯檢查中發現以下問題，請針對這些問題進行修正，並確保其餘部分保持不變：
        ${verification.errors.map(e => `- Day ${e.day} ${e.item}: ${e.message}`).join('\n        ')}
        
        請重新輸出完整的 JSON 行程。
      `;

      try {
        const { itinerary: refinedData } = await runItinerarySkill(
          { ...requirement, notes: (requirement.notes || '') + '\n[修正要求]: ' + correctionPrompt },
          routeConcept,
          (uniqueFavorites as any) || [],
          undefined,
          destinationCoords,
          { original_errors: verification.errors }
        );
        finalItinerary = refinedData;
      } catch (refineError) {
        logger.error('Refinement failed, falling back to original itinerary', refineError);
      }
    }
    
    const { data, error } = await supabase
      .from('itineraries')
      .insert([
        {
          requirement_id: requirementId,
          content: finalItinerary,
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

    if (requirement.preferences?.auto_add_to_favorites) {
      // Async operation to prevent blocking the user
      (async () => {
        try {
          const newFavorites: any[] = [];
          const seen = new Set<string>();

          for (const day of finalItinerary.days) {
            for (const act of day.activities) {
              if (act.activity && !seen.has(act.activity)) {
                seen.add(act.activity);
                newFavorites.push({
                  user_id: user.id,
                  type: 'spot',
                  name: act.activity,
                  description: act.description,
                  location_data: {},
                  tags: []
                });
              }
            }
            if (day.accommodation && !seen.has(day.accommodation)) {
              seen.add(day.accommodation);
              newFavorites.push({
                user_id: user.id,
                type: 'accommodation',
                name: day.accommodation,
                location_data: {},
                tags: []
              });
            }
            const meals = [day.meals.breakfast, day.meals.lunch, day.meals.dinner];
            for (const meal of meals) {
              if (meal && !['機上', 'None', '無', '自理', '機上套餐', '飯店', '酒店'].includes(meal) && !seen.has(meal)) {
                seen.add(meal);
                newFavorites.push({
                  user_id: user.id,
                  type: 'food',
                  name: meal,
                  location_data: {},
                  tags: []
                });
              }
            }
          }

          if (newFavorites.length > 0) {
            const { error: favError } = await supabase.from('user_favorites').insert(newFavorites);
            if (favError) {
              logger.error('Failed to auto-add favorites', favError);
            }
          }
        } catch (e) {
          logger.error('Error during auto_add_to_favorites execution', e);
        }
      })();
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

    // 1.5 Fetch user favorites using RAG search with broader query
    const destinations = requirement.destinations || []
    const favoritesPromises = destinations.map((d: string) => searchFavorites({ query: d }))
    const searchResults = await Promise.all(favoritesPromises)
    const allFavorites = searchResults.flatMap(res => res.success ? (res.data as any) : [])
    const uniqueFavorites = Array.from(new Map(allFavorites.map(f => [f.id, f])).values())

    // Fetch coordinates for destinations to provide better spatial context
    const destinationCoordsPromises = destinations.map(async (d: string) => {
      try {
        const results = await cachedPlacesService.searchText(d);
        if (results && results.length > 0 && results[0].location) {
          return { name: d, location: results[0].location };
        }
      } catch (e) {
        logger.error(`Failed to fetch coords for destination: ${d}`, e);
      }
      return null;
    });
    const destinationCoords = (await Promise.all(destinationCoordsPromises)).filter(Boolean) as any[];

    // 2. Run skill again
    const { itinerary: newItineraryData, groundingMetadata } = await runItinerarySkill(
      requirement, 
      routeConcept, 
      (uniqueFavorites as any) || [],
      undefined,
      destinationCoords,
      uniqueFavorites
    )

    // Phase 4: Verification & Refinement
    let finalRegenItinerary = newItineraryData;
    const verification = await verifyItinerary(newItineraryData, groundingMetadata);

    if (!verification.valid) {
      logger.info('Regenerated itinerary verification failed, attempting refinement...', { errors: verification.errors });
      const correctionPrompt = `
        您之前生成的行程在邏輯檢查中發現以下問題，請針對這些問題進行修正：
        ${verification.errors.map(e => `- Day ${e.day} ${e.item}: ${e.message}`).join('\n        ')}
      `;

      try {
        const { itinerary: refinedRegenData } = await runItinerarySkill(
          { ...requirement, notes: (requirement.notes || '') + '\n[修正要求]: ' + correctionPrompt },
          routeConcept,
          (uniqueFavorites as any) || [],
          undefined,
          destinationCoords,
          { original_errors: verification.errors }
        );
        finalRegenItinerary = refinedRegenData;
      } catch (e) {}
    }

    // 3. Update existing itinerary
    const { data, error: updateError } = await supabase
      .from('itineraries')
      .update({ content: finalRegenItinerary })
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
