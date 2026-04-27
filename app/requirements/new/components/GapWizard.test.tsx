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

const mockMultiAnalysis: GapAnalysis = {
  missing_info: [
    {
      field: 'travelers.senior',
      issue: 'Missing mobility info',
      suggestion: 'How is the mobility?',
      severity: 'high'
    },
    {
      field: 'dietary',
      issue: 'Missing dietary info',
      suggestion: 'Any allergies?',
      severity: 'low'
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

test('GapWizard preserves state when navigating back', () => {
  render(<GapWizard analysis={mockMultiAnalysis} onComplete={vi.fn()} onCancel={vi.fn()} />)
  
  // Step 1
  expect(screen.getByText('Missing mobility info')).toBeDefined()
  const input1 = screen.getByPlaceholderText('請在此輸入您的回答...') as HTMLTextAreaElement
  fireEvent.change(input1, { target: { value: 'Good mobility' } })
  fireEvent.click(screen.getByText(/確認並下一題/i))
  
  // Step 2
  expect(screen.getByText('Missing dietary info')).toBeDefined()
  const input2 = screen.getByPlaceholderText('請在此輸入您的回答...') as HTMLTextAreaElement
  fireEvent.change(input2, { target: { value: 'No allergies' } })
  
  // Go Back to Step 1
  fireEvent.click(screen.getByText(/回到上一題/i))
  
  // Verify Step 1 state is preserved
  expect(screen.getByText('Missing mobility info')).toBeDefined()
  const input1Back = screen.getByPlaceholderText('請在此輸入您的回答...') as HTMLTextAreaElement
  expect(input1Back.value).toBe('Good mobility')

  // Go Next to Step 2 again
  fireEvent.click(screen.getByText(/確認並下一題/i))
  
  // Verify Step 2 state is preserved
  expect(screen.getByText('Missing dietary info')).toBeDefined()
  const input2Back = screen.getByPlaceholderText('請在此輸入您的回答...') as HTMLTextAreaElement
  expect(input2Back.value).toBe('No allergies')
})
