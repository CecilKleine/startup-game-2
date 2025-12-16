/**
 * Utility functions for working with real calendar dates in the game
 */

export function getCurrentGameDate(startDateISO: string, daysElapsed: number): Date {
  const startDate = new Date(startDateISO);
  const currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + Math.floor(daysElapsed));
  return currentDate;
}

export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function isNewMonth(startDateISO: string, previousDays: number, currentDays: number): boolean {
  const prevDate = getCurrentGameDate(startDateISO, previousDays);
  const currDate = getCurrentGameDate(startDateISO, currentDays);
  return prevDate.getMonth() !== currDate.getMonth() || prevDate.getFullYear() !== currDate.getFullYear();
}

export function isNewWeek(startDateISO: string, previousDays: number, currentDays: number): boolean {
  const prevDate = getCurrentGameDate(startDateISO, previousDays);
  const currDate = getCurrentGameDate(startDateISO, currentDays);
  const prevWeek = getWeekNumber(prevDate);
  const currWeek = getWeekNumber(currDate);
  return prevWeek !== currWeek || prevDate.getFullYear() !== currDate.getFullYear();
}

function getWeekNumber(date: Date): number {
  // Get week number using ISO week (week starts on Monday)
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Convert Sunday (0) to 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Get to Monday of the week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getCurrentGameDateFormatted(startDateISO: string, daysElapsed: number): string {
  return getCurrentGameDate(startDateISO, daysElapsed).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Check if a given date is a weekend (Saturday or Sunday)
 */
export function isWeekend(startDateISO: string, daysElapsed: number): boolean {
  const currentDate = getCurrentGameDate(startDateISO, daysElapsed);
  const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * Count the number of weekdays (Monday-Friday) in a given month
 */
export function countWeekdaysInMonth(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = getDaysInMonth(date);
  let weekdays = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dayOfWeek = currentDate.getDay();
    // Count Monday (1) through Friday (5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      weekdays++;
    }
  }
  
  return weekdays;
}

