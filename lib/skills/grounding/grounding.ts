import { Itinerary } from '@/schemas/itinerary'
import { cachedPlacesService } from '../../services/google-places-cache'
import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

async function saveToFavorites(
  supabase: SupabaseClient, 
  userId: string, 
  query: string, 
  type: 'spot' | 'accommodation' | 'food'
) {
  if (!query || query.length < 2) return

  // Skip very generic terms that might trigger too many false positives
  const genericTerms = ['Hotel', 'Restaurant', 'Cafe', 'Airport', 'Station', '飯店', '酒店', '餐廳', '機場', '車站']
  if (genericTerms.includes(query)) return

  try {
    const results = await cachedPlacesService.searchText(query)
    if (results && results.length > 0) {
      const place = results[0]
      
      // Check if already exists in favorites (deduplication)
      const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('google_place_id', place.id)
        .single()

      if (!existing) {
        // Auto-save new place
        await supabase.from('user_favorites').insert({
          user_id: userId,
          name: place.displayName?.text || query,
          type,
          google_place_id: place.id,
          metadata: place,
          location_data: place.location
        })
      }
    }
  } catch (error) {
    console.error(`Failed to auto-save ${type} for query "${query}":`, error)
  }
}

export async function groundItinerary(itinerary: Itinerary): Promise<Itinerary> {
  const newItinerary = JSON.parse(JSON.stringify(itinerary)) as Itinerary
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return newItinerary

  for (const day of newItinerary.days) {
    // 1. Ground Activities
    for (const activity of day.activities) {
      await saveToFavorites(supabase, user.id, activity.activity, 'spot')
    }

    // 2. Ground Meals
    if (day.meals.breakfast) await saveToFavorites(supabase, user.id, day.meals.breakfast, 'food')
    if (day.meals.lunch) await saveToFavorites(supabase, user.id, day.meals.lunch, 'food')
    if (day.meals.dinner) await saveToFavorites(supabase, user.id, day.meals.dinner, 'food')

    // 3. Ground Accommodation
    if (day.accommodation) await saveToFavorites(supabase, user.id, day.accommodation, 'accommodation')
  }

  return newItinerary
}
