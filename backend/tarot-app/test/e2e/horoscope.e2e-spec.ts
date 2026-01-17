import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DailyHoroscope } from '../../src/modules/horoscope/entities/daily-horoscope.entity';
import { User } from '../../src/modules/users/entities/user.entity';
import { ZodiacSign } from '../../src/common/utils/zodiac.utils';
import {
  UserPlan,
  UserRole,
} from '../../src/modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('Horoscope Controller (e2e)', () => {
  let app: INestApplication;
  let horoscopeRepository: Repository<DailyHoroscope>;
  let userRepository: Repository<User>;
  let authToken: string;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    horoscopeRepository = moduleFixture.get<Repository<DailyHoroscope>>(
      getRepositoryToken(DailyHoroscope),
    );
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Limpiar datos de test
    await horoscopeRepository.query('DELETE FROM daily_horoscopes WHERE 1=1');
    await userRepository.delete({ email: 'horoscope-test@example.com' });
  });

  describe('GET /horoscope/today', () => {
    it('should return empty array when no horoscopes exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/horoscope/today')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should return all horoscopes for today', async () => {
      // Crear horóscopo de test con fecha normalizada a UTC
      const now = new Date();
      const today = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );

      const horoscope = horoscopeRepository.create({
        zodiacSign: ZodiacSign.ARIES,
        horoscopeDate: today,
        generalContent: 'Test horoscope content',
        areas: {
          love: { content: 'Love content', score: 8 },
          wellness: { content: 'Wellness content', score: 7 },
          money: { content: 'Money content', score: 6 },
        },
        luckyNumber: 7,
        luckyColor: 'Verde',
        luckyTime: 'Mañana',
        aiProvider: 'test',
        aiModel: 'test-model',
        tokensUsed: 100,
        generationTimeMs: 1000,
        viewCount: 0,
      });
      await horoscopeRepository.save(horoscope);

      const response = await request(app.getHttpServer())
        .get('/horoscope/today')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        zodiacSign: ZodiacSign.ARIES,
        generalContent: 'Test horoscope content',
        areas: {
          love: { content: 'Love content', score: 8 },
          wellness: { content: 'Wellness content', score: 7 },
          money: { content: 'Money content', score: 6 },
        },
        luckyNumber: 7,
        luckyColor: 'Verde',
        luckyTime: 'Mañana',
      });
    });
  });

  describe('GET /horoscope/today/:sign', () => {
    it('should return horoscope for a specific sign', async () => {
      const now = new Date();
      const today = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
      );
      const horoscope = horoscopeRepository.create({
        zodiacSign: ZodiacSign.ARIES,
        horoscopeDate: today,
        generalContent: 'Aries horoscope',
        areas: {
          love: { content: 'Love', score: 8 },
          wellness: { content: 'Wellness', score: 7 },
          money: { content: 'Money', score: 6 },
        },
        aiProvider: 'test',
        aiModel: 'test-model',
        tokensUsed: 100,
        generationTimeMs: 1000,
        viewCount: 0,
      });
      await horoscopeRepository.save(horoscope);

      const response = await request(app.getHttpServer())
        .get('/horoscope/today/aries')
        .expect(200);

      expect(response.body).toMatchObject({
        zodiacSign: ZodiacSign.ARIES,
        generalContent: 'Aries horoscope',
      });
    });

    it('should return 404 when horoscope not found', async () => {
      await request(app.getHttpServer())
        .get('/horoscope/today/aries')
        .expect(404);
    });

    it('should return 400 for invalid sign', async () => {
      await request(app.getHttpServer())
        .get('/horoscope/today/invalid-sign')
        .expect(400);
    });

    it('should increment view count', async () => {
      const now = new Date();
      const today = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
      );
      const horoscope = horoscopeRepository.create({
        zodiacSign: ZodiacSign.ARIES,
        horoscopeDate: today,
        generalContent: 'Test',
        areas: {
          love: { content: 'Love', score: 8 },
          wellness: { content: 'Wellness', score: 7 },
          money: { content: 'Money', score: 6 },
        },
        aiProvider: 'test',
        aiModel: 'test-model',
        tokensUsed: 100,
        generationTimeMs: 1000,
        viewCount: 0,
      });
      await horoscopeRepository.save(horoscope);

      await request(app.getHttpServer())
        .get('/horoscope/today/aries')
        .expect(200);

      // Esperar un poco para que se ejecute el increment
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updated = await horoscopeRepository.findOne({
        where: { id: horoscope.id },
      });
      expect(updated!.viewCount).toBeGreaterThan(0);
    });
  });

  describe('GET /horoscope/my-sign', () => {
    beforeEach(async () => {
      // Crear usuario con fecha de nacimiento
      const hashedPassword = await bcrypt.hash('password123', 10);
      testUser = userRepository.create({
        email: 'horoscope-test@example.com',
        password: hashedPassword,
        name: 'Test User',
        birthDate: '1990-03-25', // Aries
        plan: UserPlan.FREE,
        roles: [UserRole.CONSUMER],
      });
      await userRepository.save(testUser);

      // Crear horóscopo de Aries
      const now = new Date();
      const today = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
      );
      const horoscope = horoscopeRepository.create({
        zodiacSign: ZodiacSign.ARIES,
        horoscopeDate: today,
        generalContent: 'Aries horoscope',
        areas: {
          love: { content: 'Love', score: 8 },
          wellness: { content: 'Wellness', score: 7 },
          money: { content: 'Money', score: 6 },
        },
        aiProvider: 'test',
        aiModel: 'test-model',
        tokensUsed: 100,
        generationTimeMs: 1000,
        viewCount: 0,
      });
      await horoscopeRepository.save(horoscope);

      // Obtener token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'horoscope-test@example.com',
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).get('/horoscope/my-sign').expect(401);
    });

    it('should return horoscope for user zodiac sign', async () => {
      const response = await request(app.getHttpServer())
        .get('/horoscope/my-sign')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        zodiacSign: ZodiacSign.ARIES,
        generalContent: 'Aries horoscope',
      });
    });

    it('should return 400 when user has no birth date', async () => {
      // Actualizar usuario sin birthDate
      await userRepository.update(testUser.id, { birthDate: null });

      await request(app.getHttpServer())
        .get('/horoscope/my-sign')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 404 when horoscope not available', async () => {
      // Eliminar el horóscopo
      await horoscopeRepository.query('DELETE FROM daily_horoscopes WHERE 1=1');

      await request(app.getHttpServer())
        .get('/horoscope/my-sign')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /horoscope/:date', () => {
    it('should return horoscopes for a specific date', async () => {
      const testDate = new Date('2026-01-15T00:00:00.000Z'); // UTC
      const horoscope = horoscopeRepository.create({
        zodiacSign: ZodiacSign.TAURUS,
        horoscopeDate: testDate,
        generalContent: 'Test content',
        areas: {
          love: { content: 'Love', score: 8 },
          wellness: { content: 'Wellness', score: 7 },
          money: { content: 'Money', score: 6 },
        },
        aiProvider: 'test',
        aiModel: 'test-model',
        tokensUsed: 100,
        generationTimeMs: 1000,
        viewCount: 0,
      });
      await horoscopeRepository.save(horoscope);

      const response = await request(app.getHttpServer())
        .get('/horoscope/2026-01-15')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].zodiacSign).toBe(ZodiacSign.TAURUS);
    });

    it('should return 400 for invalid date format', async () => {
      await request(app.getHttpServer())
        .get('/horoscope/invalid-date')
        .expect(400);
    });

    it('should return empty array for date without horoscopes', async () => {
      const response = await request(app.getHttpServer())
        .get('/horoscope/2026-12-31')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /horoscope/:date/:sign', () => {
    it('should return specific horoscope by date and sign', async () => {
      const testDate = new Date('2026-01-15T00:00:00.000Z'); // UTC
      const horoscope = horoscopeRepository.create({
        zodiacSign: ZodiacSign.GEMINI,
        horoscopeDate: testDate,
        generalContent: 'Gemini content',
        areas: {
          love: { content: 'Love', score: 8 },
          wellness: { content: 'Wellness', score: 7 },
          money: { content: 'Money', score: 6 },
        },
        aiProvider: 'test',
        aiModel: 'test-model',
        tokensUsed: 100,
        generationTimeMs: 1000,
        viewCount: 0,
      });
      await horoscopeRepository.save(horoscope);

      const response = await request(app.getHttpServer())
        .get('/horoscope/2026-01-15/gemini')
        .expect(200);

      expect(response.body).toMatchObject({
        zodiacSign: ZodiacSign.GEMINI,
        generalContent: 'Gemini content',
      });
    });

    it('should return 404 when horoscope not found', async () => {
      await request(app.getHttpServer())
        .get('/horoscope/2026-01-15/leo')
        .expect(404);
    });

    it('should return 400 for invalid sign', async () => {
      await request(app.getHttpServer())
        .get('/horoscope/2026-01-15/invalid')
        .expect(400);
    });

    it('should return 400 for invalid date', async () => {
      await request(app.getHttpServer())
        .get('/horoscope/invalid/aries')
        .expect(400);
    });
  });
});
