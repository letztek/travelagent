import { describe, it, expect, vi, beforeEach } from 'vitest'
import { groundItinerary } from './grounding'
import { placesService } from '../../services/google-places'
import { Itinerary } from '@/schemas/itinerary'

vi.mock('../../services/google-places', () => ({
  placesService: {
    searchText: vi.fn()
  }
}))

describe('Itinerary Grounding Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates a place that exists and is open', async () => {
    const mockItinerary: Itinerary = {
      days: [
        {
          day: 1,
          date: '2026-03-25', // A Wednesday
          activities: [
            { time_slot: 'Morning', activity: 'Taipei 101', description: 'Visit the tower' }
          ],
          meals: { breakfast: 'Hotel', lunch: 'Din Tai Fung', dinner: 'Night Market' },
          accommodation: 'Grand Hyatt'
        }
      ]
    }

    vi.mocked(placesService.searchText).mockResolvedValue([{
      id: 'place_id_123',
      displayName: { text: 'Taipei 101', languageCode: 'zh-TW' },
      regularOpeningHours: {
        openNow: true,
        periods: [
          { open: { day: 3, hour: 9, minute: 0 }, close: { day: 3, hour: 22, minute: 0 } } // Open Wednesday 9-22
        ]
      }
    }])

    const grounded = await groundItinerary(mockItinerary)
    expect(placesService.searchText).toHaveBeenCalledWith('Taipei 101')
    expect(grounded.days[0].activities[0].activity).toBe('Taipei 101')
    // We expect it to add some metadata to the activity perhaps, but at least not change the name
  })

  it('flags or replaces a place if it does not exist', async () => {
    const mockItinerary: Itinerary = {
      days: [
        {
          day: 1,
          date: '2026-03-25',
          activities: [
            { time_slot: 'Morning', activity: 'NonExistent Place 999', description: 'Fake' }
          ],
          meals: { breakfast: '', lunch: '', dinner: '' },
          accommodation: ''
        }
      ]
    }

    // Return empty array to simulate place not found
    vi.mocked(placesService.searchText).mockResolvedValue([])

    // Our grounding function might throw or return a warning object, 
    // let's say it updates the description to warn the user for now
    const grounded = await groundItinerary(mockItinerary)
    expect(grounded.days[0].activities[0].description).toContain('[Warning: Place not found in Google Maps]')
  })
})
