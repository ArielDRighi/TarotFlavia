import {
  getTodayUTCDateString,
  formatDateToUTCString,
  getStartOfTodayUTC,
  getStartOfTomorrowUTC,
  getDateDaysAgoUTCString,
  getTodayAppDateString,
  getStartOfTodayApp,
  getNextAppMidnight,
  getDateDaysAgoAppString,
} from './date.utils';

describe('Date Utils', () => {
  describe('formatDateToUTCString', () => {
    it('should format date to YYYY-MM-DD using UTC', () => {
      const date = new Date('2025-01-15T12:30:00Z');
      expect(formatDateToUTCString(date)).toBe('2025-01-15');
    });

    it('should pad single digit months and days', () => {
      const date = new Date('2025-03-05T00:00:00Z');
      expect(formatDateToUTCString(date)).toBe('2025-03-05');
    });

    it('should handle end of year dates', () => {
      const date = new Date('2025-12-31T23:59:59Z');
      expect(formatDateToUTCString(date)).toBe('2025-12-31');
    });

    it('should handle beginning of year dates', () => {
      const date = new Date('2025-01-01T00:00:00Z');
      expect(formatDateToUTCString(date)).toBe('2025-01-01');
    });

    it('should use UTC regardless of local timezone', () => {
      // Date at 23:00 UTC on Jan 15 would be Jan 16 in some timezones
      const date = new Date('2025-01-15T23:00:00Z');
      expect(formatDateToUTCString(date)).toBe('2025-01-15');
    });
  });

  describe('getTodayUTCDateString', () => {
    it('should return today date in YYYY-MM-DD format', () => {
      const result = getTodayUTCDateString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should match current UTC date', () => {
      const now = new Date();
      const expected = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
      expect(getTodayUTCDateString()).toBe(expected);
    });
  });

  describe('getStartOfTodayUTC', () => {
    it('should return a Date object', () => {
      const result = getStartOfTodayUTC();
      expect(result).toBeInstanceOf(Date);
    });

    it('should have time set to 00:00:00.000 UTC', () => {
      const result = getStartOfTodayUTC();
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
      expect(result.getUTCMilliseconds()).toBe(0);
    });

    it('should have the current UTC date', () => {
      const result = getStartOfTodayUTC();
      const now = new Date();
      expect(result.getUTCFullYear()).toBe(now.getUTCFullYear());
      expect(result.getUTCMonth()).toBe(now.getUTCMonth());
      expect(result.getUTCDate()).toBe(now.getUTCDate());
    });
  });

  describe('getStartOfTomorrowUTC', () => {
    it('should return a Date object', () => {
      const result = getStartOfTomorrowUTC();
      expect(result).toBeInstanceOf(Date);
    });

    it('should have time set to 00:00:00.000 UTC', () => {
      const result = getStartOfTomorrowUTC();
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
      expect(result.getUTCMilliseconds()).toBe(0);
    });

    it('should be exactly one day after start of today', () => {
      const today = getStartOfTodayUTC();
      const tomorrow = getStartOfTomorrowUTC();
      const diffMs = tomorrow.getTime() - today.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      expect(diffMs).toBe(oneDayMs);
    });
  });

  describe('getDateDaysAgoUTCString', () => {
    it('should return date 7 days ago', () => {
      const result = getDateDaysAgoUTCString(7);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
      const expected = formatDateToUTCString(sevenDaysAgo);
      expect(result).toBe(expected);
    });

    it('should return today for 0 days ago', () => {
      const result = getDateDaysAgoUTCString(0);
      expect(result).toBe(getTodayUTCDateString());
    });

    it('should handle month boundaries', () => {
      // This test verifies the function works across month boundaries
      const result = getDateDaysAgoUTCString(35);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle year boundaries', () => {
      // This test verifies the function works across year boundaries
      const result = getDateDaysAgoUTCString(400);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  // ==========================================================================
  // App business day (Argentina, UTC-3) — daily limit boundary
  // ==========================================================================
  describe('getTodayAppDateString', () => {
    it('returns the Argentina calendar day, which differs from UTC late at night', () => {
      // 2026-07-25 01:00 UTC = 2026-07-24 22:00 in Argentina (UTC-3)
      expect(getTodayAppDateString(new Date('2026-07-25T01:00:00Z'))).toBe(
        '2026-07-24',
      );
      // 2026-07-25 05:00 UTC = 2026-07-25 02:00 in Argentina
      expect(getTodayAppDateString(new Date('2026-07-25T05:00:00Z'))).toBe(
        '2026-07-25',
      );
    });

    it('crosses the app day exactly at 03:00 UTC (00:00 Argentina)', () => {
      expect(getTodayAppDateString(new Date('2026-07-25T02:59:59Z'))).toBe(
        '2026-07-24',
      );
      expect(getTodayAppDateString(new Date('2026-07-25T03:00:00Z'))).toBe(
        '2026-07-25',
      );
    });
  });

  describe('getStartOfTodayApp', () => {
    it('returns the UTC instant of the current Argentina midnight (03:00 UTC)', () => {
      // AR 02:00 on the 25th → start of AR day 25 = 2026-07-25T03:00:00Z
      expect(
        getStartOfTodayApp(new Date('2026-07-25T05:00:00Z')).toISOString(),
      ).toBe('2026-07-25T03:00:00.000Z');
      // AR 23:00 on the 24th → start of AR day 24 = 2026-07-24T03:00:00Z
      expect(
        getStartOfTodayApp(new Date('2026-07-25T02:00:00Z')).toISOString(),
      ).toBe('2026-07-24T03:00:00.000Z');
    });
  });

  describe('getNextAppMidnight', () => {
    it('returns the next Argentina midnight as a UTC instant', () => {
      expect(
        getNextAppMidnight(new Date('2026-07-25T05:00:00Z')).toISOString(),
      ).toBe('2026-07-26T03:00:00.000Z');
    });
  });

  describe('getDateDaysAgoAppString', () => {
    it('returns the Argentina date N days ago', () => {
      expect(getDateDaysAgoAppString(7, new Date('2026-07-25T05:00:00Z'))).toBe(
        '2026-07-18',
      );
    });
  });
});
