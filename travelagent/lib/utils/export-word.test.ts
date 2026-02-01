import { expect, test } from 'vitest'
import { generateItineraryDoc } from './export-word'
import { Itinerary } from '@/schemas/itinerary'

const mockItinerary: Itinerary = {
  days: [
    {
      day: 1,
      date: '2026-06-01',
      activities: [
        { time_slot: 'Morning', activity: 'Act 1', description: 'Desc 1' }
      ],
      meals: { breakfast: 'B', lunch: 'L', dinner: 'D' },
      accommodation: 'Acc'
    }
  ]
}

test('generateItineraryDoc creates a document blob', async () => {
  const blob = await generateItineraryDoc(mockItinerary)
  expect(blob).toBeDefined()
})
