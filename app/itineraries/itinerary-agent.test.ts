import { expect, test, vi } from 'vitest'
import { refineItineraryWithAI } from './itinerary-agent'
import { Itinerary } from '@/schemas/itinerary'

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => ({
  SchemaType: {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    ARRAY: 'ARRAY',
    INTEGER: 'INTEGER',
  },
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            thought: 'User wants recommendations',
            analysis: {
              status: 'green',
              message: 'Suggestion provided'
            },
            proposed_itinerary: {
              days: [{
                day: 1,
                date: '2026-06-01',
                activities: [],
                meals: { breakfast: 'B', lunch: 'L', dinner: 'Sushi' },
                accommodation: 'Hotel'
              }]
            }
          })
        }
      })
    })
  }))
}))

const mockItinerary: Itinerary = {
  days: [{
    day: 1,
    date: '2026-06-01',
    activities: [],
    meals: { breakfast: 'B', lunch: 'L', dinner: 'D' },
    accommodation: 'Hotel'
  }]
}

test('refineItineraryWithAI returns structured suggestion', async () => {
  vi.stubEnv('GEMINI_API_KEY', 'fake-key')
  const result = await refineItineraryWithAI(
    mockItinerary, 
    { dayIndex: 0, type: 'meal', itemId: 'dinner' }, 
    'Recommend sushi'
  )
  
  expect(result.success).toBe(true)
  expect(result.data).toBeDefined()
  if (result.success && result.data) {
    expect(result.data.thought).toBe('User wants recommendations')
    expect(result.data.analysis.status).toBe('green')
    expect(result.data.proposed_itinerary.days[0].meals.dinner).toBe('Sushi')
  }
})
