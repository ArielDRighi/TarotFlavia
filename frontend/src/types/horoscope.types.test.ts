/**
 * Tests for Horoscope Types
 */

import { describe, it, expect } from 'vitest';
import { ZodiacSign, type DailyHoroscope, type HoroscopeArea } from '@/types/horoscope.types';

describe('horoscope types', () => {
  describe('ZodiacSign enum', () => {
    it('should have all 12 zodiac signs', () => {
      const signs = Object.values(ZodiacSign);
      expect(signs).toHaveLength(12);
    });

    it('should have correct sign values', () => {
      expect(ZodiacSign.ARIES).toBe('aries');
      expect(ZodiacSign.TAURUS).toBe('taurus');
      expect(ZodiacSign.GEMINI).toBe('gemini');
      expect(ZodiacSign.CANCER).toBe('cancer');
      expect(ZodiacSign.LEO).toBe('leo');
      expect(ZodiacSign.VIRGO).toBe('virgo');
      expect(ZodiacSign.LIBRA).toBe('libra');
      expect(ZodiacSign.SCORPIO).toBe('scorpio');
      expect(ZodiacSign.SAGITTARIUS).toBe('sagittarius');
      expect(ZodiacSign.CAPRICORN).toBe('capricorn');
      expect(ZodiacSign.AQUARIUS).toBe('aquarius');
      expect(ZodiacSign.PISCES).toBe('pisces');
    });
  });

  describe('DailyHoroscope interface', () => {
    it('should accept valid horoscope object', () => {
      const horoscope: DailyHoroscope = {
        id: 1,
        zodiacSign: ZodiacSign.ARIES,
        horoscopeDate: '2026-01-17',
        generalContent: 'Hoy es un buen día...',
        areas: {
          love: { content: 'El amor está en el aire', score: 8 },
          wellness: { content: 'Energía positiva', score: 9 },
          money: { content: 'Oportunidades financieras', score: 7 },
        },
        luckyNumber: 7,
        luckyColor: 'Verde',
        luckyTime: 'Media mañana',
      };

      expect(horoscope.id).toBe(1);
      expect(horoscope.zodiacSign).toBe(ZodiacSign.ARIES);
      expect(horoscope.areas.love.score).toBe(8);
    });

    it('should accept null values for optional fields', () => {
      const horoscope: DailyHoroscope = {
        id: 2,
        zodiacSign: ZodiacSign.LEO,
        horoscopeDate: '2026-01-17',
        generalContent: 'Contenido general',
        areas: {
          love: { content: 'Amor', score: 5 },
          wellness: { content: 'Bienestar', score: 6 },
          money: { content: 'Dinero', score: 7 },
        },
        luckyNumber: null,
        luckyColor: null,
        luckyTime: null,
      };

      expect(horoscope.luckyNumber).toBeNull();
      expect(horoscope.luckyColor).toBeNull();
      expect(horoscope.luckyTime).toBeNull();
    });
  });

  describe('HoroscopeArea interface', () => {
    it('should accept valid area object', () => {
      const area: HoroscopeArea = {
        content: 'Descripción del área',
        score: 8,
      };

      expect(area.content).toBe('Descripción del área');
      expect(area.score).toBe(8);
    });
  });
});
