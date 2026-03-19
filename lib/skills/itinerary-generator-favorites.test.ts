import { expect, test, vi } from 'vitest'
import { runItinerarySkill } from './itinerary-generator'
import { GoogleGenerativeAI } from '@google/generative-ai'

const mockModel = {
  generateContent: vi.fn().mockResolvedValue({
    response: {
      text: () => JSON.stringify({
        title: 'Test',
        days: [
          {
            day: 1,
            date: '2026-06-01',
            activities: [],
            meals: { breakfast: 'B', lunch: 'L', dinner: 'D' },
            accommodation: 'Acc'
          }
        ]
      })
    }
  })
}

vi.mock('@google/generative-ai', () => ({
  SchemaType: { OBJECT: 'OBJECT', STRING: 'STRING', INTEGER: 'INTEGER', ARRAY: 'ARRAY' },
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue(mockModel)
  }))
}))

vi.mock('../supabase/audit', () => ({
  logAiAudit: vi.fn().mockResolvedValue({ success: true })
}))

test('runItinerarySkill includes user favorites in prompt', async () => {
  vi.stubEnv('GEMINI_API_KEY', 'fake-key')
  
  const requirement = {
    travel_dates: { start: '2026-06-01', end: '2026-06-02' },
    travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
    budget_range: 'Mid',
    preferences: { dietary: [], accommodation: [] },
    notes: 'Test'
  }

  const favorites = [
    { name: 'My Favorite Spot', type: 'spot', description: 'Hidden gem', tags: ['secret'] }
  ]
  
  await runItinerarySkill(requirement as any, undefined, favorites as any)
  
  const call = vi.mocked(mockModel.generateContent).mock.calls[0][0] as string
  expect(call).toContain('【使用者私房最愛名單】')
  expect(call).toContain('My Favorite Spot')
})
