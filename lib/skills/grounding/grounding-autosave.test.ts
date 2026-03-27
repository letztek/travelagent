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

describe('Itinerary Grounding Auto-save Logic', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user_123' } } })
      }
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase)
  })

  it('automatically saves a new place to user_favorites if found in Google but not in favorites', async () => {
    const mockItinerary: Itinerary = {
      days: [
        {
          day: 1,
          date: '2026-03-25',
          activities: [
            { time_slot: 'Morning', activity: 'New Place', description: 'Exciting' }
          ],
          meals: { breakfast: '', lunch: '', dinner: '' },
          accommodation: ''
        }
      ]
    }

    // 1. Google find the place
    vi.mocked(cachedPlacesService.searchText).mockResolvedValue([{
      id: 'google_id_abc',
      displayName: { text: 'New Place' },
      formattedAddress: '123 Test St',
      types: ['park']
    }])

    // 2. Favorites check: Not found
    mockSupabase.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } }) // PostgREST not found error

    // 3. Insert mock
    mockSupabase.insert.mockResolvedValue({ data: { id: 'fav_1' }, error: null })

    await groundItinerary(mockItinerary)

    expect(mockSupabase.from).toHaveBeenCalledWith('user_favorites')
    expect(mockSupabase.select).toHaveBeenCalled()
    expect(mockSupabase.eq).toHaveBeenCalledWith('google_place_id', 'google_id_abc')
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Place',
      google_place_id: 'google_id_abc',
      type: 'spot' // Default for activity
    }))
  })

  it('automatically saves meals to user_favorites', async () => {
    const mockItinerary: Itinerary = {
      days: [
        {
          day: 1,
          date: '2026-03-25',
          activities: [],
          meals: { breakfast: 'Hotel', lunch: 'Yummy Food', dinner: '' },
          accommodation: ''
        }
      ]
    }

    vi.mocked(cachedPlacesService.searchText).mockImplementation((query) => {
      if (query === 'Yummy Food') return Promise.resolve([{ id: 'food_123', displayName: { text: 'Yummy Food' } }])
      return Promise.resolve([])
    })

    mockSupabase.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

    await groundItinerary(mockItinerary)

    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Yummy Food',
      google_place_id: 'food_123',
      type: 'food'
    }))
  })

  it('automatically saves accommodation to user_favorites', async () => {
    const mockItinerary: Itinerary = {
      days: [
        {
          day: 1,
          date: '2026-03-25',
          activities: [],
          meals: { breakfast: '', lunch: '', dinner: '' },
          accommodation: 'Fancy Hotel'
        }
      ]
    }

    vi.mocked(cachedPlacesService.searchText).mockImplementation((query) => {
      if (query === 'Fancy Hotel') return Promise.resolve([{ id: 'acc_123', displayName: { text: 'Fancy Hotel' } }])
      return Promise.resolve([])
    })

    mockSupabase.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

    await groundItinerary(mockItinerary)

    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Fancy Hotel',
      google_place_id: 'acc_123',
      type: 'accommodation'
    }))
  })

  it('does not duplicate if place already exists in user_favorites', async () => {
    const mockItinerary: Itinerary = {
      days: [
        {
          day: 1,
          date: '2026-03-25',
          activities: [
            { time_slot: 'Morning', activity: 'Existing Place', description: 'Known' }
          ],
          meals: { breakfast: '', lunch: '', dinner: '' },
          accommodation: ''
        }
      ]
    }

    vi.mocked(cachedPlacesService.searchText).mockResolvedValue([{
      id: 'google_id_exists',
      displayName: { text: 'Existing Place' }
    }])

    // Favorites check: Found
    mockSupabase.single.mockResolvedValue({ data: { id: 'existing_fav_id' }, error: null })

    await groundItinerary(mockItinerary)

    expect(mockSupabase.insert).not.toHaveBeenCalled()
  })
})
