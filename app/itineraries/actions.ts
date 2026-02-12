'use server'

import { runItinerarySkill } from '@/lib/skills/itinerary-generator'
import { itinerarySchema, type Itinerary } from '@/schemas/itinerary'
import { type Requirement } from '@/schemas/requirement'
import { createClient } from '@/lib/supabase/server'
import { RouteConcept } from '@/schemas/route'

export async function generateItinerary(requirement: Requirement, requirementId: string, routeConcept?: RouteConcept) {
  try {
    const itineraryData = await runItinerarySkill(requirement, routeConcept)
    
    // Save to Supabase
    const supabase = await createClient()
    
    // Get current user session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('itineraries')
      .insert([
        {
          requirement_id: requirementId,
          content: itineraryData,
          user_id: user.id
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

export async function regenerateItinerary(itineraryId: string) {
  try {
    const supabase = await createClient()
    
    // 1. Get original itinerary to find requirement_id
    const { data: original, error: getError } = await supabase
      .from('itineraries')
      .select('requirement_id, requirements(id, origin, destinations, travel_dates, travelers, budget_range, preferences, notes), route_concepts(content)')
      .eq('id', itineraryId)
      .single()

    if (getError || !original) {
      return { success: false, error: '找不到原始行程或需求資料' }
    }

    const requirement = (original as any).requirements
    const routeConcept = (original as any).route_concepts?.content

    // 2. Run skill again
    const newItineraryData = await runItinerarySkill(requirement, routeConcept)

    // 3. Update existing itinerary
    const { data, error: updateError } = await supabase
      .from('itineraries')
      .update({ content: newItineraryData })
      .eq('id', itineraryId)
      .select()
      .single()

    if (updateError) {
      return { success: false, error: '更新行程失敗' }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('AI Regeneration Error:', error)
    return { success: false, error: error.message || '重新產生行程失敗' }
  }
}

export async function getItinerary(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Supabase error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getItineraries() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function updateItinerary(id: string, content: Itinerary) {
  // Validate content with Zod before saving
  const validated = itinerarySchema.safeParse(content)
  if (!validated.success) {
    return { success: false, error: validated.error.format() }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('itineraries')
    .update({ content: validated.data })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Supabase Update Error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

