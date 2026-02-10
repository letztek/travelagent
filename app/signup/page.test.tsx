import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SignupPage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}))

test('SignupPage renders correctly', () => {
  render(<SignupPage />)
  expect(screen.getByText('建立帳號')).toBeDefined()
  expect(screen.getByPlaceholderText('您的姓名或暱稱')).toBeDefined()
})
