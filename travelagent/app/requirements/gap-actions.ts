'use server'

import { runGapAnalyzerSkill } from '@/lib/skills/gap-analyzer'
import { type Requirement } from '@/schemas/requirement'

export async function analyzeGaps(requirement: Requirement) {
  try {
    const analysis = await runGapAnalyzerSkill(requirement)
    return { success: true, data: analysis }
  } catch (error: any) {
    console.error('Gap Analysis Error:', error)
    return { success: false, error: error.message || 'Failed to analyze requirements' }
  }
}
