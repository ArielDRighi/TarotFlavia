import {
  getChineseZodiacAnimal,
  getChineseZodiacInfo,
  getChineseYearInfo,
  ChineseZodiacAnimal,
} from './chinese-zodiac.utils';

describe('chinese-zodiac.utils', () => {
  describe('getChineseZodiacAnimal', () => {
    describe('Basic animal calculation', () => {
      it('should return Dragon for someone born on 1988-03-15', () => {
        const date = new Date('1988-03-15');
        expect(getChineseZodiacAnimal(date)).toBe(ChineseZodiacAnimal.DRAGON);
      });

      it('should return Rabbit for someone born on 1988-01-15 (before CNY)', () => {
        // Chinese New Year 1988 was on 1988-02-17
        // So someone born on 1988-01-15 belongs to 1987 (Rabbit)
        const date = new Date('1988-01-15');
        expect(getChineseZodiacAnimal(date)).toBe(ChineseZodiacAnimal.RABBIT);
      });

      it('should return Dragon for someone born on 2000-02-05 (exact CNY)', () => {
        // Chinese New Year 2000 was on 2000-02-05
        const date = new Date('2000-02-05');
        expect(getChineseZodiacAnimal(date)).toBe(ChineseZodiacAnimal.DRAGON);
      });

      it('should return Rabbit for someone born on 2000-02-04 (day before CNY)', () => {
        // Day before CNY 2000
        const date = new Date('2000-02-04');
        expect(getChineseZodiacAnimal(date)).toBe(ChineseZodiacAnimal.RABBIT);
      });
    });

    describe('Complete 12-year cycle', () => {
      const testCases: Array<{
        year: number;
        month: number;
        day: number;
        animal: ChineseZodiacAnimal;
        name: string;
      }> = [
        {
          year: 2020,
          month: 3,
          day: 1,
          animal: ChineseZodiacAnimal.RAT,
          name: 'Rata',
        },
        {
          year: 2021,
          month: 3,
          day: 1,
          animal: ChineseZodiacAnimal.OX,
          name: 'Buey',
        },
        {
          year: 2022,
          month: 3,
          day: 1,
          animal: ChineseZodiacAnimal.TIGER,
          name: 'Tigre',
        },
        {
          year: 2023,
          month: 3,
          day: 1,
          animal: ChineseZodiacAnimal.RABBIT,
          name: 'Conejo',
        },
        {
          year: 2024,
          month: 3,
          day: 1,
          animal: ChineseZodiacAnimal.DRAGON,
          name: 'Dragón',
        },
        {
          year: 2025,
          month: 3,
          day: 1,
          animal: ChineseZodiacAnimal.SNAKE,
          name: 'Serpiente',
        },
        {
          year: 2026,
          month: 3,
          day: 1,
          animal: ChineseZodiacAnimal.HORSE,
          name: 'Caballo',
        },
        {
          year: 2027,
          month: 3,
          day: 1,
          animal: ChineseZodiacAnimal.GOAT,
          name: 'Cabra',
        },
        {
          year: 2028,
          month: 3,
          day: 1,
          animal: ChineseZodiacAnimal.MONKEY,
          name: 'Mono',
        },
        {
          year: 2029,
          month: 3,
          day: 1,
          animal: ChineseZodiacAnimal.ROOSTER,
          name: 'Gallo',
        },
        {
          year: 2030,
          month: 3,
          day: 1,
          animal: ChineseZodiacAnimal.DOG,
          name: 'Perro',
        },
        {
          year: 2031,
          month: 3,
          day: 1,
          animal: ChineseZodiacAnimal.PIG,
          name: 'Cerdo',
        },
      ];

      testCases.forEach(({ year, month, day, animal, name }) => {
        it(`should return ${name} for ${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`, () => {
          const date = new Date(
            `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
          );
          expect(getChineseZodiacAnimal(date)).toBe(animal);
        });
      });
    });

    describe('Historical dates', () => {
      it('should return Dragon for 1988 after CNY', () => {
        const date = new Date('1988-12-31');
        expect(getChineseZodiacAnimal(date)).toBe(ChineseZodiacAnimal.DRAGON);
      });

      it('should return Rat for 2008 after CNY', () => {
        const date = new Date('2008-03-15');
        expect(getChineseZodiacAnimal(date)).toBe(ChineseZodiacAnimal.RAT);
      });

      it('should return Pig for 1995 after CNY', () => {
        const date = new Date('1995-03-15');
        expect(getChineseZodiacAnimal(date)).toBe(ChineseZodiacAnimal.PIG);
      });
    });

    describe('Edge cases', () => {
      it('should accept Date object', () => {
        const date = new Date('1988-03-15');
        expect(getChineseZodiacAnimal(date)).toBe(ChineseZodiacAnimal.DRAGON);
      });

      it('should handle dates from 1950s', () => {
        const date = new Date('1950-03-15');
        const animal = getChineseZodiacAnimal(date);
        expect(animal).toBeDefined();
        expect(Object.values(ChineseZodiacAnimal)).toContain(animal);
      });

      it('should handle dates from 2040s', () => {
        const date = new Date('2045-03-15');
        const animal = getChineseZodiacAnimal(date);
        expect(animal).toBeDefined();
        expect(Object.values(ChineseZodiacAnimal)).toContain(animal);
      });
    });
  });

  describe('getChineseZodiacInfo', () => {
    it('should return complete info for Rat', () => {
      const info = getChineseZodiacInfo(ChineseZodiacAnimal.RAT);

      expect(info).toEqual({
        animal: ChineseZodiacAnimal.RAT,
        nameEs: 'Rata',
        nameEn: 'Rat',
        emoji: '🐀',
        element: 'water',
        yinYang: 'yang',
        compatibleWith: expect.any(Array),
        incompatibleWith: expect.any(Array),
        characteristics: expect.any(Array),
      });

      expect(info.characteristics.length).toBeGreaterThan(0);
      expect(info.compatibleWith.length).toBeGreaterThan(0);
      expect(info.incompatibleWith.length).toBeGreaterThan(0);
    });

    it('should return complete info for Dragon', () => {
      const info = getChineseZodiacInfo(ChineseZodiacAnimal.DRAGON);

      expect(info.animal).toBe(ChineseZodiacAnimal.DRAGON);
      expect(info.nameEs).toBe('Dragón');
      expect(info.nameEn).toBe('Dragon');
      expect(info.emoji).toBe('🐉');
      expect(['wood', 'fire', 'earth', 'metal', 'water']).toContain(
        info.element,
      );
      expect(['yin', 'yang']).toContain(info.yinYang);
    });

    it('should return info for all 12 animals', () => {
      const animals = Object.values(ChineseZodiacAnimal);

      expect(animals).toHaveLength(12);

      animals.forEach((animal) => {
        const info = getChineseZodiacInfo(animal);

        expect(info.animal).toBe(animal);
        expect(info.nameEs).toBeTruthy();
        expect(info.nameEn).toBeTruthy();
        expect(info.emoji).toBeTruthy();
        expect(['wood', 'fire', 'earth', 'metal', 'water']).toContain(
          info.element,
        );
        expect(['yin', 'yang']).toContain(info.yinYang);
        expect(Array.isArray(info.compatibleWith)).toBe(true);
        expect(Array.isArray(info.incompatibleWith)).toBe(true);
        expect(Array.isArray(info.characteristics)).toBe(true);
      });
    });

    it('should have correct compatibility relationships', () => {
      const ratInfo = getChineseZodiacInfo(ChineseZodiacAnimal.RAT);

      // Rat is traditionally compatible with Dragon, Monkey, Ox
      expect(ratInfo.compatibleWith).toContain(ChineseZodiacAnimal.DRAGON);
      expect(ratInfo.compatibleWith).toContain(ChineseZodiacAnimal.MONKEY);

      // Rat is traditionally incompatible with Horse
      expect(ratInfo.incompatibleWith).toContain(ChineseZodiacAnimal.HORSE);
    });

    it('should have valid emojis for all animals', () => {
      const expectedEmojis = [
        '🐀',
        '🐂',
        '🐅',
        '🐇',
        '🐉',
        '🐍',
        '🐴',
        '🐐',
        '🐒',
        '🐓',
        '🐕',
        '🐖',
      ];

      const animals = Object.values(ChineseZodiacAnimal);
      const actualEmojis = animals.map(
        (animal) => getChineseZodiacInfo(animal).emoji,
      );

      expectedEmojis.forEach((emoji) => {
        expect(actualEmojis).toContain(emoji);
      });
    });
  });

  describe('getChineseYearInfo', () => {
    it('should return year info for 2026', () => {
      const yearInfo = getChineseYearInfo(2026);

      expect(yearInfo).toEqual({
        animal: ChineseZodiacAnimal.HORSE,
        element: expect.any(String),
        newYearDate: expect.any(String),
      });

      expect(['wood', 'fire', 'earth', 'metal', 'water']).toContain(
        yearInfo.element,
      );
      expect(yearInfo.newYearDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return year info for 2024 (Dragon)', () => {
      const yearInfo = getChineseYearInfo(2024);

      expect(yearInfo.animal).toBe(ChineseZodiacAnimal.DRAGON);
      expect(yearInfo.newYearDate).toBe('2024-02-10');
    });

    it('should return year info for 2025 (Snake)', () => {
      const yearInfo = getChineseYearInfo(2025);

      expect(yearInfo.animal).toBe(ChineseZodiacAnimal.SNAKE);
      expect(yearInfo.newYearDate).toBe('2025-01-29');
    });

    it('should return current year info when no parameter provided', () => {
      const yearInfo = getChineseYearInfo();

      expect(yearInfo).toBeDefined();
      expect(yearInfo.animal).toBeDefined();
      expect(Object.values(ChineseZodiacAnimal)).toContain(yearInfo.animal);
    });

    it('should have valid element for the year', () => {
      const yearInfo = getChineseYearInfo(2027);

      expect(['wood', 'fire', 'earth', 'metal', 'water']).toContain(
        yearInfo.element,
      );
    });

    it('should cycle through 5 elements every 60 years', () => {
      // The Chinese zodiac has a 60-year cycle (12 animals × 5 elements)
      const yearInfo1 = getChineseYearInfo(2024);
      const yearInfo2 = getChineseYearInfo(2084); // 60 years later

      expect(yearInfo1.animal).toBe(yearInfo2.animal);
      expect(yearInfo1.element).toBe(yearInfo2.element);
    });
  });
});
