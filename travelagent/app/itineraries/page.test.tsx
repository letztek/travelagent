import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ItinerariesPage from './page'
import * as actions from './actions'

vi.mock('./actions', () => ({
  getItineraries: vi.fn(),
}))

test('ItinerariesPage renders empty state when no itineraries', async () => {
  vi.mocked(actions.getItineraries).mockResolvedValue({
    success: true,
    data: [],
  })

  const result = await ItinerariesPage()
  render(result)

  expect(screen.getByText('目前沒有任何行程。')).toBeDefined()
  expect(screen.getAllByText('立即規劃').length).toBeGreaterThan(0)
})

test('ItinerariesPage renders itinerary list when data exists', async () => {
  const mockData = [
    {
      id: '1',
      created_at: '2026-02-06T12:00:00Z',
      content: {
        days: [
          { day: 1, date: '2026-06-01', activities: [], meals: {}, accommodation: '' }
        ]
      }
    }
  ]
  
  vi.mocked(actions.getItineraries).mockResolvedValue({
    success: true,
    data: mockData,
  })

  const result = await ItinerariesPage()
  render(result)

  expect(screen.getByText('我的行程列表')).toBeDefined()
})
