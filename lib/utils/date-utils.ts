export function getDateForDay(startDateStr: string, dayNumber: number): string {
  if (!startDateStr) return '';
  const date = new Date(startDateStr);
  if (isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + (dayNumber - 1));
  return date.toISOString().split('T')[0];
}