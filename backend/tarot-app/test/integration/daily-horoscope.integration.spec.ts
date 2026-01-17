/**
 * Tests de integración para la entidad DailyHoroscope
 *
 * Estos tests verifican:
 * - Crear y guardar horóscopos en la base de datos
 * - Índice único (zodiacSign, horoscopeDate) funciona correctamente
 * - JSONB de áreas se guarda y recupera correctamente
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { DailyHoroscope } from '../../src/modules/horoscope/entities/daily-horoscope.entity';
import { ZodiacSign } from '../../src/modules/horoscope/entities/zodiac-sign.enum';

// Increase timeout for integration tests
jest.setTimeout(30000);

describe('DailyHoroscope Integration Tests', () => {
  let app: INestApplication;
  let repository: Repository<DailyHoroscope>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    repository = dataSource.getRepository(DailyHoroscope);
  });

  afterAll(async () => {
    // Limpiar la tabla al final
    if (repository) {
      try {
        await dataSource.query(
          'TRUNCATE TABLE daily_horoscopes RESTART IDENTITY CASCADE',
        );
      } catch (_error) {
        // Ignorar si la tabla no existe
      }
    }
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    // Limpiar la tabla antes de cada test
    try {
      await dataSource.query(
        'TRUNCATE TABLE daily_horoscopes RESTART IDENTITY CASCADE',
      );
    } catch (_error) {
      // Ignorar si la tabla no existe
    }
  });

  describe('Entity Creation and Persistence', () => {
    it('should create and save a daily horoscope', async () => {
      const horoscopeDate = new Date('2026-01-17');

      const horoscope = repository.create({
        zodiacSign: ZodiacSign.ARIES,
        horoscopeDate,
        generalContent: 'Hoy es un día propicio para nuevos comienzos',
        areas: {
          love: { content: 'Buenas vibraciones en el amor', score: 8 },
          wellness: { content: 'Energía alta', score: 9 },
          money: { content: 'Oportunidades financieras', score: 7 },
        },
        luckyNumber: 7,
        luckyColor: 'rojo',
        luckyTime: '14:00 - 16:00',
        aiProvider: 'groq',
        aiModel: 'llama-3.1-70b-versatile',
        tokensUsed: 1500,
        generationTimeMs: 2500,
      });

      const saved = await repository.save(horoscope);

      expect(saved.id).toBeDefined();
      expect(saved.zodiacSign).toBe(ZodiacSign.ARIES);
      expect(saved.generalContent).toBe(
        'Hoy es un día propicio para nuevos comienzos',
      );
      expect(saved.luckyNumber).toBe(7);
      expect(saved.createdAt).toBeDefined();
      expect(saved.updatedAt).toBeDefined();
    });

    it('should retrieve horoscope with JSONB areas intact', async () => {
      const horoscopeDate = new Date('2026-01-17');

      const horoscope = repository.create({
        zodiacSign: ZodiacSign.TAURUS,
        horoscopeDate,
        generalContent: 'Test content',
        areas: {
          love: { content: 'Amor content', score: 5 },
          wellness: { content: 'Wellness content', score: 6 },
          money: { content: 'Money content', score: 7 },
        },
      });

      const saved = await repository.save(horoscope);
      const retrieved = await repository.findOne({ where: { id: saved.id } });

      expect(retrieved).toBeDefined();
      expect(retrieved).not.toBeNull();
      expect(retrieved!.areas).toBeDefined();
      expect(retrieved!.areas.love.content).toBe('Amor content');
      expect(retrieved!.areas.love.score).toBe(5);
      expect(retrieved!.areas.wellness.content).toBe('Wellness content');
      expect(retrieved!.areas.wellness.score).toBe(6);
      expect(retrieved!.areas.money.content).toBe('Money content');
      expect(retrieved!.areas.money.score).toBe(7);
    });
  });

  describe('Unique Index (zodiacSign, horoscopeDate)', () => {
    it('should prevent duplicate horoscopes for same sign and date', async () => {
      const horoscopeDate = new Date('2026-01-17');

      // Crear primer horóscopo
      const horoscope1 = repository.create({
        zodiacSign: ZodiacSign.LEO,
        horoscopeDate,
        generalContent: 'First horoscope',
        areas: {
          love: { content: 'Test', score: 5 },
          wellness: { content: 'Test', score: 5 },
          money: { content: 'Test', score: 5 },
        },
      });

      await repository.save(horoscope1);

      // Intentar crear segundo horóscopo con mismo signo y fecha
      const horoscope2 = repository.create({
        zodiacSign: ZodiacSign.LEO,
        horoscopeDate,
        generalContent: 'Second horoscope (should fail)',
        areas: {
          love: { content: 'Test', score: 5 },
          wellness: { content: 'Test', score: 5 },
          money: { content: 'Test', score: 5 },
        },
      });

      // Debe lanzar un error de violación de constraint único
      await expect(repository.save(horoscope2)).rejects.toThrow();
    });

    it('should allow same sign on different dates', async () => {
      const date1 = new Date('2026-01-17');
      const date2 = new Date('2026-01-18');

      const horoscope1 = repository.create({
        zodiacSign: ZodiacSign.VIRGO,
        horoscopeDate: date1,
        generalContent: 'First day',
        areas: {
          love: { content: 'Test', score: 5 },
          wellness: { content: 'Test', score: 5 },
          money: { content: 'Test', score: 5 },
        },
      });

      const horoscope2 = repository.create({
        zodiacSign: ZodiacSign.VIRGO,
        horoscopeDate: date2,
        generalContent: 'Second day',
        areas: {
          love: { content: 'Test', score: 5 },
          wellness: { content: 'Test', score: 5 },
          money: { content: 'Test', score: 5 },
        },
      });

      await repository.save(horoscope1);
      await repository.save(horoscope2);

      const count = await repository.count({
        where: { zodiacSign: ZodiacSign.VIRGO },
      });
      expect(count).toBe(2);
    });

    it('should allow different signs on same date', async () => {
      const horoscopeDate = new Date('2026-01-17');

      const horoscope1 = repository.create({
        zodiacSign: ZodiacSign.LIBRA,
        horoscopeDate,
        generalContent: 'Libra',
        areas: {
          love: { content: 'Test', score: 5 },
          wellness: { content: 'Test', score: 5 },
          money: { content: 'Test', score: 5 },
        },
      });

      const horoscope2 = repository.create({
        zodiacSign: ZodiacSign.SCORPIO,
        horoscopeDate,
        generalContent: 'Scorpio',
        areas: {
          love: { content: 'Test', score: 5 },
          wellness: { content: 'Test', score: 5 },
          money: { content: 'Test', score: 5 },
        },
      });

      await repository.save(horoscope1);
      await repository.save(horoscope2);

      const count = await repository.count({
        where: { horoscopeDate },
      });
      expect(count).toBe(2);
    });
  });

  describe('Date Index Queries', () => {
    it('should efficiently query by horoscopeDate', async () => {
      const date = new Date('2026-01-17');

      // Crear horóscopos para varios signos en la misma fecha
      const signs = [ZodiacSign.ARIES, ZodiacSign.TAURUS, ZodiacSign.GEMINI];

      for (const sign of signs) {
        const horoscope = repository.create({
          zodiacSign: sign,
          horoscopeDate: date,
          generalContent: `Test for ${sign}`,
          areas: {
            love: { content: 'Test', score: 5 },
            wellness: { content: 'Test', score: 5 },
            money: { content: 'Test', score: 5 },
          },
        });
        await repository.save(horoscope);
      }

      const horoscopes = await repository.find({
        where: { horoscopeDate: date },
      });

      expect(horoscopes).toHaveLength(3);
      expect(horoscopes.map((h) => h.zodiacSign).sort()).toEqual([
        ZodiacSign.ARIES,
        ZodiacSign.GEMINI,
        ZodiacSign.TAURUS,
      ]);
    });
  });

  describe('View Count and Metadata', () => {
    it('should increment view count', async () => {
      const horoscopeDate = new Date('2026-01-17');

      const horoscope = repository.create({
        zodiacSign: ZodiacSign.CAPRICORN,
        horoscopeDate,
        generalContent: 'Test',
        areas: {
          love: { content: 'Test', score: 5 },
          wellness: { content: 'Test', score: 5 },
          money: { content: 'Test', score: 5 },
        },
        viewCount: 0,
      });

      const saved = await repository.save(horoscope);

      // Incrementar view count
      saved.viewCount++;
      await repository.save(saved);

      const retrieved = await repository.findOne({ where: { id: saved.id } });
      expect(retrieved).not.toBeNull();
      expect(retrieved!.viewCount).toBe(1);
    });

    it('should store AI metadata', async () => {
      const horoscopeDate = new Date('2026-01-17');

      const horoscope = repository.create({
        zodiacSign: ZodiacSign.AQUARIUS,
        horoscopeDate,
        generalContent: 'Test',
        areas: {
          love: { content: 'Test', score: 5 },
          wellness: { content: 'Test', score: 5 },
          money: { content: 'Test', score: 5 },
        },
        aiProvider: 'openai',
        aiModel: 'gpt-4',
        tokensUsed: 2000,
        generationTimeMs: 3000,
      });

      const saved = await repository.save(horoscope);
      const retrieved = await repository.findOne({ where: { id: saved.id } });

      expect(retrieved).not.toBeNull();
      expect(retrieved!.aiProvider).toBe('openai');
      expect(retrieved!.aiModel).toBe('gpt-4');
      expect(retrieved!.tokensUsed).toBe(2000);
      expect(retrieved!.generationTimeMs).toBe(3000);
    });
  });

  describe('Nullable Fields', () => {
    it('should allow null values for optional fields', async () => {
      const horoscopeDate = new Date('2026-01-17');

      const horoscope = repository.create({
        zodiacSign: ZodiacSign.PISCES,
        horoscopeDate,
        generalContent: 'Test',
        areas: {
          love: { content: 'Test', score: 5 },
          wellness: { content: 'Test', score: 5 },
          money: { content: 'Test', score: 5 },
        },
        luckyNumber: null,
        luckyColor: null,
        luckyTime: null,
        aiProvider: null,
        aiModel: null,
      });

      const saved = await repository.save(horoscope);
      const retrieved = await repository.findOne({ where: { id: saved.id } });

      expect(retrieved).not.toBeNull();
      expect(retrieved!.luckyNumber).toBeNull();
      expect(retrieved!.luckyColor).toBeNull();
      expect(retrieved!.luckyTime).toBeNull();
      expect(retrieved!.aiProvider).toBeNull();
      expect(retrieved!.aiModel).toBeNull();
    });
  });
});
