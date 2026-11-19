import { TaskStatus } from '../types/taskflow';

/**
 * PRD Section 6: "Use 19 November 2026 as the local test date."
 */
export const TEST_LOCAL_TODAY = '2026-11-19';

export type DeadlineUrgency = 'Overdue' | 'Due today' | null;

/**
 * Validates a YYYY-MM-DD calendar date string without timezone shifts.
 */
export function isValidCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

/**
 * Formats a YYYY-MM-DD calendar date cleanly without timezone drift.
 */
export function formatCalendarDate(dateStr: string | null): string {
  if (!dateStr) return 'No deadline';
  if (!isValidCalendarDate(dateStr)) return dateStr;

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const localDate = new Date(
    Number(yearStr),
    Number(monthStr) - 1,
    Number(dayStr)
  );
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(localDate);
}

/**
 * Determines Overdue / Due today urgency for unfinished tasks relative to local test date.
 * Done tasks never show urgency styling.
 */
export function getDeadlineUrgency(
  dueDate: string | null,
  status: TaskStatus,
  todayStr: string = TEST_LOCAL_TODAY
): DeadlineUrgency {
  if (!dueDate || status === 'Done') {
    return null;
  }
  if (dueDate < todayStr) {
    return 'Overdue';
  }
  if (dueDate === todayStr) {
    return 'Due today';
  }
  return null;
}

/**
 * Renders ISO comment timestamp in the viewer's local time.
 */
export function formatCommentTimestamp(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
