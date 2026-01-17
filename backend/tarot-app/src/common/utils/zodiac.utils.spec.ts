import { getZodiacSign, getZodiacSignInfo, ZodiacSign } from './zodiac.utils';

describe('zodiac.utils', () => {
  describe('getZodiacSign', () => {
    describe('Aries (21 marzo - 19 abril)', () => {
      it('should return Aries for March 25', () => {
        const date = new Date('1990-03-25');
        expect(getZodiacSign(date)).toBe(ZodiacSign.ARIES);
      });

      it('should return Aries for March 21 (start)', () => {
        const date = new Date('1990-03-21');
        expect(getZodiacSign(date)).toBe(ZodiacSign.ARIES);
      });

      it('should return Aries for April 19 (end)', () => {
        const date = new Date('1990-04-19');
        expect(getZodiacSign(date)).toBe(ZodiacSign.ARIES);
      });

      it('should accept ISO string format', () => {
        expect(getZodiacSign('1990-03-25')).toBe(ZodiacSign.ARIES);
      });
    });

    describe('Taurus (20 abril - 20 mayo)', () => {
      it('should return Taurus for April 20', () => {
        const date = new Date('1990-04-20');
        expect(getZodiacSign(date)).toBe(ZodiacSign.TAURUS);
      });

      it('should return Taurus for May 15', () => {
        const date = new Date('1990-05-15');
        expect(getZodiacSign(date)).toBe(ZodiacSign.TAURUS);
      });
    });

    describe('Capricorn (22 diciembre - 19 enero) - Year crossing', () => {
      it('should return Capricorn for January 1', () => {
        const date = new Date('2000-01-01');
        expect(getZodiacSign(date)).toBe(ZodiacSign.CAPRICORN);
      });

      it('should return Capricorn for January 19', () => {
        const date = new Date('2000-01-19');
        expect(getZodiacSign(date)).toBe(ZodiacSign.CAPRICORN);
      });

      it('should return Capricorn for December 31', () => {
        const date = new Date('1999-12-31');
        expect(getZodiacSign(date)).toBe(ZodiacSign.CAPRICORN);
      });

      it('should return Capricorn for December 22', () => {
        const date = new Date('1999-12-22');
        expect(getZodiacSign(date)).toBe(ZodiacSign.CAPRICORN);
      });
    });

    describe('All 12 zodiac signs', () => {
      const testCases: Array<{ date: string; sign: ZodiacSign; name: string }> =
        [
          { date: '1990-03-25', sign: ZodiacSign.ARIES, name: 'Aries' },
          { date: '1990-05-05', sign: ZodiacSign.TAURUS, name: 'Taurus' },
          { date: '1990-06-05', sign: ZodiacSign.GEMINI, name: 'Gemini' },
          { date: '1990-07-05', sign: ZodiacSign.CANCER, name: 'Cancer' },
          { date: '1990-08-05', sign: ZodiacSign.LEO, name: 'Leo' },
          { date: '1990-09-05', sign: ZodiacSign.VIRGO, name: 'Virgo' },
          { date: '1990-10-05', sign: ZodiacSign.LIBRA, name: 'Libra' },
          { date: '1990-11-05', sign: ZodiacSign.SCORPIO, name: 'Scorpio' },
          {
            date: '1990-12-05',
            sign: ZodiacSign.SAGITTARIUS,
            name: 'Sagittarius',
          },
          { date: '1990-01-05', sign: ZodiacSign.CAPRICORN, name: 'Capricorn' },
          { date: '1990-02-05', sign: ZodiacSign.AQUARIUS, name: 'Aquarius' },
          { date: '1990-03-05', sign: ZodiacSign.PISCES, name: 'Pisces' },
        ];

      testCases.forEach(({ date, sign, name }) => {
        it(`should return ${name} for ${date}`, () => {
          expect(getZodiacSign(new Date(date))).toBe(sign);
        });
      });
    });

    describe('Edge cases', () => {
      it('should handle Date object', () => {
        const date = new Date(1990, 2, 25); // March 25, 1990 (month is 0-indexed)
        expect(getZodiacSign(date)).toBe(ZodiacSign.ARIES);
      });

      it('should handle ISO string', () => {
        expect(getZodiacSign('1990-03-25')).toBe(ZodiacSign.ARIES);
      });

      it('should handle string with time', () => {
        expect(getZodiacSign('1990-03-25T14:30:00Z')).toBe(ZodiacSign.ARIES);
      });
    });
  });

  describe('getZodiacSignInfo', () => {
    it('should return complete info for Aries', () => {
      const info = getZodiacSignInfo(ZodiacSign.ARIES);

      expect(info).toEqual({
        sign: ZodiacSign.ARIES,
        nameEs: 'Aries',
        nameEn: 'Aries',
        symbol: '♈',
        element: 'fire',
        quality: 'cardinal',
        rulingPlanet: 'Marte',
      });
    });

    it('should return complete info for Taurus', () => {
      const info = getZodiacSignInfo(ZodiacSign.TAURUS);

      expect(info).toEqual({
        sign: ZodiacSign.TAURUS,
        nameEs: 'Tauro',
        nameEn: 'Taurus',
        symbol: '♉',
        element: 'earth',
        quality: 'fixed',
        rulingPlanet: 'Venus',
      });
    });

    it('should return complete info for all 12 signs', () => {
      const signs = Object.values(ZodiacSign);

      signs.forEach((sign) => {
        const info = getZodiacSignInfo(sign);

        expect(info.sign).toBe(sign);
        expect(info.nameEs).toBeTruthy();
        expect(info.nameEn).toBeTruthy();
        expect(info.symbol).toBeTruthy();
        expect(['fire', 'earth', 'air', 'water']).toContain(info.element);
        expect(['cardinal', 'fixed', 'mutable']).toContain(info.quality);
        expect(info.rulingPlanet).toBeTruthy();
      });
    });

    it('should have correct elements for all signs', () => {
      // Fire signs
      expect(getZodiacSignInfo(ZodiacSign.ARIES).element).toBe('fire');
      expect(getZodiacSignInfo(ZodiacSign.LEO).element).toBe('fire');
      expect(getZodiacSignInfo(ZodiacSign.SAGITTARIUS).element).toBe('fire');

      // Earth signs
      expect(getZodiacSignInfo(ZodiacSign.TAURUS).element).toBe('earth');
      expect(getZodiacSignInfo(ZodiacSign.VIRGO).element).toBe('earth');
      expect(getZodiacSignInfo(ZodiacSign.CAPRICORN).element).toBe('earth');

      // Air signs
      expect(getZodiacSignInfo(ZodiacSign.GEMINI).element).toBe('air');
      expect(getZodiacSignInfo(ZodiacSign.LIBRA).element).toBe('air');
      expect(getZodiacSignInfo(ZodiacSign.AQUARIUS).element).toBe('air');

      // Water signs
      expect(getZodiacSignInfo(ZodiacSign.CANCER).element).toBe('water');
      expect(getZodiacSignInfo(ZodiacSign.SCORPIO).element).toBe('water');
      expect(getZodiacSignInfo(ZodiacSign.PISCES).element).toBe('water');
    });
  });
});
