'use server'

import { runItinerarySkill } from '@/lib/skills/itinerary-generator'
import { type Requirement } from '@/schemas/requirement'

export async function generateItinerary(requirement: Requirement) {
  try {
    const data = await runItinerarySkill(requirement)
    return { success: true, data }
  } catch (error: any) {
    console.error('AI Generation Error:', error)
    return { success: false, error: error.message || 'Failed to generate itinerary' }
  }
}