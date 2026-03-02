import { expect, test, describe, vi, beforeEach } from 'vitest'
import { runImportParserSkill } from './import-parser'
import * as aiRetry from '../utils/ai-retry'

vi.mock('../supabase/audit', () => ({
  logAiAudit: vi.fn(),
}))

vi.mock('../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

describe('import-parser skill', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GEMINI_API_KEY = 'test-key'
  })

  test('runImportParserSkill extracts data successfully', async () => {
    // Mock the ai-retry wrapper to return a successful mock response
    vi.spyOn(aiRetry, 'withRetry').mockImplementationOnce(async (fn: any) => {
      return {
        response: {
          text: () => JSON.stringify({
            extracted_metadata: {
              destinations: ['東京', '大阪'],
              origin: '台北',
              travel_dates: { start: '2026-04-01', end: '2026-04-05' },
              travelers: { adult: 2, child: 0, infant: 0, senior: 0 },
              budget_range: '50000 TWD'
            },
            itinerary: {
              title: '日本櫻花季五日遊',
              days: [
                {
                  day: 1,
                  date: '2026-04-01',
                  activities: [
                    { time_slot: 'Morning', activity: '抵達關西機場', description: '辦理入境手續' }
                  ],
                  meals: { breakfast: '機上', lunch: '機場餐廳', dinner: '拉麵' },
                  accommodation: '大阪某飯店'
                }
              ]
            }
          })
        }
      }
    })

    const result = await runImportParserSkill(
      '這是一個去日本的行程...',
      [{ mimeType: 'image/png', base64Data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' }]
    )

    expect(result.extracted_metadata.destinations).toContain('東京')
    expect(result.itinerary.title).toBe('日本櫻花季五日遊')
    expect(result.itinerary.days.length).toBe(1)
  })

  test('throws error when GEMINI_API_KEY is not set', async () => {
    delete process.env.GEMINI_API_KEY
    await expect(runImportParserSkill('', [])).rejects.toThrow('GEMINI_API_KEY is not defined')
  })
})
