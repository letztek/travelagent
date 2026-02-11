import { expect, test } from 'vitest';
import { calculateDayDate, syncItineraryDates, reorderArray } from './itinerary-utils';

test('calculateDayDate correctly calculates dates', () => {
  expect(calculateDayDate('2026-06-01', 0)).toBe('2026-06-01');
  expect(calculateDayDate('2026-06-01', 1)).toBe('2026-06-02');
  expect(calculateDayDate('2026-06-01', 30)).toBe('2026-07-01');
});

test('syncItineraryDates updates all days and dates', () => {
  const days = [
    { day: 1, date: '2026-01-01', title: 'A' },
    { day: 2, date: '2026-01-01', title: 'B' },
    { day: 5, date: '2026-01-01', title: 'C' }
  ];
  
  const synced = syncItineraryDates(days, '2026-06-01');
  
  expect(synced[0]).toEqual({ day: 1, date: '2026-06-01', title: 'A' });
  expect(synced[1]).toEqual({ day: 2, date: '2026-06-02', title: 'B' });
  expect(synced[2]).toEqual({ day: 3, date: '2026-06-03', title: 'C' });
});

test('reorderArray correctly moves elements', () => {
  const list = ['A', 'B', 'C', 'D'];
  
  // Move 'A' (index 0) to after 'C' (index 2) -> index 2
  expect(reorderArray(list, 0, 2)).toEqual(['B', 'C', 'A', 'D']);
  
  // Move 'D' (index 3) to start (index 0)
  expect(reorderArray(list, 3, 0)).toEqual(['D', 'A', 'B', 'C']);
});
