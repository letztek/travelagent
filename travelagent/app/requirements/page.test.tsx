import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import RequirementsListPage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock the server action/fetch logic
vi.mock('./actions', () => ({
  getRequirements: vi.fn(() => Promise.resolve({
    success: true,
    data: [
      {
        id: '1',
        created_at: '2026-01-30T12:00:00Z',
        travel_dates: { start: '2026-06-01', end: '2026-06-10' },
        travelers: { adult: 2, senior: 0, child: 0, infant: 0 },
        budget_range: '50000_100000',
        status: 'pending'
      }
    ]
  }))
}))

test('RequirementsListPage renders requirements and generate button', async () => {
  // Since it's a Server Component in Next.js, testing it with RTL might require different approach 
  // or making it a client component for now if we want to test interactivity easily.
  // However, for MVP, let's just check if the text renders.
  
  const Page = await RequirementsListPage()
  render(Page)
  
  expect(screen.getByText(/需求列表/i)).toBeDefined()
  expect(screen.getByText(/2026-06-01/i)).toBeDefined()
  expect(screen.getByRole('button', { name: /生成行程/i })).toBeDefined()
})
