import { describe, it, expect, vi, beforeEach } from 'vitest'
import { verifyItinerary } from './itinerary-verifier'
import { cachedPlacesService } from '../services/google-places-cache'
import { Itinerary } from '@/schemas/itinerary'
import { RouteConcept } from '@/schemas/route'

vi.mock('../services/google-places-cache', () => ({
  cachedPlacesService: {
    getPlaceDetails: vi.fn()
  }
}))

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              deviations: [
                {
                  day: 1,
                  activity: "Osaka Castle",
                  message: "Activity Osaka Castle deviates from planned location Tokyo"
                }
              ]
            })
          }
        })
      })
    }))
  }
})

describe('Itinerary Verifier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GEMINI_API_KEY', 'test_key')
  })

  it('detects when a place is closed on the scheduled day', async () => {
    const mockItinerary: Itinerary = {
      days: [
        {
          day: 1,
          date: '2026-03-30', // Monday
          activities: [
            { time_slot: 'Morning', activity: 'Closed Museum', description: 'Test' }
          ],
          meals: { breakfast: 'B', lunch: 'L', dinner: 'D' },
          accommodation: 'Hotel'
        }
      ]
    }

    const mockGroundingMetadata = {
      groundingChunks: [{ placeId: 'place_closed_mon', title: 'Closed Museum' }],
      groundingSupports: [
        { segment: { text: 'Closed Museum' }, groundingChunkIndices: [0] }
      ]
    }

    vi.mocked(cachedPlacesService.getPlaceDetails).mockResolvedValue({
      id: 'place_closed_mon',
      regularOpeningHours: {
        periods: [
          // Open Tue-Sun (1-0), Closed Mon (1)
          { open: { day: 2, hour: 9, minute: 0 }, close: { day: 2, hour: 17, minute: 0 } },
          { open: { day: 3, hour: 9, minute: 0 }, close: { day: 3, hour: 17, minute: 0 } },
          { open: { day: 4, hour: 9, minute: 0 }, close: { day: 4, hour: 17, minute: 0 } },
          { open: { day: 5, hour: 9, minute: 0 }, close: { day: 5, hour: 17, minute: 0 } },
          { open: { day: 6, hour: 9, minute: 0 }, close: { day: 6, hour: 17, minute: 0 } },
          { open: { day: 0, hour: 9, minute: 0 }, close: { day: 0, hour: 17, minute: 0 } }
        ]
      }
    })

    const result = await verifyItinerary(mockItinerary, mockGroundingMetadata)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].type).toBe('opening_hours')
    expect(result.errors[0].message).toContain('可能公休')
  })

  it('passes when everything is open', async () => {
    const mockItinerary: Itinerary = {
      days: [
        {
          day: 1,
          date: '2026-03-31', // Tuesday
          activities: [
            { time_slot: 'Morning', activity: 'Open Place', description: 'Test' }
          ],
          meals: { breakfast: 'B', lunch: 'L', dinner: 'D' },
          accommodation: 'Hotel'
        }
      ]
    }

    const mockGroundingMetadata = {
      groundingChunks: [{ placeId: 'place_open_tue', title: 'Open Place' }],
      groundingSupports: [
        { segment: { text: 'Open Place' }, groundingChunkIndices: [0] }
      ]
    }

    vi.mocked(cachedPlacesService.getPlaceDetails).mockResolvedValue({
      id: 'place_open_tue',
      regularOpeningHours: {
        periods: [{ open: { day: 2, hour: 0, minute: 0 } }] // Always open Tue
      }
    })

    const result = await verifyItinerary(mockItinerary, mockGroundingMetadata)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('detects route deviation when an activity is completely unrelated to the route location', async () => {
    const mockItinerary: Itinerary = {
      days: [
        {
          day: 1,
          date: '2026-05-01',
          activities: [
            { time_slot: 'Morning', activity: 'Osaka Castle', description: 'Osaka' }
          ],
          meals: { breakfast: 'B', lunch: 'L', dinner: 'D' },
          accommodation: 'Hotel'
        }
      ]
    }
    
    const mockRoute: RouteConcept = {
      total_days: 1,
      rationale: '',
      nodes: [
        { day: 1, location: 'Tokyo', description: 'Stay in Tokyo' }
      ]
    }

    const result = await verifyItinerary(mockItinerary, null, mockRoute)
    expect(result.valid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'route_deviation',
          item: 'Osaka Castle',
          day: 1
        })
      ])
    )
  })
})
