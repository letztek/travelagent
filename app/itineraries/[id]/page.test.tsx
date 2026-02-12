import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import ItineraryPage from './page'

// Mock the server action
vi.mock('../actions', () => ({
  getItinerary: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      id: 'it-123',
      content: {
        days: [
          {
            day: 1,
            date: '2026-06-01',
            activities: [
              { time_slot: 'Morning', activity: 'Sightseeing', description: 'Fun times' }
            ],
            meals: { breakfast: 'Hotel', lunch: 'Local', dinner: 'City' },
            accommodation: 'Grand Hotel'
          }
        ]
      }
    }
  }))
}))

// Mock ItineraryEditor
vi.mock('./components/ItineraryEditor', () => ({
  default: ({ itinerary }: any) => (
    <div>
      <div>Day 1 - 2026-06-01</div>
      <div>Sightseeing</div>
      <div>Grand Hotel</div>
    </div>
  )
}))

test('ItineraryPage renders itinerary details', async () => {
  const params = Promise.resolve({ id: 'it-123' })
  const Page = await ItineraryPage({ params })
  render(Page)
  
  expect(screen.getByText(/Day 1 - 2026-06-01/i)).toBeDefined()
  expect(screen.getByText(/Sightseeing/i)).toBeDefined()
  expect(screen.getByText(/Grand Hotel/i)).toBeDefined()
})
