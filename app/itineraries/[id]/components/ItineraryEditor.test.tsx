import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import ItineraryEditor from './ItineraryEditor'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}))

// Mock DnD Kit (Simplified mock as full DnD logic is hard to test in unit tests)
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  useSensor: vi.fn(),
  useSensors: vi.fn(),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  closestCenter: vi.fn(),
  closestCorners: vi.fn(),
  defaultDropAnimationSideEffects: vi.fn(() => vi.fn()),
  DragOverlay: ({ children }: any) => <div>{children}</div>,
  useDroppable: () => ({ setNodeRef: vi.fn() }),
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
  verticalListSortingStrategy: {},
  sortableKeyboardCoordinates: vi.fn(),
  arrayMove: vi.fn(),
}))

const mockItinerary = {
  days: [
    {
      day: 1,
      date: '2026-06-01',
      activities: [
        { time_slot: 'Morning', activity: 'Activity 1', description: 'Desc 1' }
      ],
      meals: { breakfast: 'B', lunch: 'L', dinner: 'D' },
      accommodation: 'Acc'
    }
  ]
}

test('ItineraryEditor renders in view mode initially', () => {
  render(<ItineraryEditor itinerary={mockItinerary as any} itineraryId="123" />)
  expect(screen.getByText('Activity 1')).toBeDefined()
  // The chat input might be there, but there should be no activity editing inputs
  expect(screen.queryByDisplayValue('Activity 1')).toBeNull()
})

test('ItineraryEditor switches to edit mode', () => {
  render(<ItineraryEditor itinerary={mockItinerary as any} itineraryId="123" />)
  fireEvent.click(screen.getByRole('button', { name: /編輯/i }))
  expect(screen.getByText('儲存')).toBeDefined()
  // Should see inputs now (simplified check)
  expect(screen.getAllByDisplayValue('Activity 1')).toBeDefined()
})
