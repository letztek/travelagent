import { addDays, format, parseISO } from 'date-fns';

/**
 * Calculates the date for a specific day index based on a start date.
 * @param startDate The start date of the itinerary (YYYY-MM-DD)
 * @param dayIndex The 0-based index of the day (0 for Day 1, 1 for Day 2, etc.)
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function calculateDayDate(startDate: string, dayIndex: number): string {
  try {
    const start = parseISO(startDate);
    const targetDate = addDays(start, dayIndex);
    return format(targetDate, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error calculating date:', error);
    return startDate;
  }
}

/**
 * Re-calculates all dates in an itinerary day list starting from a given date.
 */
export function syncItineraryDates<T extends { day: number; date: string }>(
  days: T[],
  startDate: string
): T[] {
  return days.map((day, index) => ({
    ...day,
    day: index + 1,
    date: calculateDayDate(startDate, index)
  }));
}

/**
 * Moves an item in an array from one index to another.
 */
export function reorderArray<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}
