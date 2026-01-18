/**
 * Tests for Chinese Zodiac Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  getChineseZodiacInfo,
  getCurrentChineseYear,
  getAllChineseZodiacAnimals,
  getAllChineseZodiacInfo,
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

  describe('getCurrentChineseYear', () => {
    it('should return current year as number', () => {
      const year = getCurrentChineseYear();
      expect(typeof year).toBe('number');
      expect(year).toBeGreaterThan(2020);
      expect(year).toBeLessThan(2100);
    });

    it('should match current JavaScript year', () => {
      const currentYear = new Date().getFullYear();
      const chineseYear = getCurrentChineseYear();
      expect(chineseYear).toBe(currentYear);
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
});
