import { expect, test, describe, vi, beforeEach } from 'vitest'
import { parseImportData, finalizeImport } from './actions'
import { runImportParserSkill } from '@/lib/skills/import-parser'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/skills/import-parser', () => ({
  runImportParserSkill: vi.fn(),
}))

const mockInsertReq = vi.fn()
const mockInsertItin = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }) },
    from: vi.fn((table) => {
      if (table === 'requirements') {
        return {
          insert: mockInsertReq.mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'req-123' }, error: null })
            })
          })
        }
      }
      if (table === 'itineraries') {
        return {
          insert: mockInsertItin.mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'itin-123' }, error: null })
            })
          })
        }
      }
      return {}
    })
  }))
}))

describe('import actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('parseImportData', () => {
    test('calls import-parser skill and parses data URLs', async () => {
      vi.mocked(runImportParserSkill).mockResolvedValue({
        extracted_metadata: {
          destinations: ['東京'],
          origin: '台北',
          travel_dates: { start: '2026-04-01', end: '2026-04-05' },
          travelers: { adult: 2, child: 0, infant: 0, senior: 0 },
          budget_range: '未指定'
        },
        itinerary: { title: '東京五日遊', days: [] }
      } as any)

      const textInput = '這是補充文字'
      const filesDataUrls = ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==']

      const result = await parseImportData(textInput, filesDataUrls)
      expect(result.success).toBe(true)
      expect(result.data?.itinerary.title).toBe('東京五日遊')
    })

    test('returns error if user is not authenticated', async () => {
      vi.mocked(createClient).mockResolvedValueOnce({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Not auth') }) },
      } as any)

      const result = await parseImportData('', [])
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })
  })

  describe('finalizeImport', () => {
    test('creates requirement and itinerary in database', async () => {
      const metadata = {
        destinations: ['東京'],
        origin: '台北',
        travel_dates: { start: '2026-04-01', end: '2026-04-05' },
        travelers: { adult: 2, child: 0, infant: 0, senior: 0 },
        budget_range: '50000',
        preferences: { dietary: [], accommodation: [] },
        notes: '匯入產生'
      }
      const itineraryDraft = { title: '東京遊', days: [] }

      const result = await finalizeImport(metadata as any, itineraryDraft as any)

      expect(mockInsertReq).toHaveBeenCalled()
      expect(mockInsertItin).toHaveBeenCalledWith([{
        requirement_id: 'req-123',
        content: itineraryDraft,
        user_id: 'test-user'
      }])
      
      expect(result.success).toBe(true)
      expect(result.itineraryId).toBe('itin-123')
    })
  })
})
