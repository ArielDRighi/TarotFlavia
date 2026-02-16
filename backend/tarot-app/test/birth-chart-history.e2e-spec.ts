import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestingApp,
  createTestUser,
  generateAuthToken,
  TEST_BIRTH_DATA,
  cleanupBirthCharts,
  cleanupTestUsers,
  createTestBirthChart,
} from './birth-chart-test-utils';
import { User } from '../src/modules/users/entities/user.entity';
import { UserPlan } from '../src/modules/users/entities/user.entity';

/**
 * Tests de integración E2E para el controlador de Birth Chart History
 * T-CA-048: Tests de Integración de API
 *
 * Cobertura:
 * - GET /api/v1/birth-chart/history (Premium only)
 * - GET /api/v1/birth-chart/history/:id (Premium only)
 * - POST /api/v1/birth-chart/history/check-duplicate (Premium only)
 * - POST /api/v1/birth-chart/history (Premium only)
 * - PATCH /api/v1/birth-chart/history/:id/rename (Premium only)
 * - DELETE /api/v1/birth-chart/history/:id (Premium only)
 * - POST /api/v1/birth-chart/history/:id/pdf (Premium only)
 */
describe('BirthChartHistoryController (E2E)', () => {
  let app: INestApplication;
  let premiumUser: User;
  let freeUser: User;
  let premiumToken: string;
  let freeToken: string;
  let savedChartId: number;

  beforeAll(async () => {
    app = await createTestingApp();

    // Crear usuarios de prueba
    premiumUser = await createTestUser(app, { plan: UserPlan.PREMIUM });
    freeUser = await createTestUser(app, { plan: UserPlan.FREE });

    premiumToken = generateAuthToken(app, premiumUser);
    freeToken = generateAuthToken(app, freeUser);
  });

  afterAll(async () => {
    // Limpiar datos de test
    await cleanupBirthCharts(app);
    await cleanupTestUsers(app);
    await app.close();
  });

  beforeEach(async () => {
    // Crear una carta de test antes de cada prueba
    const chart = await createTestBirthChart(app, premiumUser.id, {
      name: 'Test Chart for History',
      birthDate: new Date('1990-05-15'),
      birthTime: '14:30:00',
      latitude: TEST_BIRTH_DATA.latitude,
      longitude: TEST_BIRTH_DATA.longitude,
    });
    savedChartId = chart.id;
  });

  afterEach(async () => {
    // Limpiar cartas después de cada test
    await cleanupBirthCharts(app, premiumUser.id);
    await cleanupBirthCharts(app, freeUser.id);
  });

  // ============================================================================
  // GET /api/v1/birth-chart/history (List User Charts)
  // ============================================================================

  describe('GET /api/v1/birth-chart/history', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/birth-chart/history')
        .expect(401);
    });

    it('should reject free user (Premium only)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/birth-chart/history')
        .set('Authorization', `Bearer ${freeToken}`)
        .expect(403);
    });

    it('should return user charts for premium user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/birth-chart/history')
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Verificar formato de paginación
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.page).toBeDefined();
      expect(response.body.meta.limit).toBeDefined();
      expect(response.body.meta.totalItems).toBeDefined();
      expect(response.body.meta.totalPages).toBeDefined();

      // Verificar estructura de carta en lista
      const firstChart = response.body.data[0];
      expect(firstChart.id).toBeDefined();
      expect(firstChart.name).toBeDefined();
      expect(firstChart.birthDate).toBeDefined();
      expect(firstChart.sunSign).toBeDefined();
      expect(firstChart.moonSign).toBeDefined();
      expect(firstChart.ascendantSign).toBeDefined();
      expect(firstChart.createdAt).toBeDefined();
    });

    it('should support pagination', async () => {
      // Crear múltiples cartas
      await createTestBirthChart(app, premiumUser.id, {
        name: 'Chart 2',
        birthDate: new Date('1995-08-20'),
      });
      await createTestBirthChart(app, premiumUser.id, {
        name: 'Chart 3',
        birthDate: new Date('1988-03-10'),
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/birth-chart/history')
        .query({ page: 1, limit: 2 })
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(2);
    });

    it('should return empty array when user has no charts', async () => {
      // Limpiar todas las cartas del usuario
      await cleanupBirthCharts(app, premiumUser.id);

      const response = await request(app.getHttpServer())
        .get('/api/v1/birth-chart/history')
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.meta.totalItems).toBe(0);
    });
  });

  // ============================================================================
  // GET /api/v1/birth-chart/history/:id (Get Single Chart)
  // ============================================================================

  describe('GET /api/v1/birth-chart/history/:id', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/birth-chart/history/${savedChartId}`)
        .expect(401);
    });

    it('should reject free user', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/birth-chart/history/${savedChartId}`)
        .set('Authorization', `Bearer ${freeToken}`)
        .expect(403);
    });

    it('should return full chart details for premium user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/birth-chart/history/${savedChartId}`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(savedChartId);
      expect(response.body.name).toBeDefined();
      expect(response.body.birthDate).toBeDefined();
      expect(response.body.birthPlace).toBeDefined();

      // Big Three
      expect(response.body.bigThree).toBeDefined();

      // Chart data completo
      expect(response.body.chartData).toBeDefined();
      expect(response.body.chartData.planets).toBeDefined();
      expect(response.body.chartData.houses).toBeDefined();

      // Interpretaciones
      expect(response.body.interpretations).toBeDefined();
    });

    it('should return 404 for non-existent chart', async () => {
      const nonExistentId = 999999;

      await request(app.getHttpServer())
        .get(`/api/v1/birth-chart/history/${nonExistentId}`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(404);
    });

    it('should prevent access to other user charts', async () => {
      // Crear otro usuario Premium
      const otherPremiumUser = await createTestUser(app, {
        plan: UserPlan.PREMIUM,
      });
      const otherToken = generateAuthToken(app, otherPremiumUser);

      // Intentar acceder a la carta del primer usuario
      await request(app.getHttpServer())
        .get(`/api/v1/birth-chart/history/${savedChartId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      // Limpiar usuario temporal
      await cleanupBirthCharts(app, otherPremiumUser.id);
      await cleanupTestUsers(app, otherPremiumUser.email);
    });
  });

  // ============================================================================
  // POST /api/v1/birth-chart/history/check-duplicate
  // ============================================================================

  describe('POST /api/v1/birth-chart/history/check-duplicate', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/history/check-duplicate')
        .send(TEST_BIRTH_DATA)
        .expect(401);
    });

    it('should reject free user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/history/check-duplicate')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(TEST_BIRTH_DATA)
        .expect(403);
    });

    it('should detect duplicate chart', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/history/check-duplicate')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({
          birthDate: '1990-05-15',
          birthTime: '14:30',
          latitude: TEST_BIRTH_DATA.latitude,
          longitude: TEST_BIRTH_DATA.longitude,
        })
        .expect(200);

      expect(response.body.isDuplicate).toBe(true);
      expect(response.body.existingChart).toBeDefined();
      expect(response.body.existingChart.id).toBe(savedChartId);
      expect(response.body.existingChart.name).toBeDefined();
    });

    it('should return false for non-duplicate chart', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/history/check-duplicate')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({
          birthDate: '2000-12-25',
          birthTime: '10:00',
          latitude: 40.7128,
          longitude: -74.006,
        })
        .expect(200);

      expect(response.body.isDuplicate).toBe(false);
      expect(response.body.existingChart).toBeNull();
    });
  });

  // ============================================================================
  // POST /api/v1/birth-chart/history (Save New Chart)
  // ============================================================================

  describe('POST /api/v1/birth-chart/history', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/history')
        .send(TEST_BIRTH_DATA)
        .expect(401);
    });

    it('should reject free user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/history')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(TEST_BIRTH_DATA)
        .expect(403);
    });

    it('should save new chart for premium user', async () => {
      const newChartData = {
        ...TEST_BIRTH_DATA,
        name: 'New Chart',
        birthDate: '2000-12-25',
        birthTime: '10:00',
        chartName: 'My Personal Chart',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/history')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send(newChartData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe('My Personal Chart');
      expect(response.body.saved).toBe(true);
    });

    it('should reject duplicate chart', async () => {
      const duplicateData = {
        ...TEST_BIRTH_DATA,
        birthDate: '1990-05-15',
        birthTime: '14:30',
        latitude: TEST_BIRTH_DATA.latitude,
        longitude: TEST_BIRTH_DATA.longitude,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/history')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send(duplicateData)
        .expect(409); // Conflict

      expect(response.body.message).toBeDefined();
      expect(response.body.message.toLowerCase()).toContain('duplicado');
    });

    it('should validate birth data', async () => {
      const invalidData = {
        ...TEST_BIRTH_DATA,
        birthDate: 'invalid-date',
      };

      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/history')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  // ============================================================================
  // PATCH /api/v1/birth-chart/history/:id/rename
  // ============================================================================

  describe('PATCH /api/v1/birth-chart/history/:id/rename', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/birth-chart/history/${savedChartId}/rename`)
        .send({ name: 'New Name' })
        .expect(401);
    });

    it('should reject free user', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/birth-chart/history/${savedChartId}/rename`)
        .set('Authorization', `Bearer ${freeToken}`)
        .send({ name: 'New Name' })
        .expect(403);
    });

    it('should rename chart for premium user', async () => {
      const newName = 'Renamed Chart';

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/birth-chart/history/${savedChartId}/rename`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({ name: newName })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();

      // Verificar que el nombre cambió
      const checkResponse = await request(app.getHttpServer())
        .get(`/api/v1/birth-chart/history/${savedChartId}`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(checkResponse.body.name).toBe(newName);
    });

    it('should return 404 for non-existent chart', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/birth-chart/history/999999/rename')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({ name: 'New Name' })
        .expect(404);
    });

    it('should validate name length', async () => {
      const tooLongName = 'A'.repeat(101); // Más de 100 caracteres

      await request(app.getHttpServer())
        .patch(`/api/v1/birth-chart/history/${savedChartId}/rename`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({ name: tooLongName })
        .expect(400);
    });
  });

  // ============================================================================
  // DELETE /api/v1/birth-chart/history/:id
  // ============================================================================

  describe('DELETE /api/v1/birth-chart/history/:id', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/birth-chart/history/${savedChartId}`)
        .expect(401);
    });

    it('should reject free user', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/birth-chart/history/${savedChartId}`)
        .set('Authorization', `Bearer ${freeToken}`)
        .expect(403);
    });

    it('should delete chart for premium user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/birth-chart/history/${savedChartId}`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();

      // Verificar que la carta ya no existe
      await request(app.getHttpServer())
        .get(`/api/v1/birth-chart/history/${savedChartId}`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent chart', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/birth-chart/history/999999')
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(404);
    });

    it('should prevent deletion of other user charts', async () => {
      // Crear otro usuario Premium con una carta
      const otherPremiumUser = await createTestUser(app, {
        plan: UserPlan.PREMIUM,
      });
      const otherToken = generateAuthToken(app, otherPremiumUser);

      // Intentar eliminar la carta del primer usuario
      await request(app.getHttpServer())
        .delete(`/api/v1/birth-chart/history/${savedChartId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      // Verificar que la carta todavía existe
      await request(app.getHttpServer())
        .get(`/api/v1/birth-chart/history/${savedChartId}`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      // Limpiar usuario temporal
      await cleanupBirthCharts(app, otherPremiumUser.id);
      await cleanupTestUsers(app, otherPremiumUser.email);
    });
  });

  // ============================================================================
  // POST /api/v1/birth-chart/history/:id/pdf (Generate PDF from Saved Chart)
  // ============================================================================

  describe('POST /api/v1/birth-chart/history/:id/pdf', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/birth-chart/history/${savedChartId}/pdf`)
        .expect(401);
    });

    it('should reject free user', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/birth-chart/history/${savedChartId}/pdf`)
        .set('Authorization', `Bearer ${freeToken}`)
        .expect(403);
    });

    it('should generate PDF from saved chart for premium user', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/birth-chart/history/${savedChartId}/pdf`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      // Verificar headers de PDF
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.pdf');

      // Verificar que el cuerpo es un buffer con contenido
      expect(Buffer.isBuffer(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent chart', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/history/999999/pdf')
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(404);
    });

    it('should prevent PDF generation of other user charts', async () => {
      // Crear otro usuario Premium
      const otherPremiumUser = await createTestUser(app, {
        plan: UserPlan.PREMIUM,
      });
      const otherToken = generateAuthToken(app, otherPremiumUser);

      // Intentar generar PDF de la carta del primer usuario
      await request(app.getHttpServer())
        .post(`/api/v1/birth-chart/history/${savedChartId}/pdf`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      // Limpiar usuario temporal
      await cleanupBirthCharts(app, otherPremiumUser.id);
      await cleanupTestUsers(app, otherPremiumUser.email);
    });
  });
});
