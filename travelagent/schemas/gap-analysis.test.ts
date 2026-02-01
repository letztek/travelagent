import { expect, test } from 'vitest'
import { gapAnalysisSchema } from './gap-analysis'

test('gapAnalysisSchema validates correct data', () => {
  const validData = {
    missing_info: [
      {
        field: 'travelers.senior',
        issue: '有長輩隨行但未說明行動能力',
        suggestion: '請問長輩是否需要無障礙設施或減少步行行程？',
        severity: 'high'
      }
    ],
    logic_issues: [],
    overall_status: 'needs_info'
  }

  const result = gapAnalysisSchema.safeParse(validData)
  expect(result.success).toBe(true)
})

test('gapAnalysisSchema validates clean data', () => {
  const cleanData = {
    missing_info: [],
    logic_issues: [],
    overall_status: 'ready'
  }

  const result = gapAnalysisSchema.safeParse(cleanData)
  expect(result.success).toBe(true)
})
