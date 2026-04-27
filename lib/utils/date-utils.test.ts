import { describe, it, expect } from 'vitest'
import { getDateForDay } from './date-utils'

describe('getDateForDay', () => {
  it('calculates correct date for Day 1', () => {
    expect(getDateForDay('2026-05-01', 1)).toBe('2026-05-01')
  })

  it('calculates correct date for Day 5', () => {
    expect(getDateForDay('2026-05-01', 5)).toBe('2026-05-05')
  })

  it('handles month wrapping correctly', () => {
    expect(getDateForDay('2026-05-30', 3)).toBe('2026-06-01')
  })

  it('handles leap years correctly', () => {
    expect(getDateForDay('2028-02-28', 2)).toBe('2028-02-29') // 2028 is a leap year
    expect(getDateForDay('2027-02-28', 2)).toBe('2027-03-01') // 2027 is not a leap year
  })

  it('returns empty string if invalid start date', () => {
    expect(getDateForDay('', 2)).toBe('')
    expect(getDateForDay('invalid', 2)).toBe('')
  })
})