import { expect, test } from 'vitest'
import { routeConceptSchema } from './route'

test('routeConceptSchema validates correct data', () => {
  const validData = {
    nodes: [
      { day: 1, location: 'Sendai', description: 'Arrive and explore', transport: 'Flight' },
      { day: 2, location: 'Aomori', description: 'Move north', transport: 'Shinkansen' }
    ],
    rationale: 'Efficient north-bound route',
    total_days: 2
  }

  const result = routeConceptSchema.safeParse(validData)
  expect(result.success).toBe(true)
})

test('routeConceptSchema fails on invalid data', () => {
  const invalidData = {
    nodes: [],
    rationale: ''
  }

  const result = routeConceptSchema.safeParse(invalidData)
  expect(result.success).toBe(false)
})
