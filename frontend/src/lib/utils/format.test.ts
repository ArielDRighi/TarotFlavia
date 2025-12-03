import { describe, it, expect } from 'vitest';
import { formatDate, formatRelativeTime, formatPrice, truncateText } from '@/lib/utils/format';

describe('format utilities', () => {
  describe('formatDate', () => {
    it('should format date to Spanish locale', () => {
      const date = new Date('2025-12-03');
      const result = formatDate(date);
      expect(result).toContain('diciembre');
      expect(result).toContain('2025');
    });

    it('should handle string dates', () => {
      const result = formatDate('2025-06-15');
      expect(result).toContain('junio');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "ahora" for recent times', () => {
      const now = new Date();
      const result = formatRelativeTime(now);
      expect(result).toBe('ahora');
    });

    it('should return minutes ago for recent times', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatRelativeTime(fiveMinutesAgo);
      expect(result).toContain('minutos');
    });

    it('should return hours ago for times within a day', () => {
      const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
      const result = formatRelativeTime(fiveHoursAgo);
      expect(result).toContain('horas');
    });

    it('should return days ago for times within a week', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(threeDaysAgo);
      expect(result).toContain('días');
    });

    it('should return weeks ago for times within a month', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoWeeksAgo);
      expect(result).toContain('semanas');
    });

    it('should return formatted date for old times', () => {
      const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(oldDate);
      expect(result).toContain('2025');
    });
  });

  describe('formatPrice', () => {
    it('should format price in EUR by default', () => {
      const result = formatPrice(29.99);
      expect(result).toContain('29,99');
      expect(result).toContain('€');
    });

    it('should format price in different currencies', () => {
      const result = formatPrice(100, 'USD');
      expect(result).toContain('$');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text with ellipsis', () => {
      const text = 'This is a very long text that should be truncated';
      const result = truncateText(text, 20);
      expect(result).toBe('This is a very long ...');
      expect(result.length).toBe(23);
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      const result = truncateText(text, 20);
      expect(result).toBe('Short text');
    });
  });
});
