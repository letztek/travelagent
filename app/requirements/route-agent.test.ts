import { expect, test, vi } from 'vitest'
import { refineRouteWithAI } from './route-agent'
import { RouteConcept } from '@/schemas/route'

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
            thought: 'User wants to add a stop',
            analysis: {
              status: 'green',
              message: 'Route looks good'
            },
            proposed_route: {
              nodes: [
                { day: 1, location: 'Tokyo', description: 'Arrival' },
                { day: 2, location: 'Osaka', description: 'Added stop' },
                { day: 3, location: 'Kyoto', description: 'Temple visit' }
              ],
              rationale: 'Updated route',
              total_days: 3
            }
          })
        }
      })
    })
  }))
}))

const mockConcept: RouteConcept = {
  nodes: [
    { day: 1, location: 'Tokyo', description: 'Arrival' },
    { day: 2, location: 'Kyoto', description: 'Temple visit' },
  ],
  rationale: 'Original route',
  total_days: 2,
}

test('refineRouteWithAI returns structured suggestion', async () => {
  vi.stubEnv('GEMINI_API_KEY', 'fake-key')
  const result = await refineRouteWithAI(mockConcept, 'Add Osaka before Kyoto')
  
  expect(result.success).toBe(true)
  expect(result.data).toBeDefined()
  if (result.success && result.data) {
    expect(result.data.thought).toBe('User wants to add a stop')
    expect(result.data.analysis.status).toBe('green')
    expect(result.data.proposed_route.nodes.length).toBe(3)
    expect(result.data.proposed_route.nodes[1].location).toBe('Osaka')
  }
})
