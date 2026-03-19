import { expect, test, vi, beforeEach, describe } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RequirementFormPage from './page'

// Mock components and hooks
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

describe('RequirementFormPage with Tabs', () => {
  test('renders manual form by default', () => {
    render(<RequirementFormPage />)
    expect(screen.getByText('手動填寫需求')).toBeDefined()
    // Check for a manual form field
    expect(screen.getByText('出發地')).toBeDefined()
  })

  test('can switch to import tab', () => {
    render(<RequirementFormPage />)
    const importTab = screen.getByText('匯入現有檔案/文字')
    fireEvent.click(importTab)
    
    // Check for import specific text
    expect(screen.getByText(/上傳檔案/)).toBeDefined()
    expect(screen.getByText(/直接貼上純文字內容/)).toBeDefined()
  })
})
