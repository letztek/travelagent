import { describe, it, expect, vi, beforeEach } from 'vitest'
import { groundItinerary } from './grounding'
import { cachedPlacesService } from '../../services/google-places-cache'
import { createClient } from '@/lib/supabase/server'
import { Itinerary } from '@/schemas/itinerary'

vi.mock('../../services/google-places-cache', () => ({
  cachedPlacesService: {
    searchText: vi.fn()
  }
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}))

describe('Itinerary Grounding Cache Logic', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user_123' } } })
      }
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase)
  })

  it('populates cache for activities, meals, and accommodation but does NOT save to user_favorites', async () => {
    const mockItinerary: Itinerary = {
      days: [
        {
          day: 1,
          date: '2026-03-25',
          activities: [
            { time_slot: 'Morning', activity: 'Cool Spot', description: 'Fun' }
          ],
          meals: { breakfast: 'Hotel', lunch: 'Yummy Food', dinner: '' },
          accommodation: 'Fancy Hotel'
        }
      ]
    }

    vi.mocked(cachedPlacesService.searchText).mockResolvedValue([{
      id: 'place_id_123',
      displayName: { text: 'Place Name' }
    }])

    await groundItinerary(mockItinerary)

    // Verify cache service was called for each non-empty item (except generic ones)
    expect(cachedPlacesService.searchText).toHaveBeenCalledWith('Cool Spot')
    expect(cachedPlacesService.searchText).toHaveBeenCalledWith('Yummy Food')
    expect(cachedPlacesService.searchText).toHaveBeenCalledWith('Fancy Hotel')
    
    // Skip Hotel because it's generic
    expect(cachedPlacesService.searchText).not.toHaveBeenCalledWith('Hotel')

    // IMPORTANT: Verify NO insert into user_favorites
    expect(mockSupabase.from).not.toHaveBeenCalledWith('user_favorites')
  })
})
