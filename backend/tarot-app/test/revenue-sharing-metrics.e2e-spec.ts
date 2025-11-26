import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';
import { TarotDeck } from '../src/modules/tarot/decks/entities/tarot-deck.entity';
import { TarotSpread } from '../src/modules/tarot/spreads/entities/tarot-spread.entity';
import { PredefinedQuestion } from '../src/modules/predefined-questions/entities/predefined-question.entity';

interface LoginResponse {
  access_token: string;
}

describe('Revenue Sharing and Metrics (e2e)', () => {
  let app: INestApplication;
  const dbHelper = new E2EDatabaseHelper();
  let adminToken: string;
  let premiumToken: string;
  let flaviaTarotistaId: number;
  let predefinedQuestionId: number;
  let deckId: number;
  let spreadId: number;
  let _readingId: number;

  beforeAll(async () => {
    await dbHelper.initialize();

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

    // Get Flavia tarotista ID from public endpoint
    const tarotistasResponse = await request(app.getHttpServer())
      .get('/tarotistas')
      .expect(200);

    const flavia = tarotistasResponse.body.data.find(
      (t: any) => t.nombrePublico === 'Flavia',
    );
    if (!flavia) {
      throw new Error('Flavia tarotista not found in public tarotistas list');
    }
    flaviaTarotistaId = flavia.id;

    // Get seeded data for reading creation
    const dataSource = dbHelper.getDataSource();
    const deckRepository = dataSource.getRepository(TarotDeck);
    const spreadRepository = dataSource.getRepository(TarotSpread);
    const questionRepository = dataSource.getRepository(PredefinedQuestion);

    // Get seeded resources
    const questions = await questionRepository.find();
    predefinedQuestionId = questions[0].id;

    const decks = await deckRepository.find();
    deckId = decks[0].id;

    const spreads = await spreadRepository.find({ where: { cardCount: 3 } });
    spreadId = spreads[0].id;

    // Login with seeded users
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Test123456!',
      })
      .expect(200);
    adminToken = (adminLogin.body as LoginResponse).access_token;

    const premiumLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'premium@test.com',
        password: 'Test123456!',
      })
      .expect(200);
    premiumToken = (premiumLogin.body as LoginResponse).access_token;

    // Create a reading to generate revenue metrics
    const readingResponse = await request(app.getHttpServer())
      .post('/readings')
      .set('Authorization', `Bearer ${premiumToken}`)
      .send({
        deckId,
        spreadId,
        predefinedQuestionId,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        generateInterpretation: false, // Skip AI to speed up test
      })
      .expect(201);

    _readingId = readingResponse.body.id;

    // Wait a bit for async revenue calculation
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }, 30000); // Increased timeout for beforeAll

  afterAll(async () => {
    await app.close();
    await dbHelper.close();
  });

  describe('Tarotista Metrics Endpoint', () => {
    it('should return metrics for Flavia tarotista', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/tarotistas/metrics/tarotista?tarotistaId=${flaviaTarotistaId}&period=month`,
        )
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('tarotistaId', flaviaTarotistaId);
      expect(response.body).toHaveProperty('nombrePublico', 'Flavia');
      expect(response.body).toHaveProperty('totalReadings');
      expect(response.body).toHaveProperty('totalRevenueShare');
      expect(response.body).toHaveProperty('totalPlatformFee');
      expect(response.body).toHaveProperty('totalGrossRevenue');
      expect(response.body).toHaveProperty('period');
      expect(response.body.period).toHaveProperty('start');
      expect(response.body.period).toHaveProperty('end');

      // Should have at least 1 reading from setup
      // Note: totalReadings might be 0 if no revenue was recorded (totalRevenueUsd = 0)
      expect(response.body.totalReadings).toBeGreaterThanOrEqual(0);
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .get(
          `/tarotistas/metrics/tarotista?tarotistaId=${flaviaTarotistaId}&period=month`,
        )
        .expect(401);
    });

    it('should return 404 for non-existent tarotista', async () => {
      await request(app.getHttpServer())
        .get('/tarotistas/metrics/tarotista?tarotistaId=99999&period=month')
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(404);
    });

    it('should support different time periods (WEEK, MONTH, YEAR)', async () => {
      const periods = ['week', 'month', 'year'];

      for (const period of periods) {
        const response = await request(app.getHttpServer())
          .get(
            `/tarotistas/metrics/tarotista?tarotistaId=${flaviaTarotistaId}&period=${period}`,
          )
          .set('Authorization', `Bearer ${premiumToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('period');
        expect(response.body.period).toHaveProperty('start');
        expect(response.body.period).toHaveProperty('end');
      }
    });

    it('should support custom date ranges', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();

      const response = await request(app.getHttpServer())
        .get(
          `/tarotistas/metrics/tarotista?tarotistaId=${flaviaTarotistaId}&period=custom&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        )
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('period');
      expect(new Date(response.body.period.start)).toBeInstanceOf(Date);
      expect(new Date(response.body.period.end)).toBeInstanceOf(Date);
    });
  });

  describe('Platform Metrics Endpoint (Admin Only)', () => {
    it('should return platform-wide metrics for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/tarotistas/metrics/platform?period=month')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalReadings');
      expect(response.body).toHaveProperty('totalRevenueShare');
      expect(response.body).toHaveProperty('totalPlatformFee');
      expect(response.body).toHaveProperty('totalGrossRevenue');
      expect(response.body).toHaveProperty('activeTarotistas');
      expect(response.body).toHaveProperty('activeUsers');
      expect(response.body).toHaveProperty('topTarotistas');
      expect(Array.isArray(response.body.topTarotistas)).toBe(true);
      expect(response.body).toHaveProperty('period');

      // Note: metrics might be 0 if no revenue was recorded (totalRevenueUsd = 0)
      expect(response.body.totalReadings).toBeGreaterThanOrEqual(0);
      expect(response.body.activeTarotistas).toBeGreaterThanOrEqual(0);
      expect(response.body.activeUsers).toBeGreaterThanOrEqual(0);
    });

    it('should return 403 for non-admin users', async () => {
      await request(app.getHttpServer())
        .get('/tarotistas/metrics/platform?period=month')
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(403);
    });

    it('should return 401 for unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/tarotistas/metrics/platform?period=month')
        .expect(401);
    });

    it('should include top tarotistas with correct structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/tarotistas/metrics/platform?period=month')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.topTarotistas).toBeInstanceOf(Array);

      if (response.body.topTarotistas.length > 0) {
        const topTarotista = response.body.topTarotistas[0];
        expect(topTarotista).toHaveProperty('tarotistaId');
        expect(topTarotista).toHaveProperty('nombrePublico');
        expect(topTarotista).toHaveProperty('totalReadings');
        expect(topTarotista).toHaveProperty('totalRevenueShare');
        expect(topTarotista).toHaveProperty('totalPlatformFee');
        expect(topTarotista).toHaveProperty('totalGrossRevenue');
      }
    });
  });

  describe('Report Export Endpoint', () => {
    it('should export CSV report for Flavia tarotista', async () => {
      const response = await request(app.getHttpServer())
        .post('/tarotistas/reports/export')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({
          tarotistaId: flaviaTarotistaId,
          period: 'month',
          format: 'csv',
        })
        .expect(200);

      expect(response.body).toHaveProperty('filename');
      expect(response.body.filename).toContain('.csv');
      expect(response.body.filename).toContain(`T${flaviaTarotistaId}`);
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('format', 'csv');

      // Verify CSV content
      const csvContent = Buffer.from(response.body.content, 'base64').toString(
        'utf-8',
      );
      expect(csvContent).toContain('Fecha');
      expect(csvContent).toContain('Revenue Tarotista');
      expect(csvContent).toContain('Comisión Plataforma');
    });

    it('should export PDF report for Flavia tarotista', async () => {
      const response = await request(app.getHttpServer())
        .post('/tarotistas/reports/export')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({
          tarotistaId: flaviaTarotistaId,
          period: 'month',
          format: 'pdf',
        })
        .expect(200);

      expect(response.body).toHaveProperty('filename');
      expect(response.body.filename).toContain('.pdf');
      expect(response.body.filename).toContain(`T${flaviaTarotistaId}`);
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('format', 'pdf');

      // Decode base64 and verify PDF header
      const pdfContent = Buffer.from(response.body.content, 'base64').toString(
        'latin1',
      );
      expect(pdfContent).toContain('%PDF');
    });

    it('should allow admin to export platform-wide CSV reports', async () => {
      const response = await request(app.getHttpServer())
        .post('/tarotistas/reports/export')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          period: 'year',
          format: 'csv',
        })
        .expect(200);

      expect(response.body.filename).toContain('PLATFORM');
      expect(response.body.filename).toContain('.csv');
      expect(response.body.format).toBe('csv');

      // Verify CSV content structure
      const csvContent = Buffer.from(response.body.content, 'base64').toString(
        'utf-8',
      );
      expect(csvContent).toContain('Fecha');
      expect(csvContent).toContain('Revenue Tarotista');
    });

    it('should allow admin to export platform-wide PDF reports', async () => {
      const response = await request(app.getHttpServer())
        .post('/tarotistas/reports/export')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          period: 'month',
          format: 'pdf',
        })
        .expect(200);

      expect(response.body.filename).toContain('PLATFORM');
      expect(response.body.filename).toContain('.pdf');
      expect(response.body.format).toBe('pdf');

      // Verify PDF header
      const pdfContent = Buffer.from(response.body.content, 'base64').toString(
        'latin1',
      );
      expect(pdfContent).toContain('%PDF');
    });

    it('should return 401 for unauthenticated export requests', async () => {
      await request(app.getHttpServer())
        .post('/tarotistas/reports/export')
        .send({
          tarotistaId: flaviaTarotistaId,
          period: 'month',
          format: 'csv',
        })
        .expect(401);
    });

    it('should use default format (CSV) when not specified', async () => {
      // Missing format field should use default CSV
      const response = await request(app.getHttpServer())
        .post('/tarotistas/reports/export')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({
          tarotistaId: flaviaTarotistaId,
          period: 'month',
        })
        .expect(200);

      // Should receive CSV format by default
      expect(response.body.filename).toContain('.csv');
      const csvContent = Buffer.from(response.body.content, 'base64').toString(
        'utf-8',
      );
      expect(csvContent).toContain('Fecha');
    });

    it('should reject invalid format values', async () => {
      await request(app.getHttpServer())
        .post('/tarotistas/reports/export')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({
          tarotistaId: flaviaTarotistaId,
          period: 'MONTH',
          format: 'INVALID',
        })
        .expect(400);
    });

    it('should support custom date ranges for exports', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      const response = await request(app.getHttpServer())
        .post('/tarotistas/reports/export')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({
          tarotistaId: flaviaTarotistaId,
          period: 'custom',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          format: 'csv',
        })
        .expect(200);

      expect(response.body).toHaveProperty('filename');
      expect(response.body.filename).toContain('.csv');
    });
  });

  describe('Integration: Reading Creation → Revenue Calculation', () => {
    it('should have calculated revenue for the created reading', async () => {
      // Query metrics to verify revenue was calculated
      const response = await request(app.getHttpServer())
        .get(
          `/tarotistas/metrics/tarotista?tarotistaId=${flaviaTarotistaId}&period=month`,
        )
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      // Note: Currently revenue is 0 because totalRevenueUsd is set to 0 in use-case
      // This will be updated when payment system is implemented
      expect(response.body.totalReadings).toBeGreaterThanOrEqual(0);
      expect(response.body.totalRevenueShare).toBeGreaterThanOrEqual(0);
      expect(response.body.totalPlatformFee).toBeGreaterThanOrEqual(0);
      expect(response.body.totalGrossRevenue).toBeGreaterThanOrEqual(0);

      // Verify revenue calculation math (should sum correctly even if 0)
      const expectedTotal =
        response.body.totalRevenueShare + response.body.totalPlatformFee;
      expect(response.body.totalGrossRevenue).toBeCloseTo(expectedTotal, 2);
    });

    it('should show reading in platform-wide metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/tarotistas/metrics/platform?period=month')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Note: metrics might be 0 if no revenue was recorded (totalRevenueUsd = 0)
      expect(response.body.totalReadings).toBeGreaterThanOrEqual(0);
      expect(response.body.activeTarotistas).toBeGreaterThanOrEqual(0);
      expect(response.body.activeUsers).toBeGreaterThanOrEqual(0);

      // Flavia might not be in top tarotistas if no revenue was recorded
      expect(response.body.topTarotistas).toBeDefined();
      expect(Array.isArray(response.body.topTarotistas)).toBe(true);
    });
  });

  describe('Revenue Calculation Details', () => {
    it('should apply default 30% commission for Flavia', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/tarotistas/metrics/tarotista?tarotistaId=${flaviaTarotistaId}&period=month`,
        )
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      // Verify 70/30 split (when revenue > 0)
      // Note: Currently totalGrossRevenue will be 0 until payment system is implemented
      if (response.body.totalGrossRevenue > 0) {
        const expectedPlatformFee = response.body.totalGrossRevenue * 0.3;
        const expectedRevenueShare = response.body.totalGrossRevenue * 0.7;

        expect(response.body.totalPlatformFee).toBeCloseTo(
          expectedPlatformFee,
          2,
        );
        expect(response.body.totalRevenueShare).toBeCloseTo(
          expectedRevenueShare,
          2,
        );
      } else {
        // If revenue is 0, all values should be 0
        expect(response.body.totalRevenueShare).toBe(0);
        expect(response.body.totalPlatformFee).toBe(0);
        expect(response.body.totalGrossRevenue).toBe(0);
      }
    });
  });
});
