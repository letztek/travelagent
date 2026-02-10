import { expect, test } from 'vitest'
import { itinerarySchema } from './itinerary'

test('itinerarySchema validates correct data', () => {
  const validData = {
    days: [
      {
        day: 1,
        date: '2026-06-01',
        activities: [
          {
            time_slot: 'Morning',
            activity: 'Arrive at Alishan',
            description: 'Check-in and prepare for the tour.',
          }
        ],
        meals: {
          breakfast: 'Included',
          lunch: 'Local Restaurant',
          dinner: 'Hotel',
        },
        accommodation: 'Alishan Hotel',
      }
    ]
  }

  const result = itinerarySchema.safeParse(validData)
  expect(result.success).toBe(true)
})

test('itinerarySchema fails on missing required fields', () => {
  const invalidData = {
    days: [
      {
        day: 1,
        // missing date
        activities: [],
      }
    ]
  }

  const result = itinerarySchema.safeParse(invalidData)
  expect(result.success).toBe(false)
})
