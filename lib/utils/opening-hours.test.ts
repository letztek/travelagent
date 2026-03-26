import { describe, it, expect } from 'vitest'
import { isPlaceOpen } from './opening-hours'
import { GooglePlaceOpeningHours } from '../types/google-places'

describe('Opening Hours Utility', () => {
  it('returns true if no opening hours provided', () => {
    expect(isPlaceOpen(undefined, new Date('2026-06-01'))).toBe(true)
  })

  it('correctly identifies a closed day (e.g., Monday)', () => {
    // 2026-06-01 is a Monday
    const hours: GooglePlaceOpeningHours = {
      periods: [
        { open: { day: 2, hour: 9, minute: 0 }, close: { day: 2, hour: 18, minute: 0 } } // Open Tuesday
      ]
    }
    expect(isPlaceOpen(hours, new Date('2026-06-01'))).toBe(false)
  })

  it('identifies open day but outside time range', () => {
    // 2026-06-02 is a Tuesday
    const hours: GooglePlaceOpeningHours = {
      periods: [
        { open: { day: 2, hour: 9, minute: 0 }, close: { day: 2, hour: 17, minute: 0 } }
      ]
    }
    // Checking 18:00
    expect(isPlaceOpen(hours, new Date('2026-06-02T18:00:00'))).toBe(false)
  })

  it('handles late night closing (e.g., closes 01:00 next day)', () => {
    const hours: GooglePlaceOpeningHours = {
      periods: [
        { open: { day: 5, hour: 18, minute: 0 }, close: { day: 6, hour: 1, minute: 0 } }
      ]
    }
    // Friday at 23:00
    expect(isPlaceOpen(hours, new Date('2026-06-05T23:00:00'))).toBe(true)
    // Saturday at 00:30
    expect(isPlaceOpen(hours, new Date('2026-06-06T00:30:00'))).toBe(true)
    // Saturday at 02:00
    expect(isPlaceOpen(hours, new Date('2026-06-06T02:00:00'))).toBe(false)
  })
})
