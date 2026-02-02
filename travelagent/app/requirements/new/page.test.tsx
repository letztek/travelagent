import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import RequirementFormPage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('../actions', () => ({
  createRequirement: vi.fn(),
}))

vi.mock('../gap-actions', () => ({
  analyzeGaps: vi.fn(),
}))

test('RequirementFormPage renders all form fields', () => {
  render(<RequirementFormPage />)
  
  expect(screen.getByText(/新增旅遊需求/i)).toBeDefined()
  expect(screen.getByText(/成人/i)).toBeDefined()
  expect(screen.getByText(/預算範圍/i)).toBeDefined()
  expect(screen.getByRole('button', { name: /進行 AI 診斷並儲存/i })).toBeDefined()
})
