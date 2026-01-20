/**
 * Tests for Chinese Zodiac Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  getChineseZodiacInfo,
  getCurrentYear,
  getAllChineseZodiacAnimals,
  getAllChineseZodiacInfo,
  getElementIcon,
  getElementForYear,
  CHINESE_ZODIAC_INFO,
} from '@/lib/utils/chinese-zodiac';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

describe('chinese zodiac utilities', () => {
  describe('CHINESE_ZODIAC_INFO constant', () => {
    it('should have info for all 12 animals', () => {
      const animals = Object.keys(CHINESE_ZODIAC_INFO);
      expect(animals).toHaveLength(12);
    });

    it('should have correct structure for each animal', () => {
      Object.values(CHINESE_ZODIAC_INFO).forEach((info) => {
        expect(info.animal).toBeDefined();
        expect(info.nameEs).toBeTruthy();
        expect(info.nameEn).toBeTruthy();
        expect(info.emoji).toBeTruthy();
        expect(info.element).toBeTruthy();
        expect(Array.isArray(info.characteristics)).toBe(true);
        expect(info.characteristics.length).toBeGreaterThan(0);
      });
    });

    it('should have correct elements distribution', () => {
      const elements = Object.values(CHINESE_ZODIAC_INFO).map((info) => info.element);

      // Verificar que hay elementos variados
      const uniqueElements = new Set(elements);
      expect(uniqueElements.size).toBeGreaterThan(1);

      // Verificar elementos tradicionales chinos
      const validElements = ['Agua', 'Tierra', 'Madera', 'Fuego', 'Metal'];
      elements.forEach((element) => {
        expect(validElements).toContain(element);
      });
    });
  });

  describe('getChineseZodiacInfo', () => {
    it('should return correct info for RAT', () => {
      const info = getChineseZodiacInfo(ChineseZodiacAnimal.RAT);
      expect(info.animal).toBe(ChineseZodiacAnimal.RAT);
      expect(info.nameEs).toBe('Rata');
      expect(info.nameEn).toBe('Rat');
      expect(info.emoji).toBe('🐀');
      expect(info.element).toBe('Agua');
    });

    it('should return correct info for DRAGON', () => {
      const info = getChineseZodiacInfo(ChineseZodiacAnimal.DRAGON);
      expect(info.animal).toBe(ChineseZodiacAnimal.DRAGON);
      expect(info.nameEs).toBe('Dragón');
      expect(info.nameEn).toBe('Dragon');
      expect(info.emoji).toBe('🐉');
      expect(info.element).toBe('Tierra');
    });

    it('should return correct info for PIG', () => {
      const info = getChineseZodiacInfo(ChineseZodiacAnimal.PIG);
      expect(info.animal).toBe(ChineseZodiacAnimal.PIG);
      expect(info.nameEs).toBe('Cerdo');
      expect(info.nameEn).toBe('Pig');
      expect(info.emoji).toBe('🐖');
      expect(info.element).toBe('Agua');
    });

    it('should return info for all animals', () => {
      const allAnimals = Object.values(ChineseZodiacAnimal);
      expect(allAnimals).toHaveLength(12);

      allAnimals.forEach((animal) => {
        const info = getChineseZodiacInfo(animal);
        expect(info).toBeDefined();
        expect(info.animal).toBe(animal);
        expect(info.nameEs).toBeTruthy();
        expect(info.nameEn).toBeTruthy();
        expect(info.emoji).toBeTruthy();
        expect(info.element).toBeTruthy();
        expect(info.characteristics).toBeTruthy();
      });
    });
  });

  describe('getCurrentYear', () => {
    it('should return current year as number', () => {
      const year = getCurrentYear();
      expect(typeof year).toBe('number');
      expect(year).toBeGreaterThan(2020);
      expect(year).toBeLessThan(2100);
    });

    it('should match current JavaScript year', () => {
      const currentYear = new Date().getFullYear();
      const year = getCurrentYear();
      expect(year).toBe(currentYear);
    });
  });

  describe('getAllChineseZodiacAnimals', () => {
    it('should return array of 12 animals', () => {
      const animals = getAllChineseZodiacAnimals();
      expect(animals).toHaveLength(12);
    });

    it('should return all ChineseZodiacAnimal enum values', () => {
      const animals = getAllChineseZodiacAnimals();
      const enumValues = Object.values(ChineseZodiacAnimal);

      expect(animals).toEqual(enumValues);
    });

    it('should contain all expected animals', () => {
      const animals = getAllChineseZodiacAnimals();

      expect(animals).toContain(ChineseZodiacAnimal.RAT);
      expect(animals).toContain(ChineseZodiacAnimal.OX);
      expect(animals).toContain(ChineseZodiacAnimal.TIGER);
      expect(animals).toContain(ChineseZodiacAnimal.RABBIT);
      expect(animals).toContain(ChineseZodiacAnimal.DRAGON);
      expect(animals).toContain(ChineseZodiacAnimal.SNAKE);
      expect(animals).toContain(ChineseZodiacAnimal.HORSE);
      expect(animals).toContain(ChineseZodiacAnimal.GOAT);
      expect(animals).toContain(ChineseZodiacAnimal.MONKEY);
      expect(animals).toContain(ChineseZodiacAnimal.ROOSTER);
      expect(animals).toContain(ChineseZodiacAnimal.DOG);
      expect(animals).toContain(ChineseZodiacAnimal.PIG);
    });
  });

  describe('getAllChineseZodiacInfo', () => {
    it('should return array of 12 info objects', () => {
      const infos = getAllChineseZodiacInfo();
      expect(infos).toHaveLength(12);
    });

    it('should return complete info for each animal', () => {
      const infos = getAllChineseZodiacInfo();

      infos.forEach((info) => {
        expect(info.animal).toBeDefined();
        expect(info.nameEs).toBeTruthy();
        expect(info.nameEn).toBeTruthy();
        expect(info.emoji).toBeTruthy();
        expect(info.element).toBeTruthy();
        expect(Array.isArray(info.characteristics)).toBe(true);
      });
    });

    it('should match CHINESE_ZODIAC_INFO values', () => {
      const infos = getAllChineseZodiacInfo();
      const expectedInfos = Object.values(CHINESE_ZODIAC_INFO);

      expect(infos).toEqual(expectedInfos);
    });
  });

  describe('animal names and emojis', () => {
    it('should have unique Spanish names', () => {
      const namesEs = Object.values(CHINESE_ZODIAC_INFO).map((info) => info.nameEs);
      const uniqueNames = new Set(namesEs);
      expect(uniqueNames.size).toBe(12);
    });

    it('should have unique English names', () => {
      const namesEn = Object.values(CHINESE_ZODIAC_INFO).map((info) => info.nameEn);
      const uniqueNames = new Set(namesEn);
      expect(uniqueNames.size).toBe(12);
    });

    it('should have unique emojis', () => {
      const emojis = Object.values(CHINESE_ZODIAC_INFO).map((info) => info.emoji);
      const uniqueEmojis = new Set(emojis);
      expect(uniqueEmojis.size).toBe(12);
    });

    it('should have characteristics for all animals', () => {
      Object.values(CHINESE_ZODIAC_INFO).forEach((info) => {
        expect(info.characteristics.length).toBeGreaterThan(0);
        expect(info.characteristics.length).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('getElementIcon', () => {
    it('should return correct icon for metal', () => {
      expect(getElementIcon('metal')).toBe('⚪');
    });

    it('should return correct icon for water', () => {
      expect(getElementIcon('water')).toBe('🔵');
    });

    it('should return correct icon for wood', () => {
      expect(getElementIcon('wood')).toBe('🟢');
    });

    it('should return correct icon for fire', () => {
      expect(getElementIcon('fire')).toBe('🔴');
    });

    it('should return correct icon for earth', () => {
      expect(getElementIcon('earth')).toBe('🟤');
    });

    it('should be case insensitive', () => {
      expect(getElementIcon('METAL')).toBe('⚪');
      expect(getElementIcon('Water')).toBe('🔵');
      expect(getElementIcon('EARTH')).toBe('🟤');
    });

    it('should return fallback icon for unknown element', () => {
      expect(getElementIcon('unknown')).toBe('⭕');
      expect(getElementIcon('')).toBe('⭕');
    });
  });

  describe('getElementForYear', () => {
    it('should return correct element for JSDoc examples', () => {
      // Examples from JSDoc comments
      expect(getElementForYear(1988)).toBe('earth');
      expect(getElementForYear(2000)).toBe('metal');
      expect(getElementForYear(2026)).toBe('fire');
    });

    it('should return all five elements correctly in rotation', () => {
      // Test all 5 elements appear in a 10-year cycle
      expect(getElementForYear(1900)).toBe('metal'); // Metal Yang
      expect(getElementForYear(1901)).toBe('metal'); // Metal Yin
      expect(getElementForYear(1902)).toBe('water'); // Water Yang
      expect(getElementForYear(1903)).toBe('water'); // Water Yin
      expect(getElementForYear(1904)).toBe('wood'); // Wood Yang
      expect(getElementForYear(1905)).toBe('wood'); // Wood Yin
      expect(getElementForYear(1906)).toBe('fire'); // Fire Yang
      expect(getElementForYear(1907)).toBe('fire'); // Fire Yin
      expect(getElementForYear(1908)).toBe('earth'); // Earth Yang
      expect(getElementForYear(1909)).toBe('earth'); // Earth Yin
    });

    it('should repeat element cycle every 10 years', () => {
      // Test that the cycle repeats
      expect(getElementForYear(1910)).toBe('metal'); // Same as 1900
      expect(getElementForYear(1920)).toBe('metal'); // Same as 1900, 1910
      expect(getElementForYear(2000)).toBe('metal'); // Same as 1900, 1910, etc.
    });

    it('should handle recent years correctly', () => {
      expect(getElementForYear(2020)).toBe('metal');
      expect(getElementForYear(2021)).toBe('metal');
      expect(getElementForYear(2022)).toBe('water');
      expect(getElementForYear(2023)).toBe('water');
      expect(getElementForYear(2024)).toBe('wood');
      expect(getElementForYear(2025)).toBe('wood');
      expect(getElementForYear(2026)).toBe('fire');
      expect(getElementForYear(2027)).toBe('fire');
      expect(getElementForYear(2028)).toBe('earth');
      expect(getElementForYear(2029)).toBe('earth');
    });

    it('should handle years before 1900', () => {
      // Test years before the base year (1900)
      expect(getElementForYear(1890)).toBe('metal'); // 1900 - 10
      expect(getElementForYear(1898)).toBe('earth'); // Should calculate correctly
      expect(getElementForYear(1800)).toBe('metal'); // Much earlier year
    });

    it('should handle edge case years', () => {
      // Test boundary conditions
      expect(getElementForYear(1900)).toBe('metal'); // Base year
      expect(getElementForYear(1899)).toBe('earth'); // Year before base
      expect(getElementForYear(2100)).toBe('metal'); // Future year
    });

    it('should return only valid element codes', () => {
      const validElements = ['metal', 'water', 'wood', 'fire', 'earth'];

      // Test a range of years
      for (let year = 1900; year <= 2030; year++) {
        const element = getElementForYear(year);
        expect(validElements).toContain(element);
      }
    });

    it('should maintain yin-yang pairing in element rotation', () => {
      // Each element appears twice consecutively (Yang then Yin)
      for (let baseYear = 1900; baseYear <= 2020; baseYear += 10) {
        expect(getElementForYear(baseYear)).toBe(getElementForYear(baseYear + 1)); // metal/metal
        expect(getElementForYear(baseYear + 2)).toBe(getElementForYear(baseYear + 3)); // water/water
        expect(getElementForYear(baseYear + 4)).toBe(getElementForYear(baseYear + 5)); // wood/wood
        expect(getElementForYear(baseYear + 6)).toBe(getElementForYear(baseYear + 7)); // fire/fire
        expect(getElementForYear(baseYear + 8)).toBe(getElementForYear(baseYear + 9)); // earth/earth
      }
    });
  });
});
