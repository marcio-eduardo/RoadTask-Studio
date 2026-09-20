import { CalendarConfig } from '../types/gantt';

/**
 * Parses YYYY-MM-DD string into a UTC Date object to avoid timezone shifts.
 */
export function parseDateUtc(dateStr: string): Date {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

/**
 * Formats a Date object to YYYY-MM-DD string in UTC.
 */
export function formatDateUtc(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Checks if a given date string is a work day based on calendar configuration.
 */
export function isWorkDay(dateStr: string, config: CalendarConfig): boolean {
  if (config.includeWeekends) {
    return !config.holidays.includes(dateStr);
  }

  const date = parseDateUtc(dateStr);
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 6 = Saturday

  if (dayOfWeek === 0) return false; // Sunday is non-workday
  if (dayOfWeek === 6 && !config.saturdayIsWorkday) return false; // Saturday

  return !config.holidays.includes(dateStr);
}

/**
 * Finds the nearest next work day starting from (or equal to) dateStr.
 */
export function ensureWorkDay(dateStr: string, config: CalendarConfig): string {
  let curr = parseDateUtc(dateStr);
  let attempts = 0;
  while (attempts < 365) {
    const formatted = formatDateUtc(curr);
    if (isWorkDay(formatted, config)) {
      return formatted;
    }
    curr = new Date(curr.getTime() + 24 * 60 * 60 * 1000);
    attempts++;
  }
  return dateStr;
}

/**
 * Calculates end date given a start date and duration in work days.
 * If duration === 0 (Milestone), endDate === startDate.
 * If duration === 1, task starts and finishes on the same work day.
 * If duration === 5 (Mon-Fri), task ends on Friday.
 */
export function calculateEndDate(startDateStr: string, durationWorkDays: number, config: CalendarConfig): string {
  if (durationWorkDays <= 0) {
    return startDateStr;
  }

  let currStr = ensureWorkDay(startDateStr, config);
  let daysCounted = 1;

  while (daysCounted < durationWorkDays) {
    const nextDate = new Date(parseDateUtc(currStr).getTime() + 24 * 60 * 60 * 1000);
    currStr = formatDateUtc(nextDate);
    if (isWorkDay(currStr, config)) {
      daysCounted++;
    }
  }

  return currStr;
}

/**
 * Returns the work day that immediately follows the given end date.
 * (Used for Finish-to-Start dependency propagation).
 */
export function getNextWorkDayAfter(dateStr: string, config: CalendarConfig, lagDays = 0): string {
  let curr = new Date(parseDateUtc(dateStr).getTime() + 24 * 60 * 60 * 1000);
  let attempts = 0;
  while (attempts < 365) {
    const formatted = formatDateUtc(curr);
    if (isWorkDay(formatted, config)) {
      if (lagDays <= 0) {
        return formatted;
      }
      return calculateEndDate(formatted, lagDays + 1, config);
    }
    curr = new Date(curr.getTime() + 24 * 60 * 60 * 1000);
    attempts++;
  }
  return dateStr;
}

/**
 * Counts total work days between two dates inclusive.
 */
export function countWorkDaysBetween(startDateStr: string, endDateStr: string, config: CalendarConfig): number {
  if (startDateStr > endDateStr) return 0;
  let curr = parseDateUtc(startDateStr);
  const end = parseDateUtc(endDateStr);
  let count = 0;

  while (curr.getTime() <= end.getTime()) {
    const formatted = formatDateUtc(curr);
    if (isWorkDay(formatted, config)) {
      count++;
    }
    curr = new Date(curr.getTime() + 24 * 60 * 60 * 1000);
  }

  return count;
}

/**
 * Formats date into standard Brazilian format: 'DD/MM/YYYY' or 'DD/MM'.
 */
export function formatBrDate(dateStr: string, includeYear = true): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('T')[0].split('-');
  return includeYear ? `${d}/${m}/${y}` : `${d}/${m}`;
}

/**
 * Returns day name in Portuguese ('Seg', 'Ter', etc.)
 */
export function getDayOfWeekBr(dateStr: string): string {
  const date = parseDateUtc(dateStr);
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[date.getUTCDay()];
}

/**
 * Generates an array of all date strings between start and end.
 */
export function getDateRange(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  let curr = parseDateUtc(startDateStr);
  const end = parseDateUtc(endDateStr);

  while (curr.getTime() <= end.getTime()) {
    dates.push(formatDateUtc(curr));
    curr = new Date(curr.getTime() + 24 * 60 * 60 * 1000);
  }

  return dates;
}
