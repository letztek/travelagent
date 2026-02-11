import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import ItineraryEditor from './ItineraryEditor'
import { Itinerary } from '@/schemas/itinerary'

// Mock dependencies
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
    activities: [],
    meals: { breakfast: 'B', lunch: 'L', dinner: 'D' },
    accommodation: 'Hotel'
  }]
}

test('ItineraryEditor shows undo/redo buttons in edit mode', () => {
  render(<ItineraryEditor itinerary={mockItinerary} itineraryId="123" />)
  
  // Enter edit mode
  fireEvent.click(screen.getByRole('button', { name: /編輯/i }))
  
  // These should fail currently
  expect(screen.getByRole('button', { name: /Undo/i })).toBeDefined()
  expect(screen.getByRole('button', { name: /Redo/i })).toBeDefined()
})
