import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi, describe } from 'vitest'
import { SortableActivityCard } from './SortableActivityCard'

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(),
    },
  },
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  GripVertical: () => <div data-testid="grip-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
}))

// Mock AddToFavoritesButton
vi.mock('@/app/favorites/AddToFavoritesButton', () => ({
  AddToFavoritesButton: ({ isFavorite, onToggle }: any) => (
    <button data-testid="favorite-button" onClick={(e) => { e.stopPropagation(); onToggle?.(); }}>
      {isFavorite ? 'Favorite' : 'Not Favorite'}
    </button>
  ),
}))

describe('SortableActivityCard', () => {
  const mockActivity = {
    activity: 'Test Activity',
    description: 'Test Description',
  }

  const mockProps = {
    id: '1',
    activity: mockActivity,
    isEditing: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onSelect: vi.fn(),
    userFavorites: [],
    onToggleFavorite: vi.fn(),
  }

  test('renders activity details in view mode', () => {
    render(<SortableActivityCard {...mockProps} />)
    expect(screen.getByText('Test Activity')).toBeDefined()
    expect(screen.getByText('Test Description')).toBeDefined()
    expect(screen.queryByPlaceholderText('活動名稱')).toBeNull()
  })

  test('renders inputs in edit mode', () => {
    render(<SortableActivityCard {...mockProps} isEditing={true} />)
    expect(screen.getByDisplayValue('Test Activity')).toBeDefined()
    expect(screen.getByDisplayValue('Test Description')).toBeDefined()
    expect(screen.getByPlaceholderText('活動名稱')).toBeDefined()
    expect(screen.getByTestId('grip-icon')).toBeDefined()
    expect(screen.getByLabelText('刪除活動')).toBeDefined()
  })

  test('calls onUpdate when editing activity name', () => {
    render(<SortableActivityCard {...mockProps} isEditing={true} />)
    const nameInput = screen.getByPlaceholderText('活動名稱')
    fireEvent.change(nameInput, { target: { value: 'New Name' } })
    expect(mockProps.onUpdate).toHaveBeenCalledWith('activity', 'New Name')
  })

  test('calls onUpdate when editing description', () => {
    render(<SortableActivityCard {...mockProps} isEditing={true} />)
    const descInput = screen.getByPlaceholderText('描述')
    fireEvent.change(descInput, { target: { value: 'New Description' } })
    expect(mockProps.onUpdate).toHaveBeenCalledWith('description', 'New Description')
  })

  test('calls onDelete when delete button is clicked', () => {
    render(<SortableActivityCard {...mockProps} isEditing={true} />)
    const deleteButton = screen.getByLabelText('刪除活動')
    fireEvent.click(deleteButton)
    expect(mockProps.onDelete).toHaveBeenCalled()
  })

  test('calls onSelect when card is clicked (not on inputs)', () => {
    render(<SortableActivityCard {...mockProps} />)
    const card = screen.getByText('Test Activity').parentElement?.parentElement
    fireEvent.click(card!)
    expect(mockProps.onSelect).toHaveBeenCalled()
  })

  test('shows favorite status correctly', () => {
    const favorites = [{ name: 'Test Activity', type: 'spot', id: 'fav-1' }] as any
    render(<SortableActivityCard {...mockProps} userFavorites={favorites} />)
    expect(screen.getByText('Favorite')).toBeDefined()
  })

  test('calls onToggleFavorite when favorite button is clicked', () => {
    render(<SortableActivityCard {...mockProps} />)
    const favoriteButton = screen.getByTestId('favorite-button')
    fireEvent.click(favoriteButton)
    expect(mockProps.onToggleFavorite).toHaveBeenCalled()
  })
})
