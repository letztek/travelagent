import { GooglePlaceOpeningHours } from '../types/google-places'

/**
 * Checks if a place is open at a given date/time based on Google Places opening hours.
 */
export function isPlaceOpen(hours: GooglePlaceOpeningHours | undefined, date: Date): boolean {
  if (!hours || !hours.periods || hours.periods.length === 0) {
    return true // Assume open if no data
  }

  const day = date.getDay() // 0 (Sunday) to 6 (Saturday)
  const timeInMinutes = date.getHours() * 60 + date.getMinutes()

  for (const period of hours.periods) {
    const openDay = period.open.day
    const openTime = period.open.hour * 60 + period.open.minute

    // Case 1: Closes on the same day
    if (period.close && period.close.day === openDay) {
      const closeTime = period.close.hour * 60 + period.close.minute
      if (day === openDay && timeInMinutes >= openTime && timeInMinutes < closeTime) {
        return true
      }
    }
    
    // Case 2: Closes on the next day (late night)
    else if (period.close) {
      const closeDay = period.close.day
      const closeTime = period.close.hour * 60 + period.close.minute

      // Is it within the interval on the opening day?
      if (day === openDay && timeInMinutes >= openTime) {
        return true
      }
      // Is it within the interval on the closing day?
      if (day === closeDay && timeInMinutes < closeTime) {
        return true
      }
    }
    
    // Case 3: Open 24 hours (open day exists, no close day/time in some API versions, 
    // or close is same as open)
    else {
       if (day === openDay) return true
    }
  }

  return false
}
