import { expect, test, vi } from 'vitest'
import { generateItinerary } from './actions'

// Mock runItinerarySkill
vi.mock('@/lib/skills/itinerary-generator', () => ({
  runItinerarySkill: vi.fn().mockResolvedValue({
    days: [
      {
        day: 1,
        date: '2026-06-01',
        activities: [{ time_slot: 'Morning', activity: 'Test', description: 'Test desc' }],
        meals: { breakfast: 'B', lunch: 'L', dinner: 'D' },
        accommodation: 'Acc'
      }
    ]
  })
}))

// Mock Supabase
const mockInsert = vi.fn(() => ({
  select: vi.fn(() => ({
    single: vi.fn(() => Promise.resolve({ data: { id: 'itinerary-123' }, error: null }))
  }))
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-123' } } })),
    },
    from: vi.fn(() => ({
      insert: mockInsert,
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'itinerary-123' }, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 'itinerary-123' }, error: null }))
          }))
        }))
      }))
    }))
  }))
}))

test('generateItinerary produces valid itinerary', async () => {
  vi.stubEnv('GEMINI_API_KEY', 'fake-key')
  const requirement = {
    travel_dates: { start: '2026-06-01', end: '2026-06-02' },
    travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
    budget_range: 'Mid',
    preferences: { dietary: [], accommodation: [] }
  }

  const result = await generateItinerary(requirement as any, 'req-123')
  
  expect(mockInsert).toHaveBeenCalledWith([
    expect.objectContaining({
      user_id: 'user-123'
    })
  ])
  
  expect(result.success).toBe(true)
  expect(result.data?.id).toBe('itinerary-123')
})