/**
 * Tests for Zodiac Utilities
 */

import { describe, it, expect } from 'vitest';
import { getZodiacSignFromDate, getZodiacSignInfo, ZODIAC_SIGNS_INFO } from '@/lib/utils/zodiac';
import { ZodiacSign } from '@/types/horoscope.types';

describe('zodiac utilities', () => {
  describe('getZodiacSignFromDate', () => {
    // Test todos los signos zodiacales
    it('should return ARIES for March 21 - April 19', () => {
      expect(getZodiacSignFromDate(new Date('1990-03-21'))).toBe(ZodiacSign.ARIES);
      expect(getZodiacSignFromDate(new Date('1990-04-10'))).toBe(ZodiacSign.ARIES);
      expect(getZodiacSignFromDate(new Date('1990-04-19'))).toBe(ZodiacSign.ARIES);
    });

    it('should return TAURUS for April 20 - May 20', () => {
      expect(getZodiacSignFromDate(new Date('1990-04-20'))).toBe(ZodiacSign.TAURUS);
      expect(getZodiacSignFromDate(new Date('1990-05-10'))).toBe(ZodiacSign.TAURUS);
      expect(getZodiacSignFromDate(new Date('1990-05-20'))).toBe(ZodiacSign.TAURUS);
    });

    it('should return GEMINI for May 21 - June 20', () => {
      expect(getZodiacSignFromDate(new Date('1990-05-21'))).toBe(ZodiacSign.GEMINI);
      expect(getZodiacSignFromDate(new Date('1990-06-10'))).toBe(ZodiacSign.GEMINI);
      expect(getZodiacSignFromDate(new Date('1990-06-20'))).toBe(ZodiacSign.GEMINI);
    });

    it('should return CANCER for June 21 - July 22', () => {
      expect(getZodiacSignFromDate(new Date('1990-06-21'))).toBe(ZodiacSign.CANCER);
      expect(getZodiacSignFromDate(new Date('1990-07-10'))).toBe(ZodiacSign.CANCER);
      expect(getZodiacSignFromDate(new Date('1990-07-22'))).toBe(ZodiacSign.CANCER);
    });

    it('should return LEO for July 23 - August 22', () => {
      expect(getZodiacSignFromDate(new Date('1990-07-23'))).toBe(ZodiacSign.LEO);
      expect(getZodiacSignFromDate(new Date('1990-08-10'))).toBe(ZodiacSign.LEO);
      expect(getZodiacSignFromDate(new Date('1990-08-22'))).toBe(ZodiacSign.LEO);
    });

    it('should return VIRGO for August 23 - September 22', () => {
      expect(getZodiacSignFromDate(new Date('1990-08-23'))).toBe(ZodiacSign.VIRGO);
      expect(getZodiacSignFromDate(new Date('1990-09-10'))).toBe(ZodiacSign.VIRGO);
      expect(getZodiacSignFromDate(new Date('1990-09-22'))).toBe(ZodiacSign.VIRGO);
    });

    it('should return LIBRA for September 23 - October 22', () => {
      expect(getZodiacSignFromDate(new Date('1990-09-23'))).toBe(ZodiacSign.LIBRA);
      expect(getZodiacSignFromDate(new Date('1990-10-10'))).toBe(ZodiacSign.LIBRA);
      expect(getZodiacSignFromDate(new Date('1990-10-22'))).toBe(ZodiacSign.LIBRA);
    });

    it('should return SCORPIO for October 23 - November 21', () => {
      expect(getZodiacSignFromDate(new Date('1990-10-23'))).toBe(ZodiacSign.SCORPIO);
      expect(getZodiacSignFromDate(new Date('1990-11-10'))).toBe(ZodiacSign.SCORPIO);
      expect(getZodiacSignFromDate(new Date('1990-11-21'))).toBe(ZodiacSign.SCORPIO);
    });

    it('should return SAGITTARIUS for November 22 - December 21', () => {
      expect(getZodiacSignFromDate(new Date('1990-11-22'))).toBe(ZodiacSign.SAGITTARIUS);
      expect(getZodiacSignFromDate(new Date('1990-12-10'))).toBe(ZodiacSign.SAGITTARIUS);
      expect(getZodiacSignFromDate(new Date('1990-12-21'))).toBe(ZodiacSign.SAGITTARIUS);
    });

    // CASO ESPECIAL: Capricornio cruza el año (Dec 22 - Jan 19)
    it('should return CAPRICORN for December 22 - January 19 (crosses year boundary)', () => {
      // Diciembre
      expect(getZodiacSignFromDate(new Date('1990-12-22'))).toBe(ZodiacSign.CAPRICORN);
      expect(getZodiacSignFromDate(new Date('1990-12-25'))).toBe(ZodiacSign.CAPRICORN);
      expect(getZodiacSignFromDate(new Date('1990-12-31'))).toBe(ZodiacSign.CAPRICORN);
      
      // Enero
      expect(getZodiacSignFromDate(new Date('1991-01-01'))).toBe(ZodiacSign.CAPRICORN);
      expect(getZodiacSignFromDate(new Date('1991-01-10'))).toBe(ZodiacSign.CAPRICORN);
      expect(getZodiacSignFromDate(new Date('1991-01-19'))).toBe(ZodiacSign.CAPRICORN);
    });

    it('should return AQUARIUS for January 20 - February 18', () => {
      expect(getZodiacSignFromDate(new Date('1990-01-20'))).toBe(ZodiacSign.AQUARIUS);
      expect(getZodiacSignFromDate(new Date('1990-02-10'))).toBe(ZodiacSign.AQUARIUS);
      expect(getZodiacSignFromDate(new Date('1990-02-18'))).toBe(ZodiacSign.AQUARIUS);
    });

    it('should return PISCES for February 19 - March 20', () => {
      expect(getZodiacSignFromDate(new Date('1990-02-19'))).toBe(ZodiacSign.PISCES);
      expect(getZodiacSignFromDate(new Date('1990-03-10'))).toBe(ZodiacSign.PISCES);
      expect(getZodiacSignFromDate(new Date('1990-03-20'))).toBe(ZodiacSign.PISCES);
    });

    // Test límites de signos (boundary testing)
    it('should correctly handle sign boundaries', () => {
      // Límite Aries/Tauro
      expect(getZodiacSignFromDate(new Date('1990-04-19'))).toBe(ZodiacSign.ARIES);
      expect(getZodiacSignFromDate(new Date('1990-04-20'))).toBe(ZodiacSign.TAURUS);

      // Límite Sagitario/Capricornio
      expect(getZodiacSignFromDate(new Date('1990-12-21'))).toBe(ZodiacSign.SAGITTARIUS);
      expect(getZodiacSignFromDate(new Date('1990-12-22'))).toBe(ZodiacSign.CAPRICORN);

      // Límite Capricornio/Acuario (cruza año)
      expect(getZodiacSignFromDate(new Date('1990-01-19'))).toBe(ZodiacSign.CAPRICORN);
      expect(getZodiacSignFromDate(new Date('1990-01-20'))).toBe(ZodiacSign.AQUARIUS);
    });
  });

  describe('getZodiacSignInfo', () => {
    it('should return correct info for ARIES', () => {
      const info = getZodiacSignInfo(ZodiacSign.ARIES);
      expect(info.sign).toBe(ZodiacSign.ARIES);
      expect(info.nameEs).toBe('Aries');
      expect(info.nameEn).toBe('Aries');
      expect(info.symbol).toBe('♈');
      expect(info.element).toBe('fire');
    });

    it('should return correct info for TAURUS', () => {
      const info = getZodiacSignInfo(ZodiacSign.TAURUS);
      expect(info.sign).toBe(ZodiacSign.TAURUS);
      expect(info.nameEs).toBe('Tauro');
      expect(info.nameEn).toBe('Taurus');
      expect(info.symbol).toBe('♉');
      expect(info.element).toBe('earth');
    });

    it('should return correct info for CAPRICORN', () => {
      const info = getZodiacSignInfo(ZodiacSign.CAPRICORN);
      expect(info.sign).toBe(ZodiacSign.CAPRICORN);
      expect(info.nameEs).toBe('Capricornio');
      expect(info.nameEn).toBe('Capricorn');
      expect(info.symbol).toBe('♑');
      expect(info.element).toBe('earth');
    });

    it('should return info for all zodiac signs', () => {
      const allSigns = Object.values(ZodiacSign);
      expect(allSigns).toHaveLength(12);

      allSigns.forEach((sign) => {
        const info = getZodiacSignInfo(sign);
        expect(info).toBeDefined();
        expect(info.sign).toBe(sign);
        expect(info.nameEs).toBeTruthy();
        expect(info.nameEn).toBeTruthy();
        expect(info.symbol).toBeTruthy();
        expect(['fire', 'earth', 'air', 'water']).toContain(info.element);
      });
    });
  });

  describe('ZODIAC_SIGNS_INFO constant', () => {
    it('should have info for all 12 zodiac signs', () => {
      const signs = Object.keys(ZODIAC_SIGNS_INFO);
      expect(signs).toHaveLength(12);
    });

    it('should have correct elements distribution', () => {
      const elements = Object.values(ZODIAC_SIGNS_INFO).map((info) => info.element);
      
      // Contar elementos (cada elemento tiene 3 signos)
      const fireCount = elements.filter((el) => el === 'fire').length;
      const earthCount = elements.filter((el) => el === 'earth').length;
      const airCount = elements.filter((el) => el === 'air').length;
      const waterCount = elements.filter((el) => el === 'water').length;

      expect(fireCount).toBe(3); // Aries, Leo, Sagitario
      expect(earthCount).toBe(3); // Tauro, Virgo, Capricornio
      expect(airCount).toBe(3); // Géminis, Libra, Acuario
      expect(waterCount).toBe(3); // Cáncer, Escorpio, Piscis
    });
  });
});
