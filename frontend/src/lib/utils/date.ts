/**
 * Date utilities for consistent date handling across the application.
 *
 * IMPORTANT: Date String Format Handling
 * =======================================
 * The backend returns dates in two formats:
 *
 * 1. DATE columns (e.g., reading_date): 'YYYY-MM-DD' string
 * 2. TIMESTAMP columns (e.g., createdAt): ISO 8601 string with timezone
 *
 * The Problem:
 * ------------
 * Using `new Date('YYYY-MM-DD')` interprets the date as UTC midnight (00:00:00Z).
 * When displayed in a negative UTC offset timezone (e.g., Argentina UTC-3),
 * this shifts the date to the PREVIOUS day:
 *
 *   new Date('2025-01-15') → 2025-01-15T00:00:00Z → 2025-01-14T21:00:00-03:00
 *
 * The Solution:
 * -------------
 * For DATE-only strings, we construct a Date at noon LOCAL time using
 * the Date constructor with explicit year, month, day, and hour values.
 * This avoids implementation-dependent string parsing and ensures
 * the date displays correctly in ANY timezone worldwide:
 *
 *   parseDateString('2025-01-15') → new Date(2025, 0, 15, 12) → Always shows Jan 15
 *
 * Usage Guidelines:
 * -----------------
 * - Use `parseDateString()` for backend DATE columns (YYYY-MM-DD format)
 * - Use `new Date()` directly for ISO 8601 timestamps with timezone info
 * - Use the formatting functions for consistent locale-aware display
 */

import { format } from 'date-fns';
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
