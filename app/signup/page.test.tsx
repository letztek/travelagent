import { expect, test, vi } from 'vitest'
import { render } from '@testing-library/react'
import SignupPage from './page'
import { notFound } from 'next/navigation'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  notFound: vi.fn(),
}))

test('SignupPage calls notFound because signup is disabled', () => {
  render(<SignupPage />)
  expect(notFound).toHaveBeenCalled()
})
