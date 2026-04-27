import { expect, test, vi, beforeEach } from 'vitest'
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

describe('Itinerary Generator Distance Matrix Toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GEMINI_API_KEY', 'fake-key')
  })

  test('runItinerarySkill includes distance matrix in prompt when enabled', async () => {
    vi.stubEnv('GOOGLE_DISTANCE_MATRIX_ENABLED', 'true')
    
    const requirement = {
      travel_dates: { start: '2026-06-01', end: '2026-06-02' },
      travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
      budget_range: 'Mid',
      preferences: { dietary: [], accommodation: [] },
      notes: 'Test'
    }

    const favorites = [
      { name: 'Spot A' },
      { name: 'Spot B' }
    ]

    const distanceMatrix = {
      rows: [
        {
          elements: [
            { status: 'OK', duration: { text: '0 mins' }, distance: { text: '0 km' } },
            { status: 'OK', duration: { text: '10 mins' }, distance: { text: '5 km' } }
          ]
        }
      ]
    }
    
    await runItinerarySkill(requirement as any, undefined, favorites as any, distanceMatrix as any)
    
    const call = vi.mocked(mockModel.generateContent).mock.calls[0][0] as string
    expect(call).toContain('【交通距離與時程參考 (Distance Matrix)】')
    expect(call).toContain('從 Spot A 到 Spot B: 10 mins (5 km)')
  })

  test('runItinerarySkill includes distance matrix in prompt even with one favorite', async () => {
    vi.stubEnv('GOOGLE_DISTANCE_MATRIX_ENABLED', 'true')
    
    const requirement = {
      travel_dates: { start: '2026-06-01', end: '2026-06-02' },
      travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
      budget_range: 'Mid',
      preferences: { dietary: [], accommodation: [] },
      notes: 'Test'
    }

    const favorites = [
      { name: 'Only Spot' }
    ]

    const distanceMatrix = {
      rows: [
        {
          elements: [
            { status: 'OK', duration: { text: '15 mins' }, distance: { text: '2 km' } }
          ]
        }
      ]
    }
    
    await runItinerarySkill(requirement as any, undefined, favorites as any, distanceMatrix as any)
    
    const call = vi.mocked(mockModel.generateContent).mock.calls[0][0] as string
    expect(call).toContain('【交通距離與時程參考 (Distance Matrix)】')
  })

  test('runItinerarySkill excludes distance matrix in prompt when disabled', async () => {
    vi.stubEnv('GOOGLE_DISTANCE_MATRIX_ENABLED', 'false')
    
    const requirement = {
      travel_dates: { start: '2026-06-01', end: '2026-06-02' },
      travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
      budget_range: 'Mid',
      preferences: { dietary: [], accommodation: [] },
      notes: 'Test'
    }

    const distanceMatrix = { rows: [] }
    
    await runItinerarySkill(requirement as any, undefined, [], distanceMatrix as any)
    
    const call = vi.mocked(mockModel.generateContent).mock.calls[0][0] as string
    expect(call).not.toContain('【交通距離與時程參考 (Distance Matrix)】')
  })
})
