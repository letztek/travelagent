import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { RouteEditor } from './RouteEditor'
import { RouteConcept } from '@/schemas/route'
import { Requirement } from '@/schemas/requirement'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockConcept: RouteConcept = {
  nodes: [
    { day: 1, location: 'Tokyo', description: 'Arrival' },
    { day: 2, location: 'Kyoto', description: 'Temple visit' },
  ],
  rationale: 'Efficient route',
  total_days: 2,
}

const mockRequirement: Requirement = {
  destinations: ['Japan'],
  travel_dates: { start: '2026-02-02', end: '2026-02-04' },
  travelers: { adult: 2, senior: 0, child: 0, infant: 0 },
  budget_range: 'Mid',
  preferences: { dietary: [], accommodation: [] },
}

test('RouteEditor renders initial concept', () => {
  render(
    <RouteEditor 
      initialConcept={mockConcept} 
      requirement={mockRequirement} 
      requirementId="123" 
    />
  )
  expect(screen.getByText('路線初步規劃預覽')).toBeDefined()
  expect(screen.getByText('Tokyo')).toBeDefined()
  expect(screen.getByText('Kyoto')).toBeDefined()
  expect(screen.getByText('AI 規劃理由')).toBeDefined()
})
