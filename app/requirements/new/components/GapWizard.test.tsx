import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { GapWizard } from './GapWizard'
import { GapAnalysis } from '@/schemas/gap-analysis'

const mockAnalysis: GapAnalysis = {
  missing_info: [
    {
      field: 'travelers.senior',
      issue: 'Missing mobility info',
      suggestion: 'How is the mobility?',
      severity: 'high'
    }
  ],
  logic_issues: [],
  overall_status: 'needs_info'
}

test('GapWizard renders the first question', () => {
  render(<GapWizard analysis={mockAnalysis} onComplete={vi.fn()} onCancel={vi.fn()} />)
  expect(screen.getByText('Missing mobility info')).toBeDefined()
  expect(screen.getByText('How is the mobility?')).toBeDefined()
})

test('GapWizard allows input and next', () => {
  const onComplete = vi.fn()
  render(<GapWizard analysis={mockAnalysis} onComplete={onComplete} onCancel={vi.fn()} />)
  
  const input = screen.getByPlaceholderText('請在此輸入您的回答...')
  fireEvent.change(input, { target: { value: 'Good mobility' } })
  
  fireEvent.click(screen.getByText('完成診斷'))
  
  // Since only 1 question, it should complete
  expect(onComplete).toHaveBeenCalledWith({
    'travelers.senior': 'Good mobility'
  })
})
