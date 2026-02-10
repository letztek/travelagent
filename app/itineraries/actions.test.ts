import { expect, test, vi } from 'vitest'
import { generateItinerary } from './actions'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'itinerary-123' }, error: null }))
        }))
      })),
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

// Mock Gemini SDK
vi.mock('@google/generative-ai', () => ({
  SchemaType: {
    OBJECT: 'OBJECT',
    ARRAY: 'ARRAY',
    INTEGER: 'INTEGER',
    STRING: 'STRING',
  },
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
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
        }
      })
    })
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
  expect(result.success).toBe(true)
  expect(result.data?.id).toBe('itinerary-123')
})
