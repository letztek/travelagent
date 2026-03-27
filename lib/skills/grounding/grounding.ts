import { Itinerary } from '@/schemas/itinerary'
import { cachedPlacesService } from '../../services/google-places-cache'

async function groundAndCache(query: string) {
  if (!query || query.length < 2) return

  // Skip very generic terms that might trigger too many false positives
  const genericTerms = ['Hotel', 'Restaurant', 'Cafe', 'Airport', 'Station', '飯店', '酒店', '餐廳', '機場', '車站']
  if (genericTerms.includes(query)) return

  try {
    // Calling searchText will automatically populate the local place_cache via CachedGooglePlacesService
    await cachedPlacesService.searchText(query)
  } catch (error) {
    console.error(`Failed to ground and cache query "${query}":`, error)
  }
}

/**
 * Grounds an itinerary by pre-fetching and caching Google Maps metadata 
 * for all its activities, meals, and accommodations.
 * This populates the local cache to be used by the AI in subsequent steps.
 */
export async function groundItinerary(itinerary: Itinerary): Promise<Itinerary> {
  const newItinerary = JSON.parse(JSON.stringify(itinerary)) as Itinerary

  for (const day of newItinerary.days) {
    // 1. Ground Activities
    for (const activity of day.activities) {
      await groundAndCache(activity.activity)
    }

    // 2. Ground Meals
    if (day.meals.breakfast) await groundAndCache(day.meals.breakfast)
    if (day.meals.lunch) await groundAndCache(day.meals.lunch)
    if (day.meals.dinner) await groundAndCache(day.meals.dinner)

    // 3. Ground Accommodation
    if (day.accommodation) await groundAndCache(day.accommodation)
  }

  return newItinerary
}
