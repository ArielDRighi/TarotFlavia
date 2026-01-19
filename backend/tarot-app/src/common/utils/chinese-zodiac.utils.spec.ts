import {
  getChineseZodiacAnimal,
  getChineseZodiacInfo,
  getChineseYearInfo,
  ChineseZodiacAnimal,
  getElementForYear,
  getElementByBirthDate,
  getFullZodiacType,
  CHINESE_ELEMENTS_MAP_ES,
  type ChineseElement,
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

  describe('getElementForYear', () => {
    it('should return "earth" for 1988 (digit 8)', () => {
      expect(getElementForYear(1988)).toBe('earth');
    });

    it('should return "earth" for 1989 (digit 9)', () => {
      expect(getElementForYear(1989)).toBe('earth');
    });

    it('should return "wood" for 2024 (digit 4)', () => {
      expect(getElementForYear(2024)).toBe('wood');
    });

    it('should return "metal" for 2000 (digit 0)', () => {
      expect(getElementForYear(2000)).toBe('metal');
    });

    it('should return "fire" for 1987 (digit 7)', () => {
      expect(getElementForYear(1987)).toBe('fire');
    });

    it('should cycle through all 5 elements', () => {
      const elements: ChineseElement[] = [];
      for (let year = 1900; year < 1910; year++) {
        elements.push(getElementForYear(year));
      }
      expect(elements).toContain('metal');
      expect(elements).toContain('water');
      expect(elements).toContain('wood');
      expect(elements).toContain('fire');
      expect(elements).toContain('earth');
    });
  });

  describe('getElementByBirthDate', () => {
    it('should return "earth" for birth date 1988-03-15 (after CNY)', () => {
      const date = new Date('1988-03-15');
      expect(getElementByBirthDate(date)).toBe('earth');
    });

    it('should return "fire" for birth date 1988-01-15 (before CNY, year 1987)', () => {
      // Chinese New Year 1988 was on 1988-02-17
      // So 1988-01-15 belongs to Chinese year 1987
      // 1987 (digit 7) → fire
      const date = new Date('1988-01-15');
      expect(getElementByBirthDate(date)).toBe('fire');
    });

    it('should return "earth" for birth date 1989-03-15', () => {
      const date = new Date('1989-03-15');
      expect(getElementByBirthDate(date)).toBe('earth');
    });

    it('should return "wood" for birth date 2024-03-15', () => {
      const date = new Date('2024-03-15');
      expect(getElementByBirthDate(date)).toBe('wood');
    });

    it('should return "metal" for birth date 2000-03-15', () => {
      const date = new Date('2000-03-15');
      expect(getElementByBirthDate(date)).toBe('metal');
    });

    it('should handle years outside CNY dates range (before 1950)', () => {
      // 1940 → (1940 - 1900) % 10 = 40 % 10 = 0 → metal
      const date = new Date('1940-03-15');
      expect(getElementByBirthDate(date)).toBe('metal');
    });

    it('should handle years outside CNY dates range (after 2050)', () => {
      // 2060 → (2060 - 1900) % 10 = 160 % 10 = 0 → metal
      const date = new Date('2060-03-15');
      expect(getElementByBirthDate(date)).toBe('metal');
    });

    it('should handle very early dates (1900s)', () => {
      // 1905 → (1905 - 1900) % 10 = 5 % 10 = 5 → wood
      const date = new Date('1905-06-15');
      expect(getElementByBirthDate(date)).toBe('wood');
    });

    it('should handle far future dates (2100s)', () => {
      // 2100 → (2100 - 1900) % 10 = 200 % 10 = 0 → metal
      const date = new Date('2100-06-15');
      expect(getElementByBirthDate(date)).toBe('metal');
    });
  });

  describe('getFullZodiacType', () => {
    it('should return "Dragón de Tierra" for Dragon + Earth', () => {
      expect(getFullZodiacType(ChineseZodiacAnimal.DRAGON, 'earth')).toBe(
        'Dragón de Tierra',
      );
    });

    it('should return "Conejo de Fuego" for Rabbit + Fire', () => {
      expect(getFullZodiacType(ChineseZodiacAnimal.RABBIT, 'fire')).toBe(
        'Conejo de Fuego',
      );
    });

    it('should return "Rata de Agua" for Rat + Water', () => {
      expect(getFullZodiacType(ChineseZodiacAnimal.RAT, 'water')).toBe(
        'Rata de Agua',
      );
    });

    it('should return "Tigre de Madera" for Tiger + Wood', () => {
      expect(getFullZodiacType(ChineseZodiacAnimal.TIGER, 'wood')).toBe(
        'Tigre de Madera',
      );
    });

    it('should return "Mono de Metal" for Monkey + Metal', () => {
      expect(getFullZodiacType(ChineseZodiacAnimal.MONKEY, 'metal')).toBe(
        'Mono de Metal',
      );
    });

    it('should work with all 12 animals and 5 elements', () => {
      const animals = Object.values(ChineseZodiacAnimal);
      const elements: ChineseElement[] = [
        'metal',
        'water',
        'wood',
        'fire',
        'earth',
      ];

      animals.forEach((animal) => {
        elements.forEach((element) => {
          const result = getFullZodiacType(animal, element);
          expect(result).toContain(CHINESE_ELEMENTS_MAP_ES[element]);
          expect(result).toContain('de');
        });
      });
    });
  });
});
