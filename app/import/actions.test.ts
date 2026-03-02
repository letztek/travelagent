import { expect, test, describe, vi, beforeEach } from 'vitest'
import { parseImportData } from './actions'
import { runImportParserSkill } from '@/lib/skills/import-parser'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/skills/import-parser', () => ({
  runImportParserSkill: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('import actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('parseImportData calls import-parser skill and parses data URLs', async () => {
    // Mock user
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }) },
    } as any)

    vi.mocked(runImportParserSkill).mockResolvedValue({
      extracted_metadata: {
        destinations: ['東京'],
        origin: '台北',
        travel_dates: { start: '2026-04-01', end: '2026-04-05' },
        travelers: { adult: 2, child: 0, infant: 0, senior: 0 },
        budget_range: '未指定'
      },
      itinerary: {
        title: '東京五日遊',
        days: []
      }
    } as any)

    const textInput = '這是補充文字'
    const filesDataUrls = [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    ]

    const result = await parseImportData(textInput, filesDataUrls)

    expect(runImportParserSkill).toHaveBeenCalledWith(
      '這是補充文字',
      [{ mimeType: 'image/png', base64Data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' }]
    )
    expect(result.itinerary.title).toBe('東京五日遊')
  })

  test('parseImportData throws error if user is not authenticated', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Not auth') }) },
    } as any)

    await expect(parseImportData('', [])).rejects.toThrow('Unauthorized')
  })
})
