import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { SortableRouteNode } from './SortableRouteNode'
import { RouteNode } from '@/schemas/route'

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

const mockNode: RouteNode = {
  day: 1,
  location: 'Tokyo',
  description: 'Arrival at Narita',
  transport: 'Flight',
}

test('SortableRouteNode renders node info', () => {
  render(
    <SortableRouteNode 
      id="node-1" 
      node={mockNode} 
      onDelete={vi.fn()} 
    />
  )
  expect(screen.getByText('Tokyo')).toBeDefined()
  expect(screen.getByText('Arrival at Narita')).toBeDefined()
  expect(screen.getByText('Flight')).toBeDefined()
  expect(screen.getByText('1')).toBeDefined() // Day number
})

test('SortableRouteNode renders date if startDate is provided', () => {
  render(
    <SortableRouteNode 
      id="node-1" 
      node={{ ...mockNode, day: 2 }} 
      startDate="2026-05-01"
      onDelete={vi.fn()} 
    />
  )
  expect(screen.getByText('2')).toBeDefined() // Day 2
  expect(screen.getByText('2026-05-02')).toBeDefined() // Calculated Date
})
