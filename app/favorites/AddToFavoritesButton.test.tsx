import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AddToFavoritesButton } from './AddToFavoritesButton'
import * as actions from './actions'

vi.mock('./actions', () => ({
  createFavorite: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}))

describe('AddToFavoritesButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls createFavorite when clicked', async () => {
    // @ts-expect-error: mocking
    actions.createFavorite.mockResolvedValue({ success: true })
    
    render(
      <AddToFavoritesButton 
        name="Taipei 101" 
        type="spot" 
        description="Nice view"
      />
    )
    
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    
    await waitFor(() => {
      expect(actions.createFavorite).toHaveBeenCalledWith({
        name: 'Taipei 101',
        type: 'spot',
        description: 'Nice view',
        tags: [],
        location_data: {}
      })
    })
  })
})
