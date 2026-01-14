/**
 * Date utilities for consistent date handling across the application.
 *
 * IMPORTANT: All date operations use UTC to ensure consistency across
 * different server timezones and to match PostgreSQL DATE column behavior.
 *
 * @module common/utils/date
 */

/**
 * Returns today's date as a string in 'YYYY-MM-DD' format (UTC).
 *
 * This format is safe for:
 * - PostgreSQL DATE column comparisons
 * - Consistent behavior across timezones
 * - String-based equality checks in queries
 *
 * @example
 * // Returns '2025-01-15' when called on January 15, 2025 UTC
 * const today = getTodayUTCDateString();
 *
 * @returns {string} Date string in 'YYYY-MM-DD' format
 */
export function getTodayUTCDateString(): string {
  return formatDateToUTCString(new Date());
}

/**
 * Formats a Date object to 'YYYY-MM-DD' string using UTC components.
 *
 * @param date - The date to format
 * @returns {string} Date string in 'YYYY-MM-DD' format
 *
 * @example
 * const date = new Date('2025-01-15T23:00:00Z');
 * formatDateToUTCString(date); // Returns '2025-01-15'
 */
export function formatDateToUTCString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the start of today (00:00:00.000 UTC) as a Date object.
 *
 * Useful for TIMESTAMP column comparisons with MoreThanOrEqual.
 *
 * @returns {Date} Date object set to today at 00:00:00.000 UTC
 *
 * @example
 * const startOfDay = getStartOfTodayUTC();
 * // Use with TypeORM: createdAt: MoreThanOrEqual(startOfDay)
 */
export function getStartOfTodayUTC(): Date {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now;
}

/**
 * Returns the start of tomorrow (00:00:00.000 UTC) as a Date object.
 *
 * Useful for calculating time until limit reset.
 *
 * @returns {Date} Date object set to tomorrow at 00:00:00.000 UTC
 */
export function getStartOfTomorrowUTC(): Date {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
}

/**
 * Returns a date N days ago as a 'YYYY-MM-DD' string (UTC).
 *
 * Useful for cleanup operations and retention policies.
 *
 * @param days - Number of days to subtract
 * @returns {string} Date string in 'YYYY-MM-DD' format
 *
 * @example
 * // Get the cutoff date for 7-day retention
 * const cutoff = getDateDaysAgoUTCString(7);
 */
export function getDateDaysAgoUTCString(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(0, 0, 0, 0);
  return formatDateToUTCString(date);
}
