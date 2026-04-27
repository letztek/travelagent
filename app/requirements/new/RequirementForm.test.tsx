import { expect, test, vi, beforeEach, describe } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RequirementFormPage from './page'
import { GlobalLoaderProvider } from '@/components/GlobalLoaderContext'

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
    render(
      <GlobalLoaderProvider>
        <RequirementFormPage />
      </GlobalLoaderProvider>
    )
    expect(screen.getByText('手動填寫需求')).toBeDefined()
    // Check for a manual form field
    expect(screen.getByText('出發地')).toBeDefined()
  })

  test('can switch to import tab', () => {
    render(
      <GlobalLoaderProvider>
        <RequirementFormPage />
      </GlobalLoaderProvider>
    )
    const importTab = screen.getByText('匯入現有檔案/文字')
    fireEvent.click(importTab)
    
    // Check for import specific text
    expect(screen.getByText(/上傳檔案/)).toBeDefined()
    expect(screen.getByText(/直接貼上純文字內容/)).toBeDefined()
  })

  test('displays 每人預算 when travelers >= 2', () => {
    render(
      <GlobalLoaderProvider>
        <RequirementFormPage />
      </GlobalLoaderProvider>
    )
    
    // Initially Adult is 1, so it should say "總預算 (TWD)" or "預算範圍"
    const budgetLabel = screen.getByTestId('budget-label')
    expect(budgetLabel.textContent).toContain('總預算')

    // Increase Adult count to 2
    const adultInput = screen.getByRole('spinbutton', { name: /成人/i })
    fireEvent.change(adultInput, { target: { value: '2' } })

    // Now it should say "每人預算 (TWD)"
    expect(budgetLabel.textContent).toContain('每人預算')
  })

  test('displays feature toggles', () => {
    render(
      <GlobalLoaderProvider>
        <RequirementFormPage />
      </GlobalLoaderProvider>
    )
    expect(screen.getByText('執行 AI 需求診斷 (Gap Analysis)')).toBeDefined()
    expect(screen.getByText('將結果自動加入我的最愛')).toBeDefined()
  })
})
