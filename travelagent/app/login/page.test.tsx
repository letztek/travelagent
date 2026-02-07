import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginPage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}))

test('LoginPage renders correctly', () => {
  render(<LoginPage />)
  expect(screen.getByText('歡迎回來')).toBeDefined()
  expect(screen.getByPlaceholderText('name@example.com')).toBeDefined()
})
