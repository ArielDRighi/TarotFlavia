import { parseBirthDate, formatBirthDate } from './date-utils';

describe('parseBirthDate', () => {
  describe('correct calendar day (timezone-safe)', () => {
    it('should return October 18 for 2011-10-18', () => {
      const date = parseBirthDate('2011-10-18');
      expect(date.getFullYear()).toBe(2011);
      expect(date.getMonth()).toBe(9); // 0-indexed
      expect(date.getDate()).toBe(18);
    });

    it('should return January 1 for 2000-01-01', () => {
      const date = parseBirthDate('2000-01-01');
      expect(date.getFullYear()).toBe(2000);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(1);
    });

    it('should return December 31 for 1999-12-31', () => {
      const date = parseBirthDate('1999-12-31');
      expect(date.getFullYear()).toBe(1999);
      expect(date.getMonth()).toBe(11);
      expect(date.getDate()).toBe(31);
    });

    it('should not shift the day regardless of server timezone', () => {
      // Uses local midnight: getDate() always returns the typed day
      const date = parseBirthDate('2011-10-18');
      expect(date.getDate()).toBe(18);
    });
  });

  describe('serialises back to the same YYYY-MM-DD string', () => {
    it.each(['2011-10-18', '1990-05-15', '1978-01-31', '2000-12-01'])(
      'parseBirthDate(%s) round-trips correctly',
      (input) => {
        const date = parseBirthDate(input);
        const [year, month, day] = input.split('-').map(Number);
        expect(date.getFullYear()).toBe(year);
        expect(date.getMonth()).toBe(month - 1);
        expect(date.getDate()).toBe(day);
      },
    );
  });

  describe('leap year support', () => {
    it('should parse February 29 on a leap year', () => {
      const date = parseBirthDate('2000-02-29');
      expect(date.getFullYear()).toBe(2000);
      expect(date.getMonth()).toBe(1);
      expect(date.getDate()).toBe(29);
    });

    it('should throw for February 29 on a non-leap year', () => {
      expect(() => parseBirthDate('2023-02-29')).toThrow('Invalid date');
    });
  });

  describe('month boundaries', () => {
    it('should parse the last day of January', () => {
      const date = parseBirthDate('2024-01-31');
      expect(date.getDate()).toBe(31);
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
  it('should format a local-midnight Date to YYYY-MM-DD without timezone shift', () => {
    // Simulates a date as returned by parseBirthDate or PostgreSQL date column (postgres-date)
    const date = parseBirthDate('1990-05-15');
    expect(formatBirthDate(date)).toBe('1990-05-15');
  });

  it('should format a Date created with new Date(year, month, day) correctly', () => {
    // Simulates local-midnight date — consistent with TypeORM storage approach
    const date = new Date(1990, 4, 15); // local midnight May 15
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
