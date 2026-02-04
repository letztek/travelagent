import { GoogleGenerativeAI } from '@google/generative-ai'
import { routeConceptSchema, type RouteConcept } from '@/schemas/route'
import { type Requirement } from '@/schemas/requirement'
import { getSkillSchema } from './reader'

export async function runRoutePlannerSkill(requirement: Requirement): Promise<RouteConcept> {
  const apiKey = process.env.GEMINI_API_KEY
  const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-3-pro-preview'

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: modelName })

  const schemaContent = getSkillSchema('route-planner', 'route-concept-schema.md')

  const systemPrompt = `
    You are a strategic travel planner.
    Your goal is to design the optimal sequence of cities and regions (Route Concept) based on the client's requirements.
    Focus on "Where" (Location) and "How" (Transport), not "What" (Specific spots).

    【Planning Principles】
    1. **Efficiency**: Prioritize direct flights and high-speed rail. Avoid backtracking.
    2. **Balance**: Ensure travel distances are realistic for the group type.
    3. **Feasibility**: Match the route to the season and budget.

    【Client Requirements】
    - Origin: ${requirement.origin || 'Not specified'}
    - Destinations: ${requirement.destinations && requirement.destinations.length > 0 ? requirement.destinations.join(', ') : 'Not specified'}
    - Dates: ${requirement.travel_dates.start} to ${requirement.travel_dates.end}
    - Travelers: Adult ${requirement.travelers.adult}, Senior ${requirement.travelers.senior}, Child ${requirement.travelers.child}, Infant ${requirement.travelers.infant}
    - Budget: ${requirement.budget_range} (Total)
    - Notes: ${requirement.notes || 'None'}

    【Output Requirement】
    You MUST return ONLY a JSON object that strictly adheres to the schema defined below.
    The response (locations and rationale) MUST be in Traditional Chinese (繁體中文).
    
    ${schemaContent}
    
    Constraint: No Markdown blocks, no preamble, no postamble. Just pure JSON.
  `

  const result = await model.generateContent(systemPrompt)
  const response = await result.response
  const text = response.text().trim()

  const cleanJson = text.replace(/^```json/, '').replace(/```$/, '').trim()
  const parsedData = JSON.parse(cleanJson)
  
  return routeConceptSchema.parse(parsedData)
}
