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

/**
 * Extracts and parses a JSON object from a string that might contain markdown blocks or extra text.
 */
export function extractJsonFromText(text: string): any {
  // Try parsing directly first
  try {
    return JSON.parse(text);
  } catch (e) {}

  // Look for JSON within markdown code blocks
  const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (markdownMatch && markdownMatch[1]) {
    try {
      return JSON.parse(markdownMatch[1]);
    } catch (e) {}
  }

  // Look for the first '{' and the last '}'
  const startIdx = text.indexOf('{');
  const endIdx = text.lastIndexOf('}');
  
  if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    try {
      const jsonStr = text.substring(startIdx, endIdx + 1);
      return JSON.parse(jsonStr);
    } catch (e) {}
  }

  throw new Error('Failed to extract valid JSON from response');
}

/**
 * Normalizes a time slot string to one of the three allowed values: Morning, Afternoon, Evening.
 */
export function normalizeTimeSlot(slot: any): 'Morning' | 'Afternoon' | 'Evening' {
  if (typeof slot !== 'string') return 'Morning';
  
  const s = slot.toLowerCase();
  if (s.includes('morning') || s.includes('上午') || s.includes('早')) return 'Morning';
  if (s.includes('afternoon') || s.includes('下午') || s.includes('午')) return 'Afternoon';
  if (s.includes('evening') || s.includes('night') || s.includes('晚上') || s.includes('晚')) return 'Evening';
  
  return 'Morning'; // Default fallback
}

/**
 * Normalizes all activities in an itinerary to ensure they have valid time_slots.
 */
export function normalizeItinerary(data: any): any {
  if (!data || !data.days || !Array.isArray(data.days)) return data;

  const normalized = { ...data };
  normalized.days = data.days.map((day: any) => ({
    ...day,
    activities: (day.activities || []).map((activity: any) => ({
      ...activity,
      time_slot: normalizeTimeSlot(activity.time_slot)
    }))
  }));

  return normalized;
}
