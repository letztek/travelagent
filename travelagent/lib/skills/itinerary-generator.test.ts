import { expect, test, vi } from 'vitest'
import { runItinerarySkill } from './itinerary-generator'

// Mock Gemini SDK
vi.mock('@google/generative-ai', () => ({
  SchemaType: { OBJECT: 'OBJECT', STRING: 'STRING', INTEGER: 'INTEGER', ARRAY: 'ARRAY' },
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

test('runItinerarySkill produces valid itinerary', async () => {
  vi.stubEnv('GEMINI_API_KEY', 'fake-key')
  // Ensure legacy key is NOT present to verify we aren't falling back silently during transition (if we were supporting fallback, but spec says 'Unify')
  vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', '') 
  
  const requirement = {
    travel_dates: { start: '2026-06-01', end: '2026-06-02' },
    travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
    budget_range: 'Mid',
    preferences: { dietary: [], accommodation: [] },
    notes: 'Test'
  }

  const result = await runItinerarySkill(requirement as any)
  expect(result.days).toHaveLength(1)
  expect(result.days[0].day).toBe(1)
})
