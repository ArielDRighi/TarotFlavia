import { describe, it, expect } from 'vitest';
import {
  parseDateString,
  parseTimestamp,
  formatTimeAgo,
  formatTimestampLocalized,
  formatTimestamp,
  formatDateFull,
  formatDateFullWithYear,
  formatDateShort,
  formatDateCompact,
  formatDateLocalized,
} from './date';

describe('date utilities', () => {
  describe('parseDateString', () => {
    it('should parse DATE-only format (YYYY-MM-DD) without timezone shift', () => {
      const date = parseDateString('2025-01-15');

      // The date should always be January 15, regardless of timezone
      expect(date.getDate()).toBe(15);
      expect(date.getMonth()).toBe(0); // January
      expect(date.getFullYear()).toBe(2025);
    });

    it('should parse full ISO 8601 timestamp', () => {
      const date = parseDateString('2025-01-15T14:30:00.000Z');

      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0); // January
      // Note: getDate() and getHours() will vary by timezone, which is expected for timestamps
    });

    it('should handle edge case dates correctly', () => {
      // First day of month
      const jan1 = parseDateString('2025-01-01');
      expect(jan1.getDate()).toBe(1);
      expect(jan1.getMonth()).toBe(0);

      // Last day of month
      const jan31 = parseDateString('2025-01-31');
      expect(jan31.getDate()).toBe(31);
      expect(jan31.getMonth()).toBe(0);

      // Year boundary
      const dec31 = parseDateString('2024-12-31');
      expect(dec31.getDate()).toBe(31);
      expect(dec31.getMonth()).toBe(11);
      expect(dec31.getFullYear()).toBe(2024);
    });

    it('should handle leap year dates', () => {
      const leapDay = parseDateString('2024-02-29');
      expect(leapDay.getDate()).toBe(29);
      expect(leapDay.getMonth()).toBe(1); // February
    });
  });

  describe('formatDateFull', () => {
    it('should format date in Spanish with capitalized first letter', () => {
      const result = formatDateFull('2025-01-15');

      // Should contain day of week, day number, "de", and month
      // Using unicode letter class to support accented characters (Miércoles, etc.)
      expect(result).toMatch(/^[\p{L}]+\s+\d+\s+de\s+[\p{L}]+$/u);
      // First character should be uppercase
      expect(result.charAt(0)).toBe(result.charAt(0).toUpperCase());
    });

    it('should handle different dates correctly', () => {
      // These tests verify the format is consistent, not the exact Spanish translation
      const result1 = formatDateFull('2025-01-01');
      const result2 = formatDateFull('2025-12-25');

      expect(result1).toContain('1 de');
      expect(result2).toContain('25 de');
    });
  });

  describe('formatDateFullWithYear', () => {
    it('should include year in the formatted output', () => {
      const result = formatDateFullWithYear('2025-01-15');

      expect(result).toContain('2025');
      // Using unicode letter class to support accented characters
      expect(result).toMatch(/^[\p{L}]+\s+\d+\s+de\s+[\p{L}]+\s+de\s+\d{4}$/u);
    });
  });

  describe('formatDateShort', () => {
    it('should format date as dd/MM/yyyy', () => {
      const result = formatDateShort('2025-01-15');

      expect(result).toBe('15/01/2025');
    });

    it('should pad single digits with zeros', () => {
      const result = formatDateShort('2025-01-05');

      expect(result).toBe('05/01/2025');
    });
  });

  describe('formatDateCompact', () => {
    it('should format date as M/d', () => {
      const result = formatDateCompact('2025-01-15');

      expect(result).toBe('1/15');
    });

    it('should not pad with zeros', () => {
      const result = formatDateCompact('2025-01-05');

      expect(result).toBe('1/5');
    });

    it('should handle double-digit months', () => {
      const result = formatDateCompact('2025-12-25');

      expect(result).toBe('12/25');
    });
  });

  describe('formatDateLocalized', () => {
    it('should format using es-ES locale by default', () => {
      const result = formatDateLocalized('2025-01-15');

      // Should contain Spanish month name
      expect(result.toLowerCase()).toContain('enero');
      expect(result).toContain('2025');
    });

    it('should accept custom options', () => {
      const result = formatDateLocalized('2025-01-15', {
        weekday: 'long',
      });

      // Should include weekday when specified
      expect(result.length).toBeGreaterThan(formatDateLocalized('2025-01-15').length);
    });
  });

  describe('timezone safety', () => {
    /**
     * This test verifies the core problem is solved:
     * DATE-only strings should always display the correct date,
     * regardless of the user's timezone.
     *
     * The bug was: new Date('2025-01-15') in UTC-3 timezone
     * would show January 14 instead of January 15.
     */
    it('DATE-only strings should not shift dates due to timezone', () => {
      const testCases = ['2025-01-01', '2025-01-15', '2025-01-31', '2025-06-15', '2025-12-31'];

      for (const dateStr of testCases) {
        const parsed = parseDateString(dateStr);
        const [year, month, day] = dateStr.split('-').map(Number);

        expect(parsed.getFullYear()).toBe(year);
        expect(parsed.getMonth()).toBe(month - 1); // JS months are 0-indexed
        expect(parsed.getDate()).toBe(day);
      }
    });
  });

  describe('parseTimestamp', () => {
    it('should parse ISO timestamp with Z suffix as UTC', () => {
      const date = parseTimestamp('2026-02-22T12:30:00.000Z');

      // UTC time components should be correct
      expect(date.getUTCFullYear()).toBe(2026);
      expect(date.getUTCMonth()).toBe(1); // February
      expect(date.getUTCDate()).toBe(22);
      expect(date.getUTCHours()).toBe(12);
      expect(date.getUTCMinutes()).toBe(30);
    });

    it('should parse ISO timestamp WITHOUT Z suffix as UTC (key fix)', () => {
      // TypeORM may return TIMESTAMP as string without 'Z'.
      // Without this fix, JavaScript would treat it as local time,
      // showing "in 3 hours" for UTC-3 users when it was just created.
      const withZ = parseTimestamp('2026-02-22T12:30:00.000Z');
      const withoutZ = parseTimestamp('2026-02-22T12:30:00.000000');

      // Both should represent the same UTC instant
      expect(withZ.getTime()).toBe(withoutZ.getTime());
    });

    it('should parse ISO timestamp with numeric timezone offset', () => {
      const date = parseTimestamp('2026-02-22T09:30:00.000-03:00');

      // 09:30 at UTC-3 = 12:30 UTC
      expect(date.getUTCHours()).toBe(12);
      expect(date.getUTCMinutes()).toBe(30);
    });

    it('should handle fractional seconds without Z', () => {
      const withZ = parseTimestamp('2026-01-15T08:00:00.123456Z');
      const withoutZ = parseTimestamp('2026-01-15T08:00:00.123456');

      // Both represent the same UTC instant
      expect(withZ.getTime()).toBe(withoutZ.getTime());
    });

    it('should handle timestamps from TypeORM Date.toISOString()', () => {
      // toISOString() always produces 'Z' suffix — this should parse identically
      const isoString = '2026-03-10T15:45:00.000Z';
      const date = parseTimestamp(isoString);

      expect(date.getUTCFullYear()).toBe(2026);
      expect(date.getUTCMonth()).toBe(2); // March
      expect(date.getUTCDate()).toBe(10);
      expect(date.getUTCHours()).toBe(15);
    });
  });

  describe('formatTimeAgo', () => {
    it('should return a string', () => {
      const result = formatTimeAgo('2026-01-01T00:00:00.000Z');

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return the same result for same UTC time with and without Z', () => {
      // Core regression test: both strings represent the same UTC instant —
      // formatTimeAgo must produce identical relative time strings for both.
      const resultWithZ = formatTimeAgo('2025-06-15T10:00:00.000Z');
      const resultWithoutZ = formatTimeAgo('2025-06-15T10:00:00.000000');

      expect(resultWithZ).toBe(resultWithoutZ);
    });

    it('should produce Spanish output', () => {
      const result = formatTimeAgo('2020-01-01T00:00:00.000Z');

      // Spanish locale uses "hace" for past times
      expect(result).toMatch(/hace|más de/i);
    });
  });

  describe('formatTimestampLocalized', () => {
    it('should produce identical results for same UTC time with and without Z', () => {
      // Defense-in-depth regression test: both strings represent the same UTC instant.
      // Without parseTimestamp(), only the Z-prefixed version would produce the correct output.
      const withZ = formatTimestampLocalized('2026-02-22T14:00:00.000Z', 'es-AR');
      const withoutZ = formatTimestampLocalized('2026-02-22T14:00:00.000000', 'es-AR');

      expect(withZ).toBe(withoutZ);
    });

    it('should include year, month and day in output', () => {
      const result = formatTimestampLocalized('2026-02-22T00:00:00.000Z', 'es-AR');

      expect(result).toContain('2026');
    });

    it('should accept custom locale', () => {
      const esAR = formatTimestampLocalized('2026-02-22T00:00:00.000Z', 'es-AR');
      const esES = formatTimestampLocalized('2026-02-22T00:00:00.000Z', 'es-ES');

      // Both are strings with content
      expect(typeof esAR).toBe('string');
      expect(typeof esES).toBe('string');
    });

    it('should accept additional Intl.DateTimeFormatOptions', () => {
      const withHour = formatTimestampLocalized('2026-02-22T14:00:00.000Z', 'es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Hour info should be present in the output — look for a time pattern (HH:MM)
      expect(withHour).toMatch(/\d{1,2}:\d{2}/);
      // Date portion should still be present
      expect(withHour).toContain('22');
    });
  });

  describe('formatTimestamp', () => {
    it('should produce identical results for same UTC time with and without Z', () => {
      const pattern = "d 'de' MMMM 'de' yyyy";
      const withZ = formatTimestamp('2026-02-22T14:00:00.000Z', pattern);
      const withoutZ = formatTimestamp('2026-02-22T14:00:00.000000', pattern);

      expect(withZ).toBe(withoutZ);
    });

    it('should format date using the provided pattern', () => {
      // Use noon UTC so the local date (even in UTC-12) stays on the same calendar day
      const result = formatTimestamp('2026-03-10T12:00:00.000Z', 'yyyy-MM-dd');

      // Regardless of timezone, 12:00 UTC is still March 10 everywhere (UTC-12 to UTC+12)
      expect(result).toBe('2026-03-10');
    });

    it('should include time component when pattern includes HH:mm', () => {
      // Verify that the time portion in the output reflects LOCAL time,
      // not UTC. We test structural consistency rather than an absolute UTC value
      // (the user should always see their own local time).
      const resultA = formatTimestamp('2026-02-22T14:30:00.000Z', 'yyyy-MM-dd HH:mm');
      const resultB = formatTimestamp('2026-02-22T20:30:00.000Z', 'yyyy-MM-dd HH:mm');

      // Both are non-empty strings with the correct structure
      expect(resultA).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
      // resultB is 6 hours later, so its numeric time should be greater
      expect(resultB > resultA).toBe(true);
    });
  });
});
