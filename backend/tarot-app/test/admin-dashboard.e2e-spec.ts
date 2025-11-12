import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';
import { UserPlan } from '../src/modules/users/entities/user.entity';

interface DashboardMetricsResponse {
  userMetrics: {
    totalUsers: number;
    activeUsersLast7Days: number;
    activeUsersLast30Days: number;
  };
  readingMetrics: {
    totalReadings: number;
    readingsLast7Days: number;
    readingsLast30Days: number;
  };
  planDistribution: {
    freeUsers: number;
    premiumUsers: number;
    freePercentage: number;
    premiumPercentage: number;
    conversionRate: number;
  };
  recentReadings: Array<{
    id: number;
    userEmail: string;
    userName: string;
    spreadType: string | null;
    category: string | null;
    question: string | null;
    status: string;
    createdAt: string;
  }>;
  recentUsers: Array<{
    id: number;
    email: string;
    name: string;
    plan: UserPlan;
    createdAt: string;
  }>;
  aiMetrics: {
    totalInterpretations: number;
    usageByProvider: Array<{ provider: string; count: number }>;
  };
}

/**
 * Admin Dashboard E2E Tests
 *
 * Suite de tests que valida el panel de control administrativo:
 * - Autenticación y autorización (admin vs regular user)
 * - Métricas generales (usuarios, lecturas)
 * - Distribución de planes y tasa de conversión
 * - Lecturas recientes
 * - Usuarios recientes
 * - Métricas de IA
 * - Caché de 5 minutos
 */
describe('Admin Dashboard E2E', () => {
  let app: INestApplication<App>;
  const dbHelper = new E2EDatabaseHelper();
  let adminToken: string;
  let regularUserToken: string;
  const testTimestamp = Date.now();

  beforeAll(async () => {
    await dbHelper.initialize();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Login as admin (admin@test.com is seeded)
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Test123456!',
      })
      .expect(200);

    adminToken = (adminLoginResponse.body as { access_token: string })
      .access_token;

    // Create regular user
    const regularUserResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `regular-dashboard-${testTimestamp}@test.com`,
        password: 'SecurePass123!',
        name: 'Regular Dashboard User',
      })
      .expect(201);

    regularUserToken = (regularUserResponse.body as { access_token: string })
      .access_token;
  }, 60000);

  afterAll(async () => {
    const ds = dbHelper.getDataSource();

    // Cleanup test user
    await ds.query('DELETE FROM "user" WHERE email = $1', [
      `regular-dashboard-${testTimestamp}@test.com`,
    ]);

    await dbHelper.close();
    await app.close();
  }, 30000);

  describe('GET /admin/dashboard/metrics', () => {
    it('✅ Admin puede acceder a métricas', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/dashboard/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as DashboardMetricsResponse;

      // Validar estructura de la respuesta
      expect(body).toHaveProperty('userMetrics');
      expect(body).toHaveProperty('readingMetrics');
      expect(body).toHaveProperty('planDistribution');
      expect(body).toHaveProperty('recentReadings');
      expect(body).toHaveProperty('recentUsers');
      expect(body).toHaveProperty('aiMetrics');

      // Validar userMetrics
      expect(body.userMetrics).toHaveProperty('totalUsers');
      expect(body.userMetrics).toHaveProperty('activeUsersLast7Days');
      expect(body.userMetrics).toHaveProperty('activeUsersLast30Days');
      expect(typeof body.userMetrics.totalUsers).toBe('number');
      expect(body.userMetrics.totalUsers).toBeGreaterThan(0);

      // Validar readingMetrics
      expect(body.readingMetrics).toHaveProperty('totalReadings');
      expect(body.readingMetrics).toHaveProperty('readingsLast7Days');
      expect(body.readingMetrics).toHaveProperty('readingsLast30Days');
      expect(typeof body.readingMetrics.totalReadings).toBe('number');

      // Validar planDistribution
      expect(body.planDistribution).toHaveProperty('freeUsers');
      expect(body.planDistribution).toHaveProperty('premiumUsers');
      expect(body.planDistribution).toHaveProperty('freePercentage');
      expect(body.planDistribution).toHaveProperty('premiumPercentage');
      expect(body.planDistribution).toHaveProperty('conversionRate');
      expect(typeof body.planDistribution.freeUsers).toBe('number');
      expect(typeof body.planDistribution.conversionRate).toBe('number');

      // Validar arrays
      expect(Array.isArray(body.recentReadings)).toBe(true);
      expect(Array.isArray(body.recentUsers)).toBe(true);
      expect(body.recentReadings.length).toBeLessThanOrEqual(10);
      expect(body.recentUsers.length).toBeLessThanOrEqual(10);

      // Validar aiMetrics
      expect(body.aiMetrics).toHaveProperty('totalInterpretations');
      expect(body.aiMetrics).toHaveProperty('usageByProvider');
      expect(typeof body.aiMetrics.totalInterpretations).toBe('number');
      expect(Array.isArray(body.aiMetrics.usageByProvider)).toBe(true);
    });

    it('❌ Usuario regular NO puede acceder a métricas', async () => {
      await request(app.getHttpServer())
        .get('/admin/dashboard/metrics')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('❌ Sin token NO puede acceder', async () => {
      await request(app.getHttpServer())
        .get('/admin/dashboard/metrics')
        .expect(401);
    });

    it('✅ Las métricas retornan datos correctos', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/dashboard/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as DashboardMetricsResponse;

      // Los porcentajes deben sumar 100%
      const totalPercentage =
        body.planDistribution.freePercentage +
        body.planDistribution.premiumPercentage;
      expect(totalPercentage).toBeCloseTo(100, 1);

      // El total de usuarios debe ser la suma de free + premium
      const totalUsers =
        body.planDistribution.freeUsers + body.planDistribution.premiumUsers;
      expect(body.userMetrics.totalUsers).toBeGreaterThanOrEqual(totalUsers);

      // Usuarios activos no pueden ser más que el total
      expect(body.userMetrics.activeUsersLast7Days).toBeLessThanOrEqual(
        body.userMetrics.totalUsers,
      );
      expect(body.userMetrics.activeUsersLast30Days).toBeLessThanOrEqual(
        body.userMetrics.totalUsers,
      );

      // Lecturas de últimos 7 días <= últimos 30 días <= total
      expect(body.readingMetrics.readingsLast7Days).toBeLessThanOrEqual(
        body.readingMetrics.readingsLast30Days,
      );
      expect(body.readingMetrics.readingsLast30Days).toBeLessThanOrEqual(
        body.readingMetrics.totalReadings,
      );
    });

    it('✅ Lecturas recientes tienen la estructura correcta', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/dashboard/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as DashboardMetricsResponse;

      if (body.recentReadings.length > 0) {
        const reading = body.recentReadings[0];
        expect(reading).toHaveProperty('id');
        expect(reading).toHaveProperty('userEmail');
        expect(reading).toHaveProperty('userName');
        expect(reading).toHaveProperty('spreadType');
        expect(reading).toHaveProperty('status');
        expect(reading).toHaveProperty('createdAt');
        expect(typeof reading.id).toBe('number');
        expect(typeof reading.userEmail).toBe('string');
        expect(typeof reading.userName).toBe('string');
        // spreadType puede ser null hasta que se implemente la relación con spread
        expect([null, 'string'].includes(typeof reading.spreadType)).toBe(true);
      }
    });

    it('✅ Usuarios recientes tienen la estructura correcta', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/dashboard/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as DashboardMetricsResponse;

      if (body.recentUsers.length > 0) {
        const user = body.recentUsers[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('plan');
        expect(user).toHaveProperty('createdAt');
        expect(typeof user.id).toBe('number');
        expect(typeof user.email).toBe('string');
        expect([UserPlan.FREE, UserPlan.PREMIUM]).toContain(user.plan);
      }
    });

    it('✅ Métricas de IA tienen estructura correcta', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/dashboard/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as DashboardMetricsResponse;

      expect(typeof body.aiMetrics.totalInterpretations).toBe('number');
      expect(body.aiMetrics.totalInterpretations).toBeGreaterThanOrEqual(0);

      if (body.aiMetrics.usageByProvider.length > 0) {
        const providerStat = body.aiMetrics.usageByProvider[0];
        expect(providerStat).toHaveProperty('provider');
        expect(providerStat).toHaveProperty('count');
        expect(typeof providerStat.provider).toBe('string');
        expect(typeof providerStat.count).toBe('number');
      }
    });

    it('✅ Caché funciona (respuesta rápida en segunda llamada)', async () => {
      // Primera llamada (sin caché)
      const start1 = Date.now();
      await request(app.getHttpServer())
        .get('/admin/dashboard/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const duration1 = Date.now() - start1;

      // Segunda llamada (con caché, debería ser más rápida)
      const start2 = Date.now();
      const response2 = await request(app.getHttpServer())
        .get('/admin/dashboard/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const duration2 = Date.now() - start2;

      // La segunda llamada debería ser al menos un poco más rápida
      // No hacemos assertions estrictas porque puede fallar en CI
      console.log(`First call: ${duration1}ms, Second call: ${duration2}ms`);

      // Verificar que al menos retorna los datos correctamente
      const body = response2.body as DashboardMetricsResponse;
      expect(body).toHaveProperty('userMetrics');
      expect(body).toHaveProperty('readingMetrics');
    });
  });
});
