import { expect, test, vi } from 'vitest'
import { planRoute } from './route-actions'

vi.mock('@/lib/skills/route-planner', () => ({
  runRoutePlannerSkill: vi.fn(() => Promise.resolve({
    nodes: [],
    rationale: 'OK',
    total_days: 1
  }))
}))

vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(() => ({
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }))
}))

test('planRoute returns success', async () => {
  const requirement = {
    id: 'req-1',
    // ... minimal props
    travel_dates: { start: '2026-06-01', end: '2026-06-02' },
    travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
    budget_range: 'Mid',
    preferences: { dietary: [], accommodation: [] },
    notes: ''
  }

  const result = await planRoute(requirement as any)
  expect(result.success).toBe(true)
  expect(result.data?.rationale).toBe('OK')
})
