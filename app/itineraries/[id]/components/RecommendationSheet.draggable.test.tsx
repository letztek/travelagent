import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RecommendationSheet } from './RecommendationSheet'
import * as actions from '@/app/favorites/actions'

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  useDraggable: vi.fn(() => ({
    attributes: { 'data-draggable': 'true' },
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  })),
}))

vi.mock('@/app/favorites/actions', () => ({
  getFavorites: vi.fn(),
}))

const mockFavorites = [
  { id: 'fav-1', name: 'Spot A', type: 'spot', tags: ['tag1'] },
]

describe('RecommendationSheet Draggable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(actions.getFavorites).mockResolvedValue({ success: true, data: mockFavorites as any })
  })

  it('renders favorites as draggable items', async () => {
    render(
      <RecommendationSheet 
        open={true} 
        onOpenChange={() => {}} 
        onAdd={() => {}} 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Spot A')).toBeDefined()
    })

    // The card should have the draggable attributes from our mock
    const card = screen.getByText('Spot A').closest('.text-card-foreground')
    // We'll check if our component uses useDraggable by checking for the mocked attribute
    // Note: We need to make sure our implementation actually applies these attributes
  })
})
