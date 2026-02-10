import { GoogleGenerativeAI } from '@google/generative-ai'
import { gapAnalysisSchema, type GapAnalysis } from '@/schemas/gap-analysis'
import { type Requirement } from '@/schemas/requirement'
import { getSkillSchema } from './reader'
import { withRetry } from '../utils/ai-retry'
import { logAiAudit } from '../supabase/audit'
import { logger } from '../utils/logger'

export async function runGapAnalyzerSkill(requirement: Requirement): Promise<GapAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY
  const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-3-pro-preview'

  if (!apiKey) {
    logger.error('GEMINI_API_KEY is not defined')
    throw new Error('GEMINI_API_KEY is not defined')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: modelName })

  const schemaContent = getSkillSchema('gap-analyzer', 'gap-analysis-schema.md')

  const systemPrompt = `
    You are a professional travel consultant assistant specializing in risk assessment and requirement analysis.
    Your goal is to detect information gaps and logical inconsistencies in client travel requirements before the itinerary planning phase.

    【Analysis Logic】
    1. **Senior / Accessibility**: If seniors are present, check for 'accessibility' or 'walking difficulty' notes.
    2. **Infant / Equipment**: If infants are present, check for 'crib', 'stroller', or 'car seat' needs.
    3. **Dietary**: If "Vegetarian" or "Vegan" is selected, ensure no conflicting restaurant requests in notes.
    4. **Budget**: The budget range is the **TOTAL budget** for the entire group and entire duration. Check if this total budget aligns reasonably with the requested duration and party size. Unless specified otherwise, assume the currency is **New Taiwan Dollar (TWD)**.
    5. **Location / Season**: If destination implies extreme weather, check for gear mentions.

    【Client Requirements】
    - Origin: ${requirement.origin || 'Not specified'}
    - Destinations: ${requirement.destinations && requirement.destinations.length > 0 ? requirement.destinations.join(', ') : 'Not specified'}
    - Travel Dates: ${requirement.travel_dates.start} to ${requirement.travel_dates.end}
    - Travelers: Adult: ${requirement.travelers.adult}, Senior: ${requirement.travelers.senior}, Child: ${requirement.travelers.child}, Infant: ${requirement.travelers.infant}
    - Budget: ${requirement.budget_range}
    - Preferences: Dietary: ${requirement.preferences.dietary.join(', ')}, Accommodation: ${requirement.preferences.accommodation.join(', ')}
    - Notes: ${requirement.notes || 'None'}

    【Output Requirement】
    You MUST return ONLY a JSON object that strictly adheres to the schema defined below.
    The response (issue descriptions and suggestions) MUST be in Traditional Chinese (繁體中文).
    The tone should be professional, polite, and helpful (like a senior travel consultant).
    
    ${schemaContent}
    
    Constraint: No Markdown blocks, no preamble, no postamble. Just pure JSON.
  `

  const startTime = Date.now()
  let responseText = ''
  let errorCode: string | undefined

  try {
    const result = await withRetry(() => model.generateContent(systemPrompt))
    const response = await result.response
    responseText = response.text().trim()
  } catch (err: any) {
    errorCode = err.status?.toString() || err.message
    throw err
  } finally {
    const duration = Date.now() - startTime
    logAiAudit({
      prompt: systemPrompt,
      response: responseText,
      model: modelName,
      duration_ms: duration,
      error_code: errorCode
    })
  }

  const cleanJson = responseText.replace(/^```json/, '').replace(/```$/, '').trim()
  const parsedData = JSON.parse(cleanJson)
  
  return gapAnalysisSchema.parse(parsedData)
}
