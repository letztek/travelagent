'use server'

import { Itinerary, itinerarySchema } from '@/schemas/itinerary'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { z } from 'zod'
import { withRetry } from '@/lib/utils/ai-retry'
import { logAiAudit } from '@/lib/supabase/audit'
import { logger } from '@/lib/utils/logger'

const itineraryAgentResponseSchema = z.object({
  thought: z.string().describe('The agent\'s reasoning process.'),
  analysis: z.object({
    status: z.enum(['green', 'red']).describe('Green if the suggestion is logical, Red if there are issues.'),
    message: z.string().describe('Explanation of the status.'),
  }),
  proposed_itinerary: itinerarySchema.describe('The modified itinerary based on user instruction.'),
})

export type ItineraryAgentResponse = z.infer<typeof itineraryAgentResponseSchema>

export type AgentContext = {
  dayIndex: number
  itemId?: string
  type: 'activity' | 'meal' | 'accommodation' | 'day'
}

export async function refineItineraryWithAI(
  currentItinerary: Itinerary, 
  context: AgentContext | null,
  instruction: string
) {
  const apiKey = process.env.GEMINI_API_KEY
  const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-3-flash-preview'

  if (!apiKey && process.env.NODE_ENV !== 'test') {
    logger.error('GEMINI_API_KEY is not set')
    return { success: false, error: 'API key missing' }
  }

  const genAI = new GoogleGenerativeAI(apiKey || 'fake-key')
  const startTime = Date.now()
  let responseText = ''
  let errorCode: string | undefined

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        // ... rest of config
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            thought: { type: SchemaType.STRING },
            analysis: {
              type: SchemaType.OBJECT,
              properties: {
                status: { type: SchemaType.STRING, enum: ["green", "red"], format: "enum" },
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
                                                    time_slot: { type: SchemaType.STRING, enum: ['Morning', 'Afternoon', 'Evening'], format: "enum" },
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
        }
      }
    })

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

    try {
      const result = await withRetry(() => model.generateContent(prompt))
      responseText = result.response.text()
    } catch (err: any) {
      errorCode = err.status?.toString() || err.message
      throw err
    } finally {
      const duration = Date.now() - startTime
      logAiAudit({
        prompt,
        response: responseText,
        model: modelName,
        duration_ms: duration,
        error_code: errorCode
      })
    }

    // Clean markdown code blocks if present
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim()
    
    let data: ItineraryAgentResponse
    try {
        data = JSON.parse(cleanJson) as ItineraryAgentResponse
    } catch (parseError) {
        logger.error('JSON Parse Error', { raw: responseText })
        throw new Error('Failed to parse AI response as JSON')
    }

    return { success: true, data }

  } catch (error: any) {
    logger.error('AI Refinement Error', { error: error.message })
    return { success: false, error: 'Failed to refine itinerary with AI' }
  }
}
