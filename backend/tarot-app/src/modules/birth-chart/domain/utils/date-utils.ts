/**
 * Shared date utilities for the birth-chart module.
 *
 * These helpers centralise the handling of birth-date strings so that every
 * service dealing with `YYYY-MM-DD` input produces consistent, timezone-safe
 * Date objects.
 */

/**
 * Parses a `YYYY-MM-DD` date string as a **UTC-midnight** Date.
 *
 * ### Why UTC midnight (`Date.UTC`)?
 * PostgreSQL's `date` column driver returns values as UTC-midnight Date objects
 * (e.g. `new Date('1990-05-15T00:00:00.000Z')`).  Using `Date.UTC` ensures
 * that both newly created dates and values retrieved from the database have the
 * same representation, so that `formatBirthDate` can always use `getUTC*`
 * accessors to read back the correct calendar day regardless of server timezone.
 *
 * ### Why not `new Date('YYYY-MM-DD')`?
 * While the ECMAScript spec also parses bare ISO-8601 date strings as UTC
 * midnight, using `Date.UTC` with explicit numeric parts is safer: it avoids
 * any ambiguity introduced by JS engine implementations and makes the intent
 * explicit in the code.
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

  const date = new Date(Date.UTC(year, month - 1, day));

  // Guard against JavaScript Date normalisation (e.g. 2024-02-30 → 2024-03-01)
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  return date;
}

/**
 * Formats a Date back to a `YYYY-MM-DD` string using UTC parts.
 *
 * ### Why UTC parts (`getUTC*`) and not local parts (`get*`)?
 * Dates that represent calendar days (birth dates) are stored as UTC-midnight
 * by both PostgreSQL's `date` column driver and by `new Date('YYYY-MM-DD')`
 * or `new Date('YYYY-MM-DDTZ')`.  Using UTC getters ensures we always read
 * back the intended calendar day regardless of the server timezone, because
 * the UTC midnight instant is unambiguous.
 *
 * Using local getters (`getFullYear`, `getDate`) would produce the wrong
 * day in timezones behind UTC (e.g. UTC-3 Argentina) where UTC midnight is
 * the previous calendar day in local time.
 *
 * @param date - A Date object representing a UTC-midnight calendar day.
 * @returns The date formatted as `YYYY-MM-DD`.
 */
export function formatBirthDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
