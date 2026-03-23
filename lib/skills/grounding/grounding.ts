import { Itinerary } from '@/schemas/itinerary'
import { placesService } from '../../services/google-places'

export async function groundItinerary(itinerary: Itinerary): Promise<Itinerary> {
  const newItinerary = JSON.parse(JSON.stringify(itinerary)) as Itinerary

  for (const day of newItinerary.days) {
    for (const activity of day.activities) {
      try {
        const results = await placesService.searchText(activity.activity)
        if (results && results.length > 0) {
          // Add metadata or verify opening hours here if needed in the future
          // For now, it exists.
        } else {
          activity.description += ' [Warning: Place not found in Google Maps]'
        }
      } catch (error) {
        console.error('Failed to ground activity:', activity.activity, error)
      }
    }
  }

  return newItinerary
}
