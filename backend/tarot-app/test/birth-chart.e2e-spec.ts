import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestingApp,
  createTestUser,
  generateAuthToken,
  TEST_BIRTH_DATA,
  cleanupBirthCharts,
  cleanupTestUsers,
  generateTestFingerprint,
  cleanupUsageTracking,
} from './birth-chart-test-utils';
import { User } from '../src/modules/users/entities/user.entity';
import { UserPlan } from '../src/modules/users/entities/user.entity';

/**
 * Tests de integración E2E para el controlador de Birth Chart
 * T-CA-048: Tests de Integración de API
 *
 * Cobertura:
 * - POST /api/v1/birth-chart/generate (Free & Premium)
 * - POST /api/v1/birth-chart/generate/anonymous (Anónimo)
 * - POST /api/v1/birth-chart/pdf (Free & Premium)
 * - GET /api/v1/birth-chart/geocode
 * - GET /api/v1/birth-chart/usage
 * - POST /api/v1/birth-chart/synthesis (Premium only)
 */
describe('BirthChartController (E2E)', () => {
  let app: INestApplication;
  let freeUser: User;
  let premiumUser: User;
  let freeToken: string;
  let premiumToken: string;

  beforeAll(async () => {
    app = await createTestingApp();

    // Crear usuarios de prueba
    freeUser = await createTestUser(app, { plan: UserPlan.FREE });
    premiumUser = await createTestUser(app, { plan: UserPlan.PREMIUM });

    freeToken = generateAuthToken(app, freeUser);
    premiumToken = generateAuthToken(app, premiumUser);
  });

  afterAll(async () => {
    // Limpiar datos de test
    await cleanupBirthCharts(app);
    await cleanupTestUsers(app);
    await app.close();
  });

  afterEach(async () => {
    // Limpiar cartas después de cada test
    await cleanupBirthCharts(app, freeUser.id);
    await cleanupBirthCharts(app, premiumUser.id);

    // Limpiar usage tracking para tests deterministas
    await cleanupUsageTracking(app, freeUser.id);
    await cleanupUsageTracking(app, premiumUser.id);
  });

  // ============================================================================
  // POST /api/v1/birth-chart/generate (Authenticated Users)
  // ============================================================================

  describe('POST /api/v1/birth-chart/generate', () => {
    it('should reject request without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/generate')
        .send(TEST_BIRTH_DATA)
        .expect(401);
    });

    it('should generate chart for free user (full response without AI)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/generate')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(TEST_BIRTH_DATA)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);

      // Big Three debe estar presente
      expect(response.body.bigThree).toBeDefined();
      expect(response.body.bigThree.sun).toBeDefined();
      expect(response.body.bigThree.moon).toBeDefined();
      expect(response.body.bigThree.ascendant).toBeDefined();

      // Distribución de elementos
      expect(response.body.distribution).toBeDefined();
      expect(response.body.distribution.elements).toBeDefined();
      expect(response.body.distribution.modalities).toBeDefined();

      // Interpretaciones completas
      expect(response.body.interpretations).toBeDefined();

      // NO debe incluir síntesis IA (solo Premium)
      expect(response.body.aiSynthesis).toBeUndefined();

      // Puede descargar PDF
      expect(response.body.canDownloadPdf).toBe(true);

      // NO tiene acceso a historial (solo Premium)
      expect(response.body.canAccessHistory).toBe(false);
      expect(response.body.savedChartId).toBeUndefined();
    });

    it('should generate chart for premium user (full response with AI)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/generate')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send(TEST_BIRTH_DATA)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);

      // Big Three
      expect(response.body.bigThree).toBeDefined();

      // Interpretaciones completas
      expect(response.body.interpretations).toBeDefined();

      // Síntesis IA (Premium feature)
      expect(response.body.aiSynthesis).toBeDefined();
      expect(response.body.aiSynthesis.content).toBeTruthy();
      expect(typeof response.body.aiSynthesis.content).toBe('string');

      // Acceso a historial (Premium feature)
      expect(response.body.canAccessHistory).toBe(true);
      expect(response.body.savedChartId).toBeDefined();
      expect(typeof response.body.savedChartId).toBe('number');
    });

    it('should validate birthDate format', async () => {
      const invalidData = {
        ...TEST_BIRTH_DATA,
        birthDate: 'invalid-date',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/generate')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBeDefined();
      expect(
        Array.isArray(response.body.message)
          ? response.body.message.some((msg: string) =>
              msg.toLowerCase().includes('fecha'),
            )
          : response.body.message.toLowerCase().includes('fecha'),
      ).toBe(true);
    });

    it('should validate birthTime format', async () => {
      const invalidData = {
        ...TEST_BIRTH_DATA,
        birthTime: '25:99', // Hora inválida
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/generate')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should validate latitude range', async () => {
      const invalidData = {
        ...TEST_BIRTH_DATA,
        latitude: 100, // Fuera de rango (-90 a 90)
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/generate')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBeDefined();
      expect(
        Array.isArray(response.body.message)
          ? response.body.message.some((msg: string) =>
              msg.toLowerCase().includes('latitud'),
            )
          : response.body.message.toLowerCase().includes('latitud'),
      ).toBe(true);
    });

    it('should validate longitude range', async () => {
      const invalidData = {
        ...TEST_BIRTH_DATA,
        longitude: 200, // Fuera de rango (-180 a 180)
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/generate')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBeDefined();
      expect(
        Array.isArray(response.body.message)
          ? response.body.message.some((msg: string) =>
              msg.toLowerCase().includes('longitud'),
            )
          : response.body.message.toLowerCase().includes('longitud'),
      ).toBe(true);
    });

    it('should validate timezone format', async () => {
      const invalidData = {
        ...TEST_BIRTH_DATA,
        timezone: 'invalid-timezone',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/generate')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should require all mandatory fields', async () => {
      const incompleteData = {
        name: 'Test',
        // Faltan otros campos
      };

      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/generate')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(incompleteData)
        .expect(400);
    });
  });

  // ============================================================================
  // POST /api/v1/birth-chart/generate/anonymous (Anonymous Users)
  // ============================================================================

  describe('POST /api/v1/birth-chart/generate/anonymous', () => {
    it('should generate basic chart for anonymous user', async () => {
      const fingerprint = generateTestFingerprint();

      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/generate/anonymous')
        .query({ fingerprint })
        .send(TEST_BIRTH_DATA)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Big Three debe estar presente (free for anonymous)
      expect(response.body.bigThree).toBeDefined();
      expect(response.body.bigThree.sun).toBeDefined();
      expect(response.body.bigThree.moon).toBeDefined();
      expect(response.body.bigThree.ascendant).toBeDefined();

      // NO debe incluir interpretaciones completas
      expect(response.body.interpretations).toBeUndefined();

      // NO debe incluir síntesis IA
      expect(response.body.aiSynthesis).toBeUndefined();

      // NO puede descargar PDF
      expect(response.body.canDownloadPdf).toBe(false);

      // NO tiene acceso a historial
      expect(response.body.canAccessHistory).toBe(false);
    });

    it('should require fingerprint query parameter', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/generate/anonymous')
        // Sin query fingerprint
        .send(TEST_BIRTH_DATA)
        .expect(400);
    });

    it('should enforce usage limits for anonymous users (1 lifetime)', async () => {
      const fingerprint = generateTestFingerprint();

      // Primera solicitud - debería funcionar
      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/generate/anonymous')
        .query({ fingerprint })
        .send(TEST_BIRTH_DATA)
        .expect(200);

      // Segunda solicitud - debería fallar (límite lifetime = 1)
      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/generate/anonymous')
        .query({ fingerprint })
        .send(TEST_BIRTH_DATA)
        .expect(429);

      expect(response.body.message).toBeDefined();
      expect(response.body.message.toLowerCase()).toContain('límite');
    });
  });

  // ============================================================================
  // POST /api/v1/birth-chart/pdf (Authenticated Users Only)
  // ============================================================================

  describe('POST /api/v1/birth-chart/pdf', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/pdf')
        .send(TEST_BIRTH_DATA)
        .expect(401);
    });

    it('should generate PDF for free user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/pdf')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(TEST_BIRTH_DATA)
        .expect(200);

      // Verificar headers de PDF
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.pdf');

      // Verificar que el cuerpo es un buffer
      expect(Buffer.isBuffer(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should generate PDF for premium user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/pdf')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send(TEST_BIRTH_DATA)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(Buffer.isBuffer(response.body)).toBe(true);
    });

    it('should validate data for PDF generation', async () => {
      const invalidData = {
        ...TEST_BIRTH_DATA,
        latitude: 999, // Inválido
      };

      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/pdf')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  // ============================================================================
  // GET /api/v1/birth-chart/geocode (Public Endpoint)
  // ============================================================================

  describe('GET /api/v1/birth-chart/geocode', () => {
    it('should return geocoded places', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/birth-chart/geocode')
        .query({ query: 'Buenos Aires' })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);

      if (response.body.results.length > 0) {
        const firstResult = response.body.results[0];
        expect(firstResult.displayName).toBeDefined();
        expect(firstResult.latitude).toBeDefined();
        expect(firstResult.longitude).toBeDefined();
        expect(firstResult.timezone).toBeDefined();
        expect(typeof firstResult.latitude).toBe('number');
        expect(typeof firstResult.longitude).toBe('number');
      }
    });

    it('should require minimum query length', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/birth-chart/geocode')
        .query({ query: 'AB' }) // Muy corto
        .expect(400);
    });

    it('should handle empty query', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/birth-chart/geocode')
        .query({ query: '' })
        .expect(400);
    });

    it('should handle query not found gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/birth-chart/geocode')
        .query({ query: 'XXXXXXXXXXXXXXXXX' })
        .expect(200);

      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
      // Puede estar vacío o tener resultados parciales
    });
  });

  // ============================================================================
  // GET /api/v1/birth-chart/usage (Usage Status)
  // ============================================================================

  describe('GET /api/v1/birth-chart/usage', () => {
    it('should return usage status for free user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/birth-chart/usage')
        .set('Authorization', `Bearer ${freeToken}`)
        .expect(200);

      expect(response.body.plan).toBe('free');
      expect(response.body.limit).toBeDefined();
      expect(response.body.used).toBeDefined();
      expect(response.body.remaining).toBeDefined();
      expect(response.body.canGenerate).toBeDefined();
      expect(typeof response.body.canGenerate).toBe('boolean');
    });

    it('should return usage status for premium user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/birth-chart/usage')
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(response.body.plan).toBe('premium');
      expect(response.body.limit).toBeDefined();
      expect(response.body.canGenerate).toBe(true); // Premium no tiene límites
    });

    it('should return anonymous status without auth', async () => {
      const fingerprint = generateTestFingerprint();

      const response = await request(app.getHttpServer())
        .get('/api/v1/birth-chart/usage')
        .query({ fingerprint })
        .expect(200);

      expect(response.body.plan).toBe('anonymous');
      expect(response.body.limit).toBe(1); // Límite lifetime anónimo
      expect(response.body.used).toBeDefined();
      expect(response.body.remaining).toBeDefined();
    });

    it('should require authentication or fingerprint', async () => {
      // Sin auth ni fingerprint
      await request(app.getHttpServer())
        .get('/api/v1/birth-chart/usage')
        .expect(400);
    });
  });

  // ============================================================================
  // POST /api/v1/birth-chart/synthesis (Premium Only)
  // ============================================================================

  describe('POST /api/v1/birth-chart/synthesis', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/synthesis')
        .send(TEST_BIRTH_DATA)
        .expect(401);
    });

    it('should reject free user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/synthesis')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(TEST_BIRTH_DATA)
        .expect(403);
    });

    it('should generate synthesis for premium user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/synthesis')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send(TEST_BIRTH_DATA)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.synthesis).toBeDefined();
      expect(typeof response.body.synthesis).toBe('string');
      expect(response.body.synthesis.length).toBeGreaterThan(0);
      expect(response.body.generatedAt).toBeDefined();
    });

    it('should validate data for synthesis generation', async () => {
      const invalidData = {
        ...TEST_BIRTH_DATA,
        birthDate: 'invalid',
      };

      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/synthesis')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should enforce daily limit for premium synthesis (2 per day)', async () => {
      // Primera síntesis
      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/synthesis')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send(TEST_BIRTH_DATA)
        .expect(200);

      // Segunda síntesis
      await request(app.getHttpServer())
        .post('/api/v1/birth-chart/synthesis')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({
          ...TEST_BIRTH_DATA,
          name: 'Test User 2',
          birthDate: '1995-08-20',
        })
        .expect(200);

      // Tercera síntesis - debería fallar (límite = 2 por día)
      const response = await request(app.getHttpServer())
        .post('/api/v1/birth-chart/synthesis')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({
          ...TEST_BIRTH_DATA,
          name: 'Test User 3',
          birthDate: '1988-03-10',
        })
        .expect(429);

      expect(response.body.message).toBeDefined();
      expect(response.body.message.toLowerCase()).toContain('límite');
    });
  });
});
