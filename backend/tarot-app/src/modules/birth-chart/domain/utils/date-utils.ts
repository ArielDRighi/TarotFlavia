/**
 * Shared date utilities for the birth-chart module.
 *
 * These helpers centralise the handling of birth-date strings so that every
 * service dealing with `YYYY-MM-DD` input produces consistent, timezone-safe
 * Date objects.
 *
 * ## TypeORM DATE Column Storage Contract
 *
 * TypeORM's PostgreSQL driver serialises Date objects to the database using
 * LOCAL time getters (`getFullYear`, `getMonth`, `getDate`) via
 * `DateUtils.mixedDateToDateString`. Therefore, Date objects representing
 * calendar days MUST be created as LOCAL midnight (`new Date(year, month-1, day)`)
 * so that TypeORM sends the correct `YYYY-MM-DD` string to PostgreSQL.
 *
 * Using UTC midnight (`new Date(Date.UTC(...))`) causes a 1-day shift in
 * UTC-negative timezones (e.g. UTC-3 Argentina): `getDate()` on a UTC-midnight
 * Date returns the PREVIOUS calendar day, so TypeORM writes the wrong date.
 *
 * On READ, the postgres-date library also creates local-midnight Dates:
 *   `new Date(year, month, day)` — see postgres-date/index.js getDate().
 * TypeORM then calls `mixedDateToDateString` on that local-midnight Date,
 * returning a plain `YYYY-MM-DD` string (not a Date object) from the entity.
 *
 * ⚠️  DO NOT change parseBirthDate to use Date.UTC or new Date('YYYY-MM-DD').
 *     Both produce UTC-midnight dates which break storage via TypeORM in UTC-
 *     server environments. Always use `new Date(year, month-1, day)` (local).
 */

/**
 * Parses a `YYYY-MM-DD` date string as a **local-midnight** Date.
 *
 * ### Why local midnight (`new Date(year, month-1, day)`)?
 * TypeORM's PostgreSQL driver serialises Date objects using LOCAL getters
 * (`getDate()`, not `getUTCDate()`).  A local-midnight Date has `getDate()` == day
 * in any timezone, so TypeORM always writes the correct `YYYY-MM-DD` string.
 *
 * Using UTC midnight (`Date.UTC`) causes TypeORM to write the PREVIOUS calendar
 * day in UTC-negative timezones (e.g. UTC-3 Argentina, where UTC midnight is
 * Oct 18 21:00 local, making `getDate()` return 18 instead of 19).
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

  // LOCAL midnight: TypeORM uses getDate() (local) to serialise → correct YYYY-MM-DD
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

/**
 * Formats a Date back to a `YYYY-MM-DD` string using LOCAL parts.
 *
 * ### Why local parts (`get*`) and not UTC parts (`getUTC*`)?
 * Dates created by `parseBirthDate` and by postgres-date on read are
 * LOCAL-midnight Dates.  Using local getters ensures we always read back the
 * intended calendar day (`getDate()` == the typed day in any timezone).
 *
 * Note: since TypeORM returns a plain `YYYY-MM-DD` string (not a Date object)
 * for `date` columns, this function is mainly used as a fallback safety net when
 * `chart.birthDate` is a Date object (e.g. from in-memory upsert results).
 *
 * @param date - A Date object representing a local-midnight calendar day.
 * @returns The date formatted as `YYYY-MM-DD`.
 */
export function formatBirthDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
