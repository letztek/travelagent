import { GoogleGenerativeAI, SchemaType, type GenerationConfig } from '@google/generative-ai'
import { routeConceptSchema, type RouteConcept } from '@/schemas/route'
import { withRetry } from '@/lib/utils/ai-retry'
import { logger } from '@/lib/utils/logger'

// NOTE: We cannot use logAiAudit here if this file is imported by Client Components
// because logAiAudit eventually depends on next/headers which is server-only.

export interface AgentResponse {
  thought: string
  analysis: {
    status: 'green' | 'red'
    message: string
  }
  proposed_route: RouteConcept
}

export interface RouteAgentResult {
  success: boolean
  data?: AgentResponse
  error?: string
}

const apiKey = process.env.GEMINI_API_KEY
const primaryModelName = process.env.GEMINI_PRIMARY_MODEL || 'gemini-3-flash-preview'
const fallbackModelName = 'gemini-2.5-flash'
const genAI = new GoogleGenerativeAI(apiKey || '')

export async function refineRouteWithAI(
  currentRoute: RouteConcept, 
  instruction: string
): Promise<RouteAgentResult> {
  if (!apiKey) {
    logger.error('GEMINI_API_KEY is not set')
    return { success: false, error: 'API key missing' }
  }

  const startTime = Date.now()
  let responseText = ''
  let finalModelUsed = primaryModelName

  try {
    const prompt = `
      You are an expert Route Planner Agent.
      Your goal is to help the user refine their travel route skeleton.
      
      Current Route JSON:
      ${JSON.stringify(currentRoute, null, 2)}
      
      User Instruction:
      "${instruction}"
      
      Task:
      1. Analyze the instruction.
      2. If the user wants to add/remove a city, update the nodes and rationale.
      3. If the user wants to change the sequence or stay duration, update accordingly.
      4. Ensure the total_days matches the final node sequence.
      5. Return the FULL updated route structure.
      
      Constraints:
      - Return 'analysis' with 'status' ("green" or "red") and a short 'message' in Traditional Chinese.
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
          proposed_route: {
            type: SchemaType.OBJECT,
            properties: {
              nodes: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    day: { type: SchemaType.INTEGER },
                    location: { type: SchemaType.STRING },
                    description: { type: SchemaType.STRING },
                    transport: { type: SchemaType.STRING }
                  },
                  required: ["day", "location"]
                }
              },
              rationale: { type: SchemaType.STRING },
              total_days: { type: SchemaType.INTEGER }
            },
            required: ["nodes", "rationale", "total_days"]
          }
        },
        required: ["thought", "analysis", "proposed_route"]
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
    
    // Validate with zod
    routeConceptSchema.parse(parsed.proposed_route)

    return { 
      success: true, 
      data: parsed as unknown as AgentResponse
    }
  } catch (error: any) {
    logger.error('Route refinement failed', { 
      error: error.message,
      stack: error.stack
    })
    return { success: false, error: 'Failed to refine route with AI' }
  }
}
