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

describe('Itinerary Generator RAG requirements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GEMINI_API_KEY', 'fake-key')
  })

  test('runItinerarySkill assigns Ref IDs and requires strict identity', async () => {
    const requirement = {
      travel_dates: { start: '2026-06-01', end: '2026-06-02' },
      travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
      budget_range: 'Mid',
      preferences: { dietary: [], accommodation: [] },
      notes: 'Test'
    }

    const favorites = [
      { name: 'My Favorite Spot', type: 'spot', description: 'Hidden gem' }
    ]
    
    await runItinerarySkill(requirement as any, undefined, favorites as any)
    
    const call = vi.mocked(mockModel.generateContent).mock.calls[0][0] as string
    
    // Check for Ref ID assignment
    expect(call).toContain('[Ref ID: 0]')
    
    // Check for Strict Identity instruction
    expect(call).toContain('【精準身份對齊 (Strict Identity Alignment)】')
    expect(call).toContain('直接複製')
    expect(call).toContain('Ref ID')
  })

  test('runItinerarySkill includes intent-based filtering instruction', async () => {
    const requirement = {
      travel_dates: { start: '2026-06-01', end: '2026-06-02' },
      travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
      budget_range: 'Mid',
      preferences: { dietary: [], accommodation: [] },
      notes: 'Test intent: Hiking'
    }

    const favorites = [
      { name: 'Hiking Trail', type: 'spot' }
    ]
    
    await runItinerarySkill(requirement as any, undefined, favorites as any)
    
    const call = vi.mocked(mockModel.generateContent).mock.calls[0][0] as string
    
    // Check for Intent Filtering instruction
    expect(call).toContain('【意圖感知過濾 (Intent-based Filtering)】')
    expect(call).toContain('僅選取符合本次行程主題')
  })

  test('runItinerarySkill does not contain hardcoded examples in instructions', async () => {
    const requirement = {
      travel_dates: { start: '2026-06-01', end: '2026-06-02' },
      travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
      budget_range: 'Mid',
      preferences: { dietary: [], accommodation: [] },
      notes: 'Test'
    }

    const favorites = [
      { name: 'Any Spot', type: 'spot' }
    ]
    
    await runItinerarySkill(requirement as any, undefined, favorites as any)
    
    const call = vi.mocked(mockModel.generateContent).mock.calls[0][0] as string
    
    // Should NOT contain specific examples like "台北故宮"
    expect(call).not.toContain('台北故宮')
    expect(call).not.toContain('國立故宮博物院')
  })

  test('runItinerarySkill includes category alignment instruction', async () => {
    const requirement = {
      travel_dates: { start: '2026-06-01', end: '2026-06-02' },
      travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
      budget_range: 'Mid',
      preferences: { dietary: [], accommodation: [] },
      notes: 'Test'
    }

    const favorites = [
      { name: 'Famous Restaurant', type: 'food' }
    ]
    
    await runItinerarySkill(requirement as any, undefined, favorites as any)
    
    const call = vi.mocked(mockModel.generateContent).mock.calls[0][0] as string
    
    expect(call).toContain('【類別屬性對齊】')
    expect(call).toContain('[餐廳]')
    expect(call).toContain('meals')
  })
})
