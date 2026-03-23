'use server'

import { cachedPlacesService } from '@/lib/services/google-places-cache'
import { createFavorite, FavoriteType } from './actions'

/**
 * Enhanced action to save a favorite with Google Places grounding.
 */
export async function createFavoriteWithGrounding(data: {
  name: string;
  type: FavoriteType;
  description?: string;
}) {
  try {
    // 1. Attempt to find the place on Google Maps
    const searchResults = await cachedPlacesService.searchText(data.name)
    const place = searchResults[0]

    if (place) {
      // 2. If found, save with metadata
      return await createFavorite({
        name: data.name,
        type: data.type,
        description: data.description || '',
        tags: [],
        location_data: {},
        google_place_id: place.id,
        metadata: place
      })
    } else {
      // 3. Fallback to normal save if not found
      return await createFavorite({
        name: data.name,
        type: data.type,
        description: data.description || '',
        tags: [],
        location_data: {}
      })
    }
  } catch (error) {
    console.error('Failed to create favorite with grounding:', error)
    // Fallback save
    return await createFavorite({
      name: data.name,
      type: data.type,
      description: data.description || '',
      tags: [],
      location_data: {}
    })
  }
}
