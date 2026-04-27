import { GoogleGenerativeAI, SchemaType, type GenerationConfig } from '@google/generative-ai'
import { itinerarySchema, type Itinerary } from '@/schemas/itinerary'
import { withRetry } from '@/lib/utils/ai-retry'
import { logger } from '@/lib/utils/logger'
import { normalizeItinerary } from '@/lib/utils/itinerary-utils'

// NOTE: We cannot use logAiAudit here if this file is imported by Client Components
// because logAiAudit eventually depends on next/headers which is server-only.

export interface AgentContext {
  dayIndex: number
  type: 'activity' | 'meal' | 'accommodation' | 'day'
  itemId?: string
}

export interface ItineraryAgentResponse {
  thought: string
  analysis: {
    status: 'green' | 'red'
    message: string
  }
  proposed_itinerary: Itinerary
}

export interface ItineraryAgentResult {
  success: boolean
  data?: ItineraryAgentResponse
  error?: string
}

export async function refineItineraryWithAI(
  currentItinerary: Itinerary, 
  context: AgentContext | null,
  instruction: string
): Promise<ItineraryAgentResult> {
  const apiKey = process.env.GEMINI_API_KEY
  const primaryModelName = process.env.GEMINI_PRIMARY_MODEL || 'gemini-3-flash-preview'
  const fallbackModelName = 'gemini-2.5-flash'
  const genAI = new GoogleGenerativeAI(apiKey || '')

  if (!apiKey) {
    logger.error('GEMINI_API_KEY is not set')
    return { success: false, error: 'API key missing' }
  }

  const startTime = Date.now()
  let responseText = ''
  let finalModelUsed = primaryModelName

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
      if (attempt > 0) {
        logger.info(`Fallback triggered: Switching model to ${finalModelUsed} for attempt ${attempt + 1}`)
      }
      const model = genAI.getGenerativeModel({
        model: finalModelUsed,
        generationConfig
      })
      return model.generateContent(prompt)
    })
    
    responseText = result.response.text()
    const parsed = JSON.parse(responseText)
    
    // Normalize time slots before validation
    if (parsed.proposed_itinerary) {
      parsed.proposed_itinerary = normalizeItinerary(parsed.proposed_itinerary)
    }
    
    // Validate proposed_itinerary with zod
    itinerarySchema.parse(parsed.proposed_itinerary)

    return { 
      success: true, 
      data: parsed as unknown as ItineraryAgentResponse
    }
  } catch (error: any) {
    logger.error('Itinerary refinement failed', { 
      error: error.message,
      stack: error.stack
    })
    return { success: false, error: 'Failed to refine itinerary with AI' }
  }
}
