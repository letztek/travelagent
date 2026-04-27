import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import RequirementFormPage from './page'
import { GlobalLoaderProvider } from '@/components/GlobalLoaderContext'

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
  render(
    <GlobalLoaderProvider>
      <RequirementFormPage />
    </GlobalLoaderProvider>
  )
  
  expect(screen.getByText(/新增旅遊需求/i)).toBeDefined()
  expect(screen.getByLabelText(/出發地/i)).toBeDefined()
  expect(screen.getByLabelText(/目的地/i)).toBeDefined()
  expect(screen.getByLabelText(/成人/i)).toBeDefined()
  expect(screen.getByText(/預算範圍/i)).toBeDefined()
  expect(screen.getByRole('button', { name: /儲存需求並進行後續處理/i })).toBeDefined()
})
