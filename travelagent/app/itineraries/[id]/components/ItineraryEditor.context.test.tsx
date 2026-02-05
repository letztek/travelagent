import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import ItineraryEditor from './ItineraryEditor'
import { Itinerary } from '@/schemas/itinerary'

// Mock dependencies (same as history test)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() })
}))

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  useSensors: () => {},
  useSensor: () => {},
  useDroppable: () => ({ setNodeRef: vi.fn() }),
  PointerSensor: {},
  KeyboardSensor: {},
  closestCorners: {},
  DragOverlay: ({ children }: any) => <div>{children}</div>,
  defaultDropAnimationSideEffects: vi.fn(),
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
  sortableKeyboardCoordinates: {},
  verticalListSortingStrategy: {},
  arrayMove: (items: any[], oldIndex: number, newIndex: number) => items
}))

const mockItinerary: Itinerary = {
  days: [{
    day: 1,
    date: '2026-06-01',
    activities: [{
      time_slot: 'Morning',
      activity: 'Test Activity',
      description: 'Description'
    }],
    meals: { breakfast: 'B', lunch: 'L', dinner: 'D' },
    accommodation: 'Hotel'
  }]
}

test('ItineraryEditor highlights selected activity', () => {
  render(<ItineraryEditor itinerary={mockItinerary} itineraryId="123" />)
  
  // Find activity text (in read-only mode)
  const activity = screen.getByText('Test Activity')
  const card = activity.closest('.bg-white') // Parent container
  
  // Click to select
  fireEvent.click(activity)
  
  // Expect visual highlight (e.g., ring or border color change)
  // Currently this will fail as no selection logic exists
  expect(card?.className).toContain('ring-2')
})
