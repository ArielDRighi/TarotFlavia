import {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { BirthChartHistoryController } from '../../src/modules/birth-chart/infrastructure/controllers/birth-chart-history.controller';
import { JwtAuthGuard } from '../../src/modules/auth/infrastructure/guards/jwt-auth.guard';
import { PremiumGuard } from '../../src/modules/auth/infrastructure/guards/premium.guard';
import { UserPlan } from '../../src/modules/users/entities/user.entity';

jest.setTimeout(30000);

class TestJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: {
        userId: number;
        email: string;
        plan: UserPlan;
      };
    }>();

    const planHeader = req.headers['x-user-plan'];
    const idHeader = req.headers['x-user-id'];

    const plan =
      typeof planHeader === 'string'
        ? (planHeader as UserPlan)
        : UserPlan.PREMIUM;

    const userId =
      typeof idHeader === 'string' && !Number.isNaN(Number(idHeader))
        ? Number(idHeader)
        : 10;

    req.user = {
      userId,
      email: `integration-${plan}@test.com`,
      plan,
    };

    return true;
  }
}

describe('BirthChartHistoryController Integration', () => {
  let app: INestApplication;

  const mockHistoryService = {
    getUserCharts: jest.fn(),
    getChartById: jest.fn(),
    checkDuplicate: jest.fn(),
    saveChart: jest.fn(),
    renameChart: jest.fn(),
    deleteChart: jest.fn(),
    findDuplicate: jest.fn(),
    generatePdfFromSaved: jest.fn(),
  };

  const createBody = {
    name: 'María García',
    chartName: 'Mi carta natal',
    birthDate: '1990-05-15',
    birthTime: '14:30',
    birthPlace: 'Buenos Aires, Argentina',
    latitude: -34.6037,
    longitude: -58.3816,
    timezone: 'America/Argentina/Buenos_Aires',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BirthChartHistoryController],
      providers: [
        PremiumGuard,
        {
          provide: 'BirthChartHistoryService',
          useValue: mockHistoryService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(TestJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /birth-chart/history returns paginated history for premium', async () => {
    mockHistoryService.getUserCharts.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Carta 1',
          birthDate: '1990-05-15',
          sunSign: 'Leo',
          moonSign: 'Escorpio',
          ascendantSign: 'Virgo',
          createdAt: '2026-02-12T10:00:00.000Z',
        },
      ],
      meta: { page: 2, limit: 5, totalItems: 7, totalPages: 2 },
    });

    const response = await request(app.getHttpServer())
      .get('/birth-chart/history?page=2&limit=5')
      .set('x-user-plan', 'premium')
      .set('x-user-id', '99')
      .expect(200);

    expect(response.body.meta).toEqual({
      page: 2,
      limit: 5,
      totalItems: 7,
      totalPages: 2,
    });
    expect(mockHistoryService.getUserCharts).toHaveBeenCalledWith(99, 2, 5);
  });

  it('GET /birth-chart/history returns 403 for non-premium user', async () => {
    await request(app.getHttpServer())
      .get('/birth-chart/history')
      .set('x-user-plan', 'free')
      .expect(403);
  });

  it('GET /birth-chart/history/:id returns detail and 404 when not found', async () => {
    mockHistoryService.getChartById.mockResolvedValueOnce({
      success: true,
      chartSvgData: { planets: [], houses: [], aspects: [] },
      planets: [],
      houses: [],
      aspects: [],
      bigThree: {
        sun: { sign: 'leo', signName: 'Leo', interpretation: 'x' },
        moon: { sign: 'scorpio', signName: 'Escorpio', interpretation: 'x' },
        ascendant: { sign: 'virgo', signName: 'Virgo', interpretation: 'x' },
      },
      calculationTimeMs: 90,
      distribution: { elements: [], modalities: [] },
      interpretations: { planets: [] },
      canDownloadPdf: true,
      aiSynthesis: {
        content: 'Texto IA',
        generatedAt: '2026-02-12T12:00:00.000Z',
        provider: 'groq',
      },
      canAccessHistory: true,
    });

    await request(app.getHttpServer())
      .get('/birth-chart/history/1')
      .set('x-user-plan', 'premium')
      .expect(200);

    mockHistoryService.getChartById.mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .get('/birth-chart/history/999')
      .set('x-user-plan', 'premium')
      .expect(404);
  });

  it('POST /birth-chart/history handles success and duplicate conflict', async () => {
    mockHistoryService.checkDuplicate.mockResolvedValueOnce(false);
    mockHistoryService.saveChart.mockResolvedValueOnce({
      id: 2,
      name: 'Mi carta natal',
      birthDate: '1990-05-15',
      sunSign: 'Leo',
      moonSign: 'Escorpio',
      ascendantSign: 'Virgo',
      createdAt: '2026-02-12T10:00:00.000Z',
    });

    await request(app.getHttpServer())
      .post('/birth-chart/history')
      .set('x-user-plan', 'premium')
      .send(createBody)
      .expect(201);

    mockHistoryService.checkDuplicate.mockResolvedValueOnce(true);

    await request(app.getHttpServer())
      .post('/birth-chart/history')
      .set('x-user-plan', 'premium')
      .send(createBody)
      .expect(409);
  });

  it('POST /birth-chart/history/:id/name, DELETE /:id and POST /check-duplicate', async () => {
    mockHistoryService.renameChart.mockResolvedValueOnce(true);

    const renameResponse = await request(app.getHttpServer())
      .post('/birth-chart/history/5/name')
      .set('x-user-plan', 'premium')
      .send({ name: 'Carta de mamá' })
      .expect(200);

    expect(renameResponse.body).toEqual({ id: 5, name: 'Carta de mamá' });

    mockHistoryService.deleteChart.mockResolvedValueOnce(true);
    await request(app.getHttpServer())
      .delete('/birth-chart/history/5')
      .set('x-user-plan', 'premium')
      .expect(204);

    mockHistoryService.findDuplicate.mockResolvedValueOnce({
      id: 8,
      name: 'Carta base',
    });

    const duplicateResponse = await request(app.getHttpServer())
      .post('/birth-chart/history/check-duplicate')
      .set('x-user-plan', 'premium')
      .send(createBody)
      .expect(200);

    expect(duplicateResponse.body).toEqual({
      exists: true,
      existingChart: { id: 8, name: 'Carta base' },
    });
  });

  it('GET /birth-chart/history/:id/pdf returns file and handles not found', async () => {
    mockHistoryService.generatePdfFromSaved.mockResolvedValueOnce({
      buffer: Buffer.from('pdf-content'),
      filename: 'carta-astral-maria.pdf',
    });

    const response = await request(app.getHttpServer())
      .get('/birth-chart/history/11/pdf')
      .set('x-user-plan', 'premium')
      .expect(200);

    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.headers['content-disposition']).toContain(
      'attachment; filename="carta-astral-maria.pdf"',
    );

    mockHistoryService.generatePdfFromSaved.mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .get('/birth-chart/history/999/pdf')
      .set('x-user-plan', 'premium')
      .expect(404);
  });
});
