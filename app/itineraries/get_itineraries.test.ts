import { expect, test, vi, beforeEach } from 'vitest'
import { getItineraries } from './actions'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

test('getItineraries returns itineraries for the current user', async () => {
  const mockItineraries = [
    { id: '1', requirement_id: 'req-1', content: { days: [] }, created_at: '2026-02-06T12:00:00Z' },
  ]
  
  vi.mocked(createClient).mockResolvedValue({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: mockItineraries, error: null })),
      })),
    })),
  } as any)

  const result = await getItineraries()

  expect(result.success).toBe(true)
  expect(result.data).toEqual(mockItineraries)
})

test('getItineraries handles database error', async () => {
  vi.mocked(createClient).mockResolvedValue({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: null, error: { message: 'DB Error' } })),
      })),
    })),
  } as any)

  const result = await getItineraries()

  expect(result.success).toBe(false)
  expect(result.error).toBe('DB Error')
})
