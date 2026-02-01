import { expect, test, vi } from 'vitest'
import { generateItinerary } from './actions'

// Mock Gemini SDK
vi.mock('@google/generative-ai', () => ({
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
  const requirement = {
    travel_dates: { start: '2026-06-01', end: '2026-06-02' },
    travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
    budget_range: 'Mid',
    preferences: { dietary: [], accommodation: [] }
  }

  const result = await generateItinerary(requirement as any)
  expect(result.success).toBe(true)
  expect(result.data?.days).toHaveLength(1)
})
