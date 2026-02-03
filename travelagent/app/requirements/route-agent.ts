'use server'

import { RouteConcept, routeConceptSchema } from '@/schemas/route'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { z } from 'zod'

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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function refineRouteWithAI(currentRoute: RouteConcept, instruction: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
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

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const data = JSON.parse(responseText) as AgentResponse

    return { success: true, data }

  } catch (error) {
    console.error('AI Refinement Error:', error)
    return { success: false, error: 'Failed to refine route with AI' }
  }
}
