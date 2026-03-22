import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RecommendationSheet } from './RecommendationSheet'
import * as actions from '@/app/favorites/actions'

vi.mock('@/app/favorites/actions', () => ({
  getFavorites: vi.fn(),
}))

describe('RecommendationSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly when open', async () => {
    // @ts-expect-error: mocking
    actions.getFavorites.mockResolvedValue({ success: true, data: [] })
    render(<RecommendationSheet open={true} onOpenChange={() => {}} onAdd={() => {}} totalDays={3} />)
    expect(screen.getByText(/私房推薦/i)).toBeDefined()
  })

  it('displays favorites from the list', async () => {
    // @ts-expect-error: mocking
    actions.getFavorites.mockResolvedValue({
      success: true,
      data: [{ id: '1', name: 'Cool Place', type: 'spot', tags: [] }]
    })
    
    render(<RecommendationSheet open={true} onOpenChange={() => {}} onAdd={() => {}} totalDays={3} />)
    
    await waitFor(() => {
      expect(screen.getByText('Cool Place')).toBeDefined()
    })
  })
})
