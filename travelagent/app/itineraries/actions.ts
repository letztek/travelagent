'use server'

import { runItinerarySkill } from '@/lib/skills/itinerary-generator'
import { type Requirement } from '@/schemas/requirement'
import { getSupabase } from '@/lib/supabase'

export async function generateItinerary(requirement: Requirement, requirementId: string) {
  try {
    const itineraryData = await runItinerarySkill(requirement)
    
    // Save to Supabase
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('itineraries')
      .insert([
        {
          requirement_id: requirementId,
          content: itineraryData
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase Insertion Error:', error)
      return { success: false, error: 'Failed to save itinerary to database' }
    }

    return { success: true, data: data } // Returns the inserted itinerary record (including id)
  } catch (error: any) {
    console.error('AI Generation Error:', error)
    return { success: false, error: error.message || 'Failed to generate itinerary' }
  }
}
