/**
 * Date utilities for consistent date handling across the application.
 *
 * IMPORTANT: Two-Layer Defense Architecture
 * ==========================================
 *
 * Layer 1 — Backend (primary fix):
 * ---------------------------------
 * `pg.types.setTypeParser(1114, val => new Date(val + 'Z'))` in typeorm.ts ensures
 * TIMESTAMP WITHOUT TIME ZONE columns are deserialized as UTC by node-postgres.
 * Without this, the pg driver calls `new Date(rawString)` on values like
 * "2026-02-22T11:48:39" (no Z), which ECMAScript treats as LOCAL time, causing
 * a systematic 3-hour offset on UTC-3 machines (stored 11:48 → returned as 14:48Z).
 *
 * Layer 2 — Frontend (defense-in-depth):
 * ----------------------------------------
 * All timestamp display calls MUST use `parseTimestamp()` or the utility functions
 * below (`formatTimestampLocalized`, `formatTimeAgo`). This protects against:
 *   - Misconfigured environments where the pg fix wasn't applied
 *   - Direct API calls bypassing the TypeORM config
 *   - Future data sources that don't go through this pg adapter
 *
 * Date String Formats from Backend:
 * ----------------------------------
 * 1. DATE columns (e.g., birthDate): 'YYYY-MM-DD' string → Use `parseDateString()`
 * 2. TIMESTAMP columns (e.g., createdAt): ISO 8601 with 'Z' → Use `parseTimestamp()`
 *
 * The DATE Problem:
 * -----------------
 * `new Date('YYYY-MM-DD')` parses as UTC midnight (00:00:00Z), which shifts the
 * visible date by 1 day for UTC-negative users (e.g., 2025-01-15 → Jan 14 in UTC-3).
 *
 *   parseDateString('2025-01-15') → new Date(2025, 0, 15, 12) → Always shows Jan 15
 *
 * Usage Guidelines:
 * -----------------
 * - DATE columns    → `parseDateString()`, `formatDateFull/Short/etc`
 * - TIMESTAMP display → `formatTimestampLocalized()`, `formatTimeAgo()`
 * - TIMESTAMP with date-fns → `format(parseTimestamp(str), pattern, { locale: es })`
 * - NEVER use bare `new Date(x.createdAt)` for display — always wrap with `parseTimestamp()`
 */

import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Parses a date string safely, handling both DATE (YYYY-MM-DD) and
 * TIMESTAMP (ISO 8601) formats from the backend.
 *
 * For DATE-only strings, constructs a Date at noon local time to prevent timezone date shifts.
 * For full timestamps, parses directly.
 *
 * @param dateString - Date string from backend (YYYY-MM-DD or ISO 8601)
 * @returns Parsed Date object
 *
 * @example
 * // DATE column from backend
 * parseDateString('2025-01-15') // → Date representing Jan 15, 2025
 *
 * // TIMESTAMP column from backend
 * parseDateString('2025-01-15T14:30:00.000Z') // → Date with exact time
 */
export function parseDateString(dateString: string): Date {
  // Check if it's a DATE-only format (YYYY-MM-DD, exactly 10 chars, no time component)
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString);

  if (isDateOnly) {
    // Construct a local Date at noon to prevent timezone date shift,
    // without relying on implementation-dependent string parsing.
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  // Full timestamp - parse directly
  return new Date(dateString);
}

/**
 * Parses a full timestamp string from the backend, ensuring it is treated as UTC.
 *
 * Defense-in-depth: The primary fix is `pg.types.setTypeParser(1114)` in the backend
 * (typeorm.ts), which ensures node-postgres returns correct UTC-anchored Date objects.
 * This function provides a second layer of protection for environments where the
 * backend fix may not be active (e.g., different DB adapter, misconfigured env).
 *
 * Problem: Without the backend fix, TypeORM returns TIMESTAMP columns as strings
 * WITHOUT a timezone indicator (e.g., "2026-02-22T12:30:00.000000"). ECMAScript
 * specifies that date-time strings without a timezone offset are interpreted as
 * LOCAL time, causing UTC timestamps to appear shifted (e.g., "in 3 hours" for UTC-3).
 *
 * Solution: If the string has no timezone indicator, append 'Z' to force UTC parsing.
 *
 * @param dateString - Timestamp string from backend (ISO 8601, with or without 'Z')
 * @returns Parsed Date object anchored to the correct UTC instant
 *
 * @example
 * parseTimestamp('2026-02-22T12:30:00.000000') // → same as new Date('2026-02-22T12:30:00.000000Z')
 * parseTimestamp('2026-02-22T12:30:00.000Z')   // → same as new Date('2026-02-22T12:30:00.000Z')
 */
export function parseTimestamp(dateString: string): Date {
  // Check if the string already has timezone info (ends with Z or ±HH:MM / ±HHMM)
  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(dateString);
  if (!hasTimezone && dateString.includes('T')) {
    // No timezone indicator — treat as UTC by appending 'Z'
    return new Date(`${dateString}Z`);
  }
  return new Date(dateString);
}

/**
 * Formats a timestamp as a relative time string in Spanish (e.g., "hace 2 horas").
 *
 * Uses `parseTimestamp` internally to ensure UTC timestamps from the backend
 * are handled correctly regardless of whether the 'Z' suffix is present.
 * This prevents the common "in 3 hours" bug for users in negative UTC offsets.
 *
 * @param dateString - Timestamp string from backend (ISO 8601)
 * @returns Relative time string in Spanish (e.g., "hace 5 minutos", "en 3 horas")
 *
 * @example
 * formatTimeAgo('2026-02-22T09:00:00.000Z')   // → "hace 5 minutos" (if now is 09:05 UTC)
 * formatTimeAgo('2026-02-22T09:00:00.000000') // → same result (UTC inferred)
 */
export function formatTimeAgo(dateString: string): string {
  const date = parseTimestamp(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
}

/**
 * Formats a backend TIMESTAMP column as a localized date string.
 *
 * Equivalent to `new Date(x.createdAt).toLocaleDateString(locale, options)` but safe:
 * uses `parseTimestamp()` to guarantee correct UTC interpretation (two-layer defense-in-depth).
 *
 * ALWAYS prefer this over bare `new Date(timestampString).toLocaleDateString(...)`.
 *
 * @param dateString - TIMESTAMP string from backend (ISO 8601)
 * @param locale     - BCP 47 locale tag, defaults to 'es-AR'
 * @param options    - Standard Intl.DateTimeFormatOptions overrides
 * @returns Localized date string
 *
 * @example
 * formatTimestampLocalized('2026-02-22T14:00:00.000Z')
 *   // → "22 de febrero de 2026" (in 'es-AR', UTC-3 display is correct)
 *
 * formatTimestampLocalized('2026-02-22T14:00:00.000Z', 'es-AR', { hour: '2-digit', minute: '2-digit' })
 *   // → "22 de febrero de 2026, 11:00"
 */
export function formatTimestampLocalized(
  dateString: string,
  locale: string = 'es-AR',
  options?: Intl.DateTimeFormatOptions
): string {
  const date = parseTimestamp(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

/**
 * Formats a backend TIMESTAMP column with date-fns format pattern.
 *
 * Equivalent to `format(new Date(x.createdAt), pattern, { locale: es })` but safe:
 * uses `parseTimestamp()` for correct UTC interpretation.
 *
 * ALWAYS prefer this over bare `format(new Date(timestampString), ...)`.
 *
 * @param dateString - TIMESTAMP string from backend (ISO 8601)
 * @param pattern    - date-fns format pattern
 * @param locale     - date-fns locale, defaults to `es`
 * @returns Formatted date string
 *
 * @example
 * formatTimestamp('2026-02-22T14:00:00.000Z', "d 'de' MMMM 'de' yyyy, HH:mm")
 *   // → "22 de febrero de 2026, 11:00"
 */
export function formatTimestamp(dateString: string, pattern: string, fnsLocale = es): string {
  return format(parseTimestamp(dateString), pattern, { locale: fnsLocale });
}

/**
 * Formats a date to Spanish full format with capitalized first letter.
 * e.g., "Lunes 2 de diciembre"
 *
 * @param dateString - Date string from backend
 * @returns Formatted date string in Spanish
 *
 * @example
 * formatDateFull('2025-01-15') // → "Miércoles 15 de enero"
 */
export function formatDateFull(dateString: string): string {
  const date = parseDateString(dateString);
  const formatted = format(date, "EEEE d 'de' MMMM", { locale: es });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Formats a date to Spanish full format with year.
 * e.g., "Lunes 2 de diciembre de 2025"
 *
 * @param dateString - Date string from backend
 * @returns Formatted date string in Spanish with year
 *
 * @example
 * formatDateFullWithYear('2025-01-15') // → "Miércoles 15 de enero de 2025"
 */
export function formatDateFullWithYear(dateString: string): string {
  const date = parseDateString(dateString);
  const formatted = format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Formats a date to short numeric format.
 * e.g., "15/01/2025"
 *
 * @param dateString - Date string from backend
 * @returns Formatted date string (dd/MM/yyyy)
 *
 * @example
 * formatDateShort('2025-01-15') // → "15/01/2025"
 */
export function formatDateShort(dateString: string): string {
  const date = parseDateString(dateString);
  return format(date, 'dd/MM/yyyy', { locale: es });
}

/**
 * Formats a date to month/day format for charts and compact displays.
 * e.g., "1/15"
 *
 * @param dateString - Date string from backend
 * @returns Formatted date string (M/d)
 *
 * @example
 * formatDateCompact('2025-01-15') // → "1/15"
 */
export function formatDateCompact(dateString: string): string {
  const date = parseDateString(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * Formats a date to localized string using browser locale.
 *
 * @param dateString - Date string from backend
 * @param options - Intl.DateTimeFormat options
 * @returns Localized date string
 *
 * @example
 * formatDateLocalized('2025-01-15') // → "15 de enero de 2025"
 */
export function formatDateLocalized(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = parseDateString(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}
