import { describe, it, expect } from 'vitest';
import {
  parseDateString,
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
      const testCases = [
        '2025-01-01',
        '2025-01-15',
        '2025-01-31',
        '2025-06-15',
        '2025-12-31',
      ];

      for (const dateStr of testCases) {
        const parsed = parseDateString(dateStr);
        const [year, month, day] = dateStr.split('-').map(Number);

        expect(parsed.getFullYear()).toBe(year);
        expect(parsed.getMonth()).toBe(month - 1); // JS months are 0-indexed
        expect(parsed.getDate()).toBe(day);
      }
    });
  });
});
