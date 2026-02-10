import { expect, test, vi } from 'vitest'
import { runGapAnalyzerSkill } from './gap-analyzer'

// Mock Gemini SDK
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            missing_info: [
              {
                field: 'travelers.senior',
                issue: 'Missing mobility info',
                suggestion: 'Ask about mobility',
                severity: 'high'
              }
            ],
            logic_issues: [],
            overall_status: 'needs_info'
          })
        }
      })
    })
  }))
}))

test('runGapAnalyzerSkill produces valid analysis', async () => {
  vi.stubEnv('GEMINI_API_KEY', 'fake-key')
  vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', '') // Ensure legacy is gone
  const requirement = {
    travel_dates: { start: '2026-06-01', end: '2026-06-02' },
    travelers: { adult: 1, senior: 1, child: 0, infant: 0 },
    budget_range: 'Mid',
    preferences: { dietary: [], accommodation: [] },
    notes: ''
  }

  const result = await runGapAnalyzerSkill(requirement as any)
  expect(result.overall_status).toBe('needs_info')
  expect(result.missing_info).toHaveLength(1)
})
