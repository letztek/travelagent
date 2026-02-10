import { expect, test, vi } from 'vitest'
import { runRoutePlannerSkill } from './route-planner'

// Mock Gemini SDK
vi.mock('@google/generative-ai', () => ({
  SchemaType: { OBJECT: 'OBJECT', STRING: 'STRING', INTEGER: 'INTEGER', ARRAY: 'ARRAY' },
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            nodes: [
              { day: 1, location: 'Sendai', description: 'Arrive', transport: 'Flight' }
            ],
            rationale: 'Best route',
            total_days: 1
          })
        }
      })
    })
  }))
}))

test('runRoutePlannerSkill produces valid route', async () => {
  vi.stubEnv('GEMINI_API_KEY', 'fake-key')
  vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', '')

  const requirement = {
    origin: 'Taipei',
    destinations: ['Tohoku'],
    travel_dates: { start: '2026-06-01', end: '2026-06-02' },
    travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
    budget_range: 'Mid',
    preferences: { dietary: [], accommodation: [] },
    notes: ''
  }

  const result = await runRoutePlannerSkill(requirement as any)
  expect(result.nodes).toHaveLength(1)
  expect(result.rationale).toBe('Best route')
})
