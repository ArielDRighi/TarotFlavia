/**
 * Shared date utilities for the birth-chart module.
 *
 * These helpers centralise the handling of birth-date strings so that every
 * service dealing with `YYYY-MM-DD` input produces consistent, timezone-safe
 * Date objects.
 */

/**
 * Parses a `YYYY-MM-DD` date string as a **local-midnight** Date.
 *
 * ### Why not `new Date('YYYY-MM-DD')`?
 * The ECMAScript spec mandates that a bare ISO-8601 date string is parsed as
 * **UTC midnight**.  When the process timezone is behind UTC (e.g. UTC-3 in
 * Argentina), that instant falls on the *previous* calendar day in local time.
 * The node-postgres driver then serialises the value using local time before
 * sending it to the PostgreSQL `date` column, which stores the day-before.
 *
 * Using `new Date(year, month - 1, day)` creates a local-midnight instant,
 * matching exactly what the user typed.
 *
 * @param dateStr - Date string in `YYYY-MM-DD` format (validated by DTO layer).
 * @throws Error if the string does not split into exactly three numeric parts
 *   or if JavaScript would silently normalise an invalid calendar date
 *   (e.g. `2024-02-30` → `2024-03-01`).
 */
export function parseBirthDate(dateStr: string): Date {
  const parts = dateStr.split('-');

  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  const [year, month, day] = parts.map(Number);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  const date = new Date(year, month - 1, day);

  // Guard against JavaScript Date normalisation (e.g. 2024-02-30 → 2024-03-01)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  return date;
}
