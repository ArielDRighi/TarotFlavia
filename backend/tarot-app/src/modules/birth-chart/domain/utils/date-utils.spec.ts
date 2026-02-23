import { parseBirthDate, formatBirthDate } from './date-utils';

describe('parseBirthDate', () => {
  describe('correct calendar day (timezone-safe)', () => {
    it('should return October 18 for 2011-10-18', () => {
      const date = parseBirthDate('2011-10-18');
      expect(date.getUTCFullYear()).toBe(2011);
      expect(date.getUTCMonth()).toBe(9); // 0-indexed
      expect(date.getUTCDate()).toBe(18);
    });

    it('should return January 1 for 2000-01-01', () => {
      const date = parseBirthDate('2000-01-01');
      expect(date.getUTCFullYear()).toBe(2000);
      expect(date.getUTCMonth()).toBe(0);
      expect(date.getUTCDate()).toBe(1);
    });

    it('should return December 31 for 1999-12-31', () => {
      const date = parseBirthDate('1999-12-31');
      expect(date.getUTCFullYear()).toBe(1999);
      expect(date.getUTCMonth()).toBe(11);
      expect(date.getUTCDate()).toBe(31);
    });

    it('should not shift the day regardless of server timezone', () => {
      // new Date('2011-10-18') is UTC midnight; getUTCDate() is always 18
      const date = parseBirthDate('2011-10-18');
      expect(date.getUTCDate()).toBe(18);
    });
  });

  describe('serialises back to the same YYYY-MM-DD string', () => {
    it.each(['2011-10-18', '1990-05-15', '1978-01-31', '2000-12-01'])(
      'parseBirthDate(%s) round-trips correctly',
      (input) => {
        const date = parseBirthDate(input);
        const [year, month, day] = input.split('-').map(Number);
        expect(date.getUTCFullYear()).toBe(year);
        expect(date.getUTCMonth()).toBe(month - 1);
        expect(date.getUTCDate()).toBe(day);
      },
    );
  });

  describe('leap year support', () => {
    it('should parse February 29 on a leap year', () => {
      const date = parseBirthDate('2000-02-29');
      expect(date.getUTCFullYear()).toBe(2000);
      expect(date.getUTCMonth()).toBe(1);
      expect(date.getUTCDate()).toBe(29);
    });

    it('should throw for February 29 on a non-leap year', () => {
      expect(() => parseBirthDate('2023-02-29')).toThrow('Invalid date');
    });
  });

  describe('month boundaries', () => {
    it('should parse the last day of January', () => {
      const date = parseBirthDate('2024-01-31');
      expect(date.getUTCDate()).toBe(31);
    });

    it('should throw for April 31 (invalid calendar date)', () => {
      expect(() => parseBirthDate('2024-04-31')).toThrow('Invalid date');
    });

    it('should throw for month 0', () => {
      expect(() => parseBirthDate('2024-00-15')).toThrow('Invalid date');
    });

    it('should throw for month 13', () => {
      expect(() => parseBirthDate('2024-13-01')).toThrow('Invalid date');
    });
  });

  describe('input validation', () => {
    it('should throw for wrong number of parts', () => {
      expect(() => parseBirthDate('2024-01')).toThrow('Invalid date format');
    });

    it('should throw for empty string', () => {
      expect(() => parseBirthDate('')).toThrow();
    });

    it('should throw for non-numeric parts', () => {
      expect(() => parseBirthDate('YYYY-MM-DD')).toThrow('Invalid date format');
    });
  });
});

describe('formatBirthDate', () => {
  it('should format a UTC-midnight Date to YYYY-MM-DD without timezone shift', () => {
    // Simulates a date as returned by parseBirthDate or PostgreSQL date column
    const date = parseBirthDate('1990-05-15');
    expect(formatBirthDate(date)).toBe('1990-05-15');
  });

  it('should format a Date created with new Date(UTC string) correctly', () => {
    // Simulates how PostgreSQL driver returns date values
    const date = new Date('1990-05-15T00:00:00Z');
    expect(formatBirthDate(date)).toBe('1990-05-15');
  });

  it('should format January 1 correctly (single-digit month and day padded)', () => {
    const date = parseBirthDate('2000-01-01');
    expect(formatBirthDate(date)).toBe('2000-01-01');
  });

  it('should format December 31 correctly', () => {
    const date = parseBirthDate('1999-12-31');
    expect(formatBirthDate(date)).toBe('1999-12-31');
  });

  it('should round-trip with parseBirthDate for multiple dates', () => {
    const dates = ['2011-10-18', '1978-01-31', '2000-02-29', '1985-11-20'];
    for (const input of dates) {
      expect(formatBirthDate(parseBirthDate(input))).toBe(input);
    }
  });
});

