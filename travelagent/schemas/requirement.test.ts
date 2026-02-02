import { expect, test } from 'vitest'
import { requirementSchema } from './requirement'

test('requirementSchema validates correct data', () => {
  const validData = {
    origin: 'Taipei',
    destinations: ['Tokyo', 'Osaka'],
    travel_dates: {
      start: '2026-06-01',
      end: '2026-06-10',
    },
    travelers: {
      adult: 2,
      senior: 1,
      child: 0,
      infant: 0,
    },
    budget_range: '50000-100000',
    preferences: {
      dietary: ['vegetarian'],
      accommodation: ['hotel'],
    },
    notes: 'Birthday celebration',
  }

  const result = requirementSchema.safeParse(validData)
  expect(result.success).toBe(true)
})

test('requirementSchema fails on invalid travelers count', () => {
  const invalidData = {
    travel_dates: {
      start: '2026-06-01',
      end: '2026-06-10',
    },
    travelers: {
      adult: 0,
      senior: 0,
      child: 0,
      infant: 0,
    },
    budget_range: '50000-100000',
    preferences: {
      dietary: [],
      accommodation: [],
    },
  }

  const result = requirementSchema.safeParse(invalidData)
  expect(result.success).toBe(false)
})
