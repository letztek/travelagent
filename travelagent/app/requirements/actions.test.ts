import { expect, test, vi } from 'vitest'
import { createRequirement } from './actions'

vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null })),
        })),
      })),
    })),
  })),
}))

test('createRequirement saves data successfully', async () => {
  const validData = {
    travel_dates: { start: '2026-06-01', end: '2026-06-10' },
    travelers: { adult: 2, senior: 0, child: 0, infant: 0 },
    budget_range: '50000_100000',
    preferences: { dietary: [], accommodation: [] },
    notes: 'Test',
  }

  const result = await createRequirement(validData as any)
  expect(result.success).toBe(true)
  expect(result.data).toBeDefined()
})
