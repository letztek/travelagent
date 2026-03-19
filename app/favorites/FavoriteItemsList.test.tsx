import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FavoriteItemsList from './FavoriteItemsList'

const mockFavorites = [
  { id: '1', name: 'Spot A', type: 'spot', tags: ['tag1'] },
  { id: '2', name: 'Food B', type: 'food', tags: ['tag2'] },
  { id: '3', name: 'Acc C', type: 'accommodation', tags: ['tag3'] },
]

describe('FavoriteItemsList', () => {
  it('renders all favorites by default', () => {
    render(<FavoriteItemsList initialFavorites={mockFavorites as any} />)
    expect(screen.getByText('Spot A')).toBeDefined()
    expect(screen.getByText('Food B')).toBeDefined()
    expect(screen.getByText('Acc C')).toBeDefined()
  })

  it('filters by type when tabs are clicked', () => {
    render(<FavoriteItemsList initialFavorites={mockFavorites as any} />)
    
    // Click Food tab
    const foodTab = screen.getByRole('tab', { name: /餐食/i })
    fireEvent.click(foodTab)
    
    expect(screen.queryByText('Spot A')).toBeNull()
    expect(screen.getByText('Food B')).toBeDefined()
    expect(screen.queryByText('Acc C')).toBeNull()
  })

  it('shows empty state when no favorites match', () => {
    render(<FavoriteItemsList initialFavorites={[]} />)
    expect(screen.getByText(/尚無任何收藏/i)).toBeDefined()
  })
})
