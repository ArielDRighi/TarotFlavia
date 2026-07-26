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

/**
 * Returns the start of the current month (00:00:00.000 UTC on day 1) as a Date object.
 *
 * Useful for TIMESTAMP column comparisons for monthly limits.
 *
 * @returns {Date} Date object set to the first day of the current month at 00:00:00.000 UTC
 *
 * @example
 * const startOfMonth = getStartOfMonthUTC();
 * // Returns '2025-02-01T00:00:00.000Z' when called in February 2025
 * // Use with TypeORM: createdAt: MoreThanOrEqual(startOfMonth)
 */
export function getStartOfMonthUTC(): Date {
  const now = new Date();
  now.setUTCDate(1); // Set to first day of month
  now.setUTCHours(0, 0, 0, 0);
  return now;
}

// ============================================================================
// App business day (Argentina) — daily usage/limit boundary
// ============================================================================

/**
 * App business timezone. The DAILY usage/limit "day" resets at local midnight
 * in this timezone, NOT at UTC midnight, because the audience is in Argentina
 * and a UTC boundary meant limits reset at 21:00 local.
 *
 * Argentina currently has NO DST (fixed UTC-3). If that ever changes, replace
 * APP_UTC_OFFSET with an Intl-based offset computed per instant.
 */
export const APP_TIMEZONE = 'America/Argentina/Buenos_Aires';
const APP_UTC_OFFSET = '-03:00';

/**
 * Returns the current calendar day in the app timezone as 'YYYY-MM-DD'.
 * This is the key used for daily usage records and daily limit comparisons.
 *
 * @param now - Instant to evaluate (defaults to now)
 * @example
 * // At 2026-07-25T01:00:00Z (2026-07-24 22:00 in Argentina) → '2026-07-24'
 */
export function getTodayAppDateString(now: Date = new Date()): string {
  // 'en-CA' formats dates as 'YYYY-MM-DD'.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/**
 * Returns the UTC instant of the most recent app-timezone midnight (start of the
 * current app day). Use for TIMESTAMP comparisons like `createdAt >= start`.
 *
 * @param now - Instant to evaluate (defaults to now)
 */
export function getStartOfTodayApp(now: Date = new Date()): Date {
  return new Date(`${getTodayAppDateString(now)}T00:00:00${APP_UTC_OFFSET}`);
}

/**
 * Returns the UTC instant of the next app-timezone midnight (when the daily
 * limits reset). Used for `resetAt` in capabilities.
 *
 * @param now - Instant to evaluate (defaults to now)
 */
export function getNextAppMidnight(now: Date = new Date()): Date {
  // Fixed -3 offset ⇒ start-of-app-day + 24h is the next app midnight.
  return new Date(getStartOfTodayApp(now).getTime() + 24 * 60 * 60 * 1000);
}

/**
 * Returns the app-timezone date N days ago as 'YYYY-MM-DD'. Used for retention
 * cleanup so the cutoff matches the app-day keys stored on usage records.
 *
 * @param days - Number of days to subtract
 * @param now - Instant to evaluate (defaults to now)
 */
export function getDateDaysAgoAppString(
  days: number,
  now: Date = new Date(),
): string {
  return getTodayAppDateString(
    new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
  );
}
