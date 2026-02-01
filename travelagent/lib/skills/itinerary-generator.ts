import { GoogleGenerativeAI } from '@google/generative-ai'
import { itinerarySchema, type Itinerary } from '@/schemas/itinerary'
import { type Requirement } from '@/schemas/requirement'

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

export async function runItinerarySkill(requirement: Requirement): Promise<Itinerary> {
  const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' })

  const systemPrompt = `
    You are a professional travel consultant assistant. 
    Generate a detailed, geographically logical travel itinerary based on the client's requirements.
    
    Requirements:
    - Travel Dates: ${requirement.travel_dates.start} to ${requirement.travel_dates.end}
    - Travelers: Adult: ${requirement.travelers.adult}, Senior: ${requirement.travelers.senior}, Child: ${requirement.travelers.child}, Infant: ${requirement.travelers.infant}
    - Budget: ${requirement.budget_range}
    - Preferences: Dietary: ${requirement.preferences.dietary.join(', ')}, Accommodation: ${requirement.preferences.accommodation.join(', ')}
    - Notes: ${requirement.notes || 'None'}

    Output Format:
    You MUST return ONLY a JSON object that strictly adheres to the structure defined in the Itinerary Schema.
    
    Constraint: No Markdown blocks, no preamble, no postamble. Just pure JSON.
  `

  const result = await model.generateContent(systemPrompt)
  const response = await result.response
  const text = response.text().trim()

  const cleanJson = text.replace(/^```json/, '').replace(/```$/, '').trim()
  const parsedData = JSON.parse(cleanJson)
  
  return itinerarySchema.parse(parsedData)
}
