import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FavoriteItemsList from './FavoriteItemsList'
import * as actions from './actions'
import { toast } from 'sonner'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('./actions', async () => {
  const actual = await vi.importActual('./actions')
  return {
    ...actual,
    updateFavorite: vi.fn(),
    suggestTags: vi.fn(),
  }
})

const mockFavorites = [
  { id: '1', name: 'Spot A', description: 'Desc A', type: 'spot', tags: ['tag1'] },
  { id: '2', name: 'Food B', description: 'Desc B', type: 'food', tags: ['tag2'] },
  { id: '3', name: 'Acc C', description: 'Desc C', type: 'accommodation', tags: ['tag3'] },
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

  it('shows name and description inputs when editing', () => {
    render(<FavoriteItemsList initialFavorites={mockFavorites as any} />)
    
    // Click edit button of the first item
    const editButtons = screen.getAllByRole('button', { name: /編輯/i })
    fireEvent.click(editButtons[0])
    
    expect(screen.getByDisplayValue('Spot A')).toBeDefined()
    expect(screen.getByDisplayValue('Desc A')).toBeDefined()
  })

  it('calls updateFavorite and updates UI on save', async () => {
    vi.mocked(actions.updateFavorite).mockResolvedValue({ success: true } as any)
    
    render(<FavoriteItemsList initialFavorites={mockFavorites as any} />)
    
    // Start editing
    const editButtons = screen.getAllByRole('button', { name: /編輯/i })
    fireEvent.click(editButtons[0])
    
    // Change name
    const nameInput = screen.getByDisplayValue('Spot A')
    fireEvent.change(nameInput, { target: { value: 'New Name' } })
    
    // Click save
    const saveButton = screen.getByRole('button', { name: /儲存/i })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(actions.updateFavorite).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'New Name',
        description: 'Desc A',
      }))
    })
    
    expect(screen.getByText('New Name')).toBeDefined()
  })

  it('shows error toast when updateFavorite fails', async () => {
    vi.mocked(actions.updateFavorite).mockResolvedValue({ success: false, error: 'Update Failed' } as any)
    
    render(<FavoriteItemsList initialFavorites={mockFavorites as any} />)
    
    // Start editing
    const editButtons = screen.getAllByRole('button', { name: /編輯/i })
    fireEvent.click(editButtons[0])
    
    // Click save
    const saveButton = screen.getByRole('button', { name: /儲存/i })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Update Failed')
    })
  })

  it('calls suggestTags and updates tags on "重新推薦" button click', async () => {
    vi.mocked(actions.suggestTags).mockResolvedValue({ success: true, data: ['AI Tag 1', 'AI Tag 2'] })
    
    render(<FavoriteItemsList initialFavorites={mockFavorites as any} />)
    
    // Start editing
    const editButtons = screen.getAllByRole('button', { name: /編輯/i })
    fireEvent.click(editButtons[0])
    
    // Click "重新推薦" button
    const suggestButton = screen.getByRole('button', { name: /重新推薦/i })
    fireEvent.click(suggestButton)
    
    await waitFor(() => {
      expect(actions.suggestTags).toHaveBeenCalledWith('Spot A', 'Desc A', 'spot')
    })
    
    expect(screen.getByText('AI Tag 1')).toBeDefined()
    expect(screen.getByText('AI Tag 2')).toBeDefined()
  })
})
