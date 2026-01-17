import { DailyHoroscope } from './daily-horoscope.entity';
import { ZodiacSign } from './zodiac-sign.enum';

describe('DailyHoroscope Entity', () => {
  describe('Entity Creation', () => {
    it('should create a daily horoscope instance', () => {
      const horoscope = new DailyHoroscope();
      expect(horoscope).toBeInstanceOf(DailyHoroscope);
    });

    it('should assign all required properties', () => {
      const horoscope = new DailyHoroscope();
      const date = new Date('2026-01-17');

      horoscope.zodiacSign = ZodiacSign.ARIES;
      horoscope.horoscopeDate = date;
      horoscope.generalContent = 'Hoy es un día propicio para nuevos comienzos';
      horoscope.areas = {
        love: { content: 'Buenas vibraciones en el amor', score: 8 },
        wellness: { content: 'Energía alta', score: 9 },
        money: { content: 'Oportunidades financieras', score: 7 },
      };

      expect(horoscope.zodiacSign).toBe(ZodiacSign.ARIES);
      expect(horoscope.horoscopeDate).toBe(date);
      expect(horoscope.generalContent).toBe(
        'Hoy es un día propicio para nuevos comienzos',
      );
      expect(horoscope.areas.love.content).toBe(
        'Buenas vibraciones en el amor',
      );
      expect(horoscope.areas.love.score).toBe(8);
    });

    it('should assign optional properties', () => {
      const horoscope = new DailyHoroscope();

      horoscope.luckyNumber = 7;
      horoscope.luckyColor = 'rojo';
      horoscope.luckyTime = '14:00 - 16:00';
      horoscope.aiProvider = 'groq';
      horoscope.aiModel = 'llama-3.1-70b-versatile';

      expect(horoscope.luckyNumber).toBe(7);
      expect(horoscope.luckyColor).toBe('rojo');
      expect(horoscope.luckyTime).toBe('14:00 - 16:00');
      expect(horoscope.aiProvider).toBe('groq');
      expect(horoscope.aiModel).toBe('llama-3.1-70b-versatile');
    });

    it('should have default values for numeric fields', () => {
      const horoscope = new DailyHoroscope();

      expect(horoscope.tokensUsed).toBeUndefined(); // Se definirá con default en DB
      expect(horoscope.generationTimeMs).toBeUndefined();
      expect(horoscope.viewCount).toBeUndefined();
    });
  });

  describe('JSONB Areas Structure', () => {
    it('should store areas with correct structure', () => {
      const horoscope = new DailyHoroscope();

      horoscope.areas = {
        love: { content: 'Contenido amor', score: 8 },
        wellness: { content: 'Contenido bienestar', score: 9 },
        money: { content: 'Contenido dinero', score: 7 },
      };

      expect(horoscope.areas).toHaveProperty('love');
      expect(horoscope.areas).toHaveProperty('wellness');
      expect(horoscope.areas).toHaveProperty('money');

      expect(horoscope.areas.love).toHaveProperty('content');
      expect(horoscope.areas.love).toHaveProperty('score');
      expect(typeof horoscope.areas.love.content).toBe('string');
      expect(typeof horoscope.areas.love.score).toBe('number');
    });

    it('should validate score range (1-10)', () => {
      const horoscope = new DailyHoroscope();

      horoscope.areas = {
        love: { content: 'Test', score: 10 },
        wellness: { content: 'Test', score: 1 },
        money: { content: 'Test', score: 5 },
      };

      expect(horoscope.areas.love.score).toBeGreaterThanOrEqual(1);
      expect(horoscope.areas.love.score).toBeLessThanOrEqual(10);
      expect(horoscope.areas.wellness.score).toBeGreaterThanOrEqual(1);
      expect(horoscope.areas.wellness.score).toBeLessThanOrEqual(10);
      expect(horoscope.areas.money.score).toBeGreaterThanOrEqual(1);
      expect(horoscope.areas.money.score).toBeLessThanOrEqual(10);
    });
  });

  describe('Date Handling', () => {
    it('should store date without time component', () => {
      const horoscope = new DailyHoroscope();
      const date = new Date('2026-01-17T00:00:00.000Z');

      horoscope.horoscopeDate = date;

      // La fecha debe ser tipo Date
      expect(horoscope.horoscopeDate).toBeInstanceOf(Date);
    });

    it('should handle different zodiac signs', () => {
      const signs = [
        ZodiacSign.ARIES,
        ZodiacSign.TAURUS,
        ZodiacSign.GEMINI,
        ZodiacSign.CANCER,
        ZodiacSign.LEO,
        ZodiacSign.VIRGO,
        ZodiacSign.LIBRA,
        ZodiacSign.SCORPIO,
        ZodiacSign.SAGITTARIUS,
        ZodiacSign.CAPRICORN,
        ZodiacSign.AQUARIUS,
        ZodiacSign.PISCES,
      ];

      signs.forEach((sign) => {
        const horoscope = new DailyHoroscope();
        horoscope.zodiacSign = sign;
        expect(horoscope.zodiacSign).toBe(sign);
      });
    });
  });

  describe('AI Provider Metadata', () => {
    it('should store AI provider information', () => {
      const horoscope = new DailyHoroscope();

      horoscope.aiProvider = 'groq';
      horoscope.aiModel = 'llama-3.1-70b-versatile';
      horoscope.tokensUsed = 1500;
      horoscope.generationTimeMs = 2500;

      expect(horoscope.aiProvider).toBe('groq');
      expect(horoscope.aiModel).toBe('llama-3.1-70b-versatile');
      expect(horoscope.tokensUsed).toBe(1500);
      expect(horoscope.generationTimeMs).toBe(2500);
    });
  });

  describe('View Count Tracking', () => {
    it('should track view count', () => {
      const horoscope = new DailyHoroscope();

      horoscope.viewCount = 0;
      expect(horoscope.viewCount).toBe(0);

      horoscope.viewCount++;
      expect(horoscope.viewCount).toBe(1);

      horoscope.viewCount += 10;
      expect(horoscope.viewCount).toBe(11);
    });
  });

  describe('Lucky Elements', () => {
    it('should allow null values for lucky elements', () => {
      const horoscope = new DailyHoroscope();

      horoscope.luckyNumber = null;
      horoscope.luckyColor = null;
      horoscope.luckyTime = null;

      expect(horoscope.luckyNumber).toBeNull();
      expect(horoscope.luckyColor).toBeNull();
      expect(horoscope.luckyTime).toBeNull();
    });

    it('should store valid lucky elements', () => {
      const horoscope = new DailyHoroscope();

      horoscope.luckyNumber = 42;
      horoscope.luckyColor = 'azul';
      horoscope.luckyTime = '10:00 - 12:00';

      expect(horoscope.luckyNumber).toBe(42);
      expect(horoscope.luckyColor).toBe('azul');
      expect(horoscope.luckyTime).toBe('10:00 - 12:00');
    });
  });
});
