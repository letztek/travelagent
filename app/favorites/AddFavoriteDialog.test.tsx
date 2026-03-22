import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AddFavoriteDialog from './AddFavoriteDialog'
import * as actions from './actions'

vi.mock('./actions', () => ({
  createFavorite: vi.fn(),
  suggestTags: vi.fn(),
}))

describe('AddFavoriteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly when open', () => {
    render(<AddFavoriteDialog open={true} onOpenChange={() => {}} />)
    expect(screen.getByText('新增口袋名單')).toBeDefined()
  })

  it('calls suggestTags when name is entered and button is clicked', async () => {
    // @ts-expect-error: mocking
    actions.suggestTags.mockResolvedValue({ success: true, data: ['AI Tag 1', 'AI Tag 2'] })
    
    render(<AddFavoriteDialog open={true} onOpenChange={() => {}} />)
    
    const nameInput = screen.getByLabelText(/名稱/i)
    fireEvent.change(nameInput, { target: { value: 'Taipei 101' } })
    
    const suggestBtn = screen.getByRole('button', { name: /AI 推薦標籤/i })
    fireEvent.click(suggestBtn)
    
    await waitFor(() => {
      expect(actions.suggestTags).toHaveBeenCalledWith('Taipei 101', '', 'spot')
      expect(screen.getByText('AI Tag 1')).toBeDefined()
    })
  })

  it('allows selecting tags', async () => {
    // @ts-expect-error: mocking
    actions.suggestTags.mockResolvedValue({ success: true, data: ['Tag A'] })
    render(<AddFavoriteDialog open={true} onOpenChange={() => {}} />)
    
    fireEvent.change(screen.getByLabelText(/名稱/i), { target: { value: 'Test' } })
    fireEvent.click(screen.getByRole('button', { name: /AI 推薦標籤/i }))
    
    const tagBadge = await screen.findByText('Tag A')
    fireEvent.click(tagBadge)
    
    // Check if tag is added to selected (this might need internal state check or looking at the UI change)
    // We can check if it's now in the 'selected' area or has a specific class
  })
})
