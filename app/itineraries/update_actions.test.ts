import { expect, test, vi } from 'vitest'
import { updateItinerary } from './actions'

// Mock Supabase Server Client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 'itinerary-123', content: {} }, error: null }))
          }))
        }))
      }))
    }))
  }))
}))

test('updateItinerary successfully updates data', async () => {
  const itineraryId = 'itinerary-123'
  const newContent = {
    days: [
      {
        day: 1,
        date: '2026-06-01',
        activities: [],
        meals: { breakfast: 'B', lunch: 'L', dinner: 'D' },
        accommodation: 'Acc'
      }
    ]
  }

  const result = await updateItinerary(itineraryId, newContent as any)
  expect(result.success).toBe(true)
  expect(result.data?.id).toBe('itinerary-123')
})
