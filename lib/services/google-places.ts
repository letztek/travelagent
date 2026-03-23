import { GooglePlaceResult } from '../types/google-places'
import { logger } from '../utils/logger'

const PLACES_API_URL = 'https://places.googleapis.com/v1/places'

export class GooglePlacesService {
  private apiKey: string

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GOOGLE_PLACES_API_KEY
    if (!key) {
      throw new Error('GOOGLE_PLACES_API_KEY is not set')
    }
    this.apiKey = key
  }

  /**
   * Search for a place using text query.
   */
  async searchText(query: string, languageCode: string = 'zh-TW'): Promise<GooglePlaceResult[]> {
    try {
      const response = await fetch(`${PLACES_API_URL}:searchText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.regularOpeningHours,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.types,places.primaryType'
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error(`Google Places API Error: ${response.status} - ${errorText}`)
        throw new Error(`Google Places API Error: ${response.status}`)
      }

      const data = await response.json()
      return data.places || []
    } catch (error) {
      logger.error('Failed to search text in Google Places API', error)
      throw error
    }
  }

  /**
   * Get place details by ID.
   */
  async getPlaceDetails(placeId: string, languageCode: string = 'zh-TW'): Promise<GooglePlaceResult> {
    try {
      const response = await fetch(`${PLACES_API_URL}/${placeId}?languageCode=${languageCode}`, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,regularOpeningHours,rating,userRatingCount,websiteUri,nationalPhoneNumber,types,primaryType'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error(`Google Places API Error: ${response.status} - ${errorText}`)
        throw new Error(`Google Places API Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      logger.error(`Failed to get place details for ${placeId}`, error)
      throw error
    }
  }
}

// Export a singleton instance for easier use
export const placesService = new GooglePlacesService(process.env.GOOGLE_PLACES_API_KEY || 'mock-key-for-build')
