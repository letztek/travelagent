'use server'

import { RouteConcept, routeConceptSchema } from '@/schemas/route'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { z } from 'zod'
import { withRetry } from '@/lib/utils/ai-retry'
import { logAiAudit } from '@/lib/supabase/audit'
import { logger } from '@/lib/utils/logger'

// Define the response schema for the agent
const agentResponseSchema = z.object({
  thought: z.string().describe('The agent\'s reasoning process.'),
  analysis: z.object({
    status: z.enum(['green', 'red']).describe('Green if the route is logical, Red if there are issues.'),
    message: z.string().describe('Explanation of the status, e.g., "Route is efficient" or "Too much travel in one day".'),
  }),
  proposed_route: routeConceptSchema.describe('The modified route concept based on user instruction.'),
})

export type AgentResponse = z.infer<typeof agentResponseSchema>

export async function refineRouteWithAI(currentRoute: RouteConcept, instruction: string) {
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
        }
      }
    })

    const prompt = `
      You are an expert Travel Route Architect Agent.
      Your goal is to help the user refine their travel route based on their instructions.
      
      Current Route JSON:
      ${JSON.stringify(currentRoute, null, 2)}
      
      User Instruction:
      "${instruction}"
      
      Task:
      1. Analyze the instruction and the current route.
      2. modify the route (nodes, order, days) to meet the user's request.
      3. Ensure the route logic (geography, travel time) is sound.
      4. Return the result in the specified JSON structure.
      
      Constraint:
      - Maintain the original data structure.
      - If the instruction is impossible or highly illogical, set status to "red" and explain why in the message, but still provide a best-effort modification if possible.
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
    
    let data: AgentResponse
    try {
        data = JSON.parse(cleanJson) as AgentResponse
    } catch (parseError) {
        logger.error('JSON Parse Error', { raw: responseText })
        throw new Error('Failed to parse AI response as JSON')
    }

    return { success: true, data }

  } catch (error: any) {
    logger.error('AI Refinement Error', { error: error.message })
    return { success: false, error: 'Failed to refine route with AI' }
  }
}
