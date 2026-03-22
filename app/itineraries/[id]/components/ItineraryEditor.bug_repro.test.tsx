import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ItineraryEditor from './ItineraryEditor'
import { Itinerary } from '@/schemas/itinerary'

// Mock dependencies
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

vi.mock('../../actions', () => ({
  updateItinerary: vi.fn(),
  regenerateItinerary: vi.fn(),
  getFavorites: vi.fn(() => Promise.resolve({ success: true, data: [] })),
}))

vi.mock('@/app/favorites/actions', () => ({
  getFavorites: vi.fn(() => Promise.resolve({ success: true, data: [] })),
}))

const mockItinerary: Itinerary = {
  days: [
    {
      day: 1,
      date: '2026-03-20',
      activities: [
        { activity: 'Activity 1', description: 'Desc 1', time_slot: 'Morning' }
      ],
      meals: { breakfast: '', lunch: '', dinner: '' },
      accommodation: ''
    }
  ]
}

describe('ItineraryEditor Bug Repro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('immediately reflects deletion in the UI', async () => {
    render(<ItineraryEditor itinerary={mockItinerary} itineraryId="123" />)
    
    // Switch to edit mode
    fireEvent.click(screen.getByRole('button', { name: /編輯/i }))
    
    // Check if Activity 1 is there
    expect(screen.getByDisplayValue('Activity 1')).toBeDefined()
    
    // Find delete button and click it
    const deleteButton = screen.getByLabelText('刪除活動')
    fireEvent.click(deleteButton)
    
    // Use waitFor to handle async state update in useHistory
    await waitFor(() => {
      expect(screen.queryByDisplayValue('Activity 1')).toBeNull()
    })
  })

  it('restores data after cancel', async () => {
    window.confirm = vi.fn(() => true)
    
    render(<ItineraryEditor itinerary={mockItinerary} itineraryId="123" />)
    
    fireEvent.click(screen.getByRole('button', { name: /編輯/i }))
    
    // Delete the activity
    const deleteButton = screen.getByLabelText('刪除活動')
    fireEvent.click(deleteButton)
    
    await waitFor(() => {
      expect(screen.queryByDisplayValue('Activity 1')).toBeNull()
    })
    
    // Click Cancel
    fireEvent.click(screen.getByRole('button', { name: /取消/i }))
    
    // We expect it to be back (in view mode)
    await waitFor(() => {
      expect(screen.getByText('Activity 1')).toBeDefined()
    })
  })
})
