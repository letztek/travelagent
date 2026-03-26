import { GooglePlaceResult } from '../types/google-places'
import { GooglePlacesService } from './google-places'
import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '../utils/logger'

const CACHE_TTL_DAYS = 90

export class CachedGooglePlacesService {
  private service: GooglePlacesService

  constructor(service: GooglePlacesService) {
    this.service = service
  }

  private async getFromCache(key: string): Promise<any | null> {
    try {
      const supabase = await createAdminClient()
      const { data, error } = await supabase
        .from('place_cache')
        .select('data, expires_at')
        .eq('cache_key', key)
        .single()

      if (error || !data) return null

      const expiresAt = new Date(data.expires_at)
      if (expiresAt < new Date()) {
        return null
      }

      return data.data
    } catch (error) {
      logger.error('Cache read error', error)
      return null
    }
  }

  private async setToCache(key: string, data: any): Promise<void> {
    try {
      const supabase = await createAdminClient()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS)

      await supabase.from('place_cache').upsert({
        cache_key: key,
        data,
        expires_at: expiresAt.toISOString()
      })
    } catch (error) {
      logger.error('Cache write error', error)
    }
  }

  async searchText(query: string, languageCode: string = 'zh-TW'): Promise<GooglePlaceResult[]> {
    const cacheKey = `search:${query}:${languageCode}`
    const cached = await this.getFromCache(cacheKey)
    if (cached) return cached

    const results = await this.service.searchText(query, languageCode)
    await this.setToCache(cacheKey, results)
    return results
  }

  async getPlaceDetails(placeId: string, languageCode: string = 'zh-TW'): Promise<GooglePlaceResult> {
    const cacheKey = `details:${placeId}:${languageCode}`
    const cached = await this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.service.getPlaceDetails(placeId, languageCode)
    await this.setToCache(cacheKey, result)
    return result
  }
}

// Export a singleton instance
import { placesService } from './google-places'
export const cachedPlacesService = new CachedGooglePlacesService(placesService)
