import { expect, test, vi } from 'vitest'
import { analyzeGaps } from './gap-actions'

// Mock the skill wrapper
vi.mock('@/lib/skills/gap-analyzer', () => ({
  runGapAnalyzerSkill: vi.fn(() => Promise.resolve({
    missing_info: [],
    logic_issues: [],
    overall_status: 'ready'
  }))
}))

test('analyzeGaps returns success', async () => {
  const requirement = {
    // ... minimal req
    travel_dates: { start: '2026-06-01', end: '2026-06-02' },
    travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
    budget_range: 'Mid',
    preferences: { dietary: [], accommodation: [] },
    notes: ''
  }

  const result = await analyzeGaps(requirement as any)
  expect(result.success).toBe(true)
  expect(result.data?.overall_status).toBe('ready')
})
