import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../src/common/enums/user-role.enum';
import { UserPlan } from '../src/modules/users/entities/user.entity';
import { PurchaseStatus } from '../src/modules/holistic-services/domain/enums/purchase-status.enum';

/**
 * E2E Tests for Holistic Services Module
 *
 * Covers:
 * - GET /holistic-services — retorna servicios activos (público)
 * - GET /holistic-services/:slug — retorna detalle sin whatsappNumber (público)
 * - POST /holistic-services/purchases — requiere auth (401 sin token, 201 con token)
 * - POST /holistic-services/purchases — previene duplicados PENDING (409)
 * - PATCH /admin/holistic-services/payments/:id/approve — cambia status a PAID (requiere admin)
 * - POST /scheduling/book — reserva holística sin pago aprobado falla (403)
 * - Endpoints admin requieren rol admin (403 para usuario normal)
 *
 * @module HolisticServicesE2E
 */

const TEST_DOMAIN = 'test-holistic-services.com';

interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    isAdmin: boolean;
    plan: string;
  };
  access_token: string;
  refresh_token: string;
}

interface HolisticServiceResponse {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  priceArs: number;
  durationMinutes: number;
  sessionType: string;
  displayOrder: number;
  isActive: boolean;
}

interface PurchaseResponse {
  id: number;
  holisticServiceId: number;
  userId: number;
  paymentStatus: PurchaseStatus;
  amountArs: number;
}

describe('Holistic Services (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let userToken: string;
  let testServiceId: number;
  let testServiceSlug: string;
  let testPurchaseId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Limpia datos previos de este dominio de test
    await dataSource.query(
      `DELETE FROM service_purchases WHERE user_id IN (SELECT id FROM "user" WHERE email LIKE $1)`,
      [`%@${TEST_DOMAIN}`],
    );
    await dataSource.query(`DELETE FROM "user" WHERE email LIKE $1`, [
      `%@${TEST_DOMAIN}`,
    ]);

    // Crear usuario admin de test
    const hashedPassword = await bcrypt.hash('TestAdminPass123!', 10);
    await dataSource.query(
      `INSERT INTO "user" (email, password, name, roles, plan)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        `admin@${TEST_DOMAIN}`,
        hashedPassword,
        'Admin Test',
        [UserRole.CONSUMER, UserRole.ADMIN],
        UserPlan.FREE,
      ],
    );

    // Crear usuario normal de test
    await dataSource.query(
      `INSERT INTO "user" (email, password, name, roles, plan)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        `user@${TEST_DOMAIN}`,
        hashedPassword,
        'Normal Test User',
        [UserRole.CONSUMER],
        UserPlan.FREE,
      ],
    );

    // Login admin
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: `admin@${TEST_DOMAIN}`, password: 'TestAdminPass123!' });
    adminToken = (adminLogin.body as LoginResponse).access_token;

    // Login usuario normal
    const userLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: `user@${TEST_DOMAIN}`, password: 'TestAdminPass123!' });
    userToken = (userLogin.body as LoginResponse).access_token;

    // Pequeña pausa para evitar rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Limpiar datos de test
    await dataSource.query(
      `DELETE FROM service_purchases WHERE user_id IN (SELECT id FROM "user" WHERE email LIKE $1)`,
      [`%@${TEST_DOMAIN}`],
    );
    await dataSource.query(`DELETE FROM "user" WHERE email LIKE $1`, [
      `%@${TEST_DOMAIN}`,
    ]);
    await app.close();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /holistic-services — catálogo público
  // ─────────────────────────────────────────────────────────────────────────
  describe('GET /holistic-services', () => {
    it('debe retornar lista de servicios activos sin autenticación (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/holistic-services')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('debe incluir los campos de catálogo básicos en cada servicio', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/holistic-services')
        .expect(200);

      const services = response.body as HolisticServiceResponse[];

      if (services.length > 0) {
        const service = services[0];
        expect(service).toHaveProperty('id');
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('slug');
        expect(service).toHaveProperty('shortDescription');
        expect(service).toHaveProperty('priceArs');
        expect(service).toHaveProperty('durationMinutes');
        expect(service).toHaveProperty('sessionType');
        expect(service).toHaveProperty('isActive');

        // Guardar para tests posteriores
        testServiceId = service.id;
        testServiceSlug = service.slug;
      }
    });

    it('no debe incluir whatsappNumber ni mercadoPagoLink en la respuesta pública', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/holistic-services')
        .expect(200);

      const services = response.body as HolisticServiceResponse[];
      if (services.length > 0) {
        expect(services[0]).not.toHaveProperty('whatsappNumber');
        expect(services[0]).not.toHaveProperty('mercadoPagoLink');
      }
    });

    it('debe retornar solo servicios activos (isActive = true)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/holistic-services')
        .expect(200);

      const services = response.body as HolisticServiceResponse[];
      services.forEach((service) => {
        expect(service.isActive).toBe(true);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /holistic-services/:slug — detalle público
  // ─────────────────────────────────────────────────────────────────────────
  describe('GET /holistic-services/:slug', () => {
    it('debe retornar detalle del servicio por slug sin autenticación (200)', async () => {
      if (!testServiceSlug) {
        console.warn('Sin servicios seed — saltando test de detalle por slug');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/holistic-services/${testServiceSlug}`)
        .expect(200);

      const service = response.body as HolisticServiceResponse & {
        longDescription?: string;
      };
      expect(service).toHaveProperty('id');
      expect(service).toHaveProperty('slug', testServiceSlug);
      expect(service).toHaveProperty('name');
    });

    it('no debe incluir whatsappNumber en el detalle público', async () => {
      if (!testServiceSlug) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/holistic-services/${testServiceSlug}`)
        .expect(200);

      expect(response.body).not.toHaveProperty('whatsappNumber');
      expect(response.body).not.toHaveProperty('mercadoPagoLink');
    });

    it('debe retornar 404 para slug inexistente', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/holistic-services/slug-que-no-existe-xyz')
        .expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // POST /holistic-services/purchases — crear compra
  // ─────────────────────────────────────────────────────────────────────────
  describe('POST /holistic-services/purchases', () => {
    it('debe retornar 401 sin autenticación', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/holistic-services/purchases')
        .send({ holisticServiceId: 1 })
        .expect(401);
    });

    it('debe crear compra con estado PENDING cuando el usuario está autenticado (201)', async () => {
      if (!testServiceId) {
        console.warn(
          'Sin servicios seed — saltando test de creación de compra',
        );
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/api/v1/holistic-services/purchases')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ holisticServiceId: testServiceId })
        .expect(201);

      const purchase = response.body as PurchaseResponse;
      expect(purchase).toHaveProperty('id');
      expect(purchase).toHaveProperty('paymentStatus', PurchaseStatus.PENDING);
      expect(purchase).toHaveProperty('holisticServiceId', testServiceId);

      // Guardar para tests posteriores
      testPurchaseId = purchase.id;
    });

    it('debe prevenir compra duplicada PENDING del mismo servicio (409)', async () => {
      if (!testServiceId) return;

      await request(app.getHttpServer())
        .post('/api/v1/holistic-services/purchases')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ holisticServiceId: testServiceId })
        .expect(409);
    });

    it('debe retornar 404 para un holisticServiceId inexistente', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/holistic-services/purchases')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ holisticServiceId: 999999 })
        .expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // PATCH /admin/holistic-services/payments/:id/approve — aprobar pago
  // ─────────────────────────────────────────────────────────────────────────
  describe('PATCH /admin/holistic-services/payments/:id/approve', () => {
    it('debe retornar 401 sin autenticación', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/admin/holistic-services/payments/1/approve')
        .expect(401);
    });

    it('debe retornar 403 para usuario normal (sin rol admin)', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/admin/holistic-services/payments/1/approve')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('debe aprobar el pago y cambiar el estado a PAID (200)', async () => {
      if (!testPurchaseId) {
        console.warn('Sin compra creada — saltando test de aprobación');
        return;
      }

      const response = await request(app.getHttpServer())
        .patch(
          `/api/v1/admin/holistic-services/payments/${testPurchaseId}/approve`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(200);

      const purchase = response.body as PurchaseResponse;
      expect(purchase).toHaveProperty('paymentStatus', PurchaseStatus.PAID);
      expect(purchase).toHaveProperty('id', testPurchaseId);
    });

    it('debe retornar 400 al intentar aprobar un pago ya aprobado', async () => {
      if (!testPurchaseId) return;

      await request(app.getHttpServer())
        .patch(
          `/api/v1/admin/holistic-services/payments/${testPurchaseId}/approve`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });

    it('debe retornar 404 para un purchaseId inexistente', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/admin/holistic-services/payments/999999/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Endpoints admin — requieren rol ADMIN
  // ─────────────────────────────────────────────────────────────────────────
  describe('Endpoints admin requieren rol admin', () => {
    it('GET /admin/holistic-services debe retornar 403 para usuario normal', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/holistic-services')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('GET /admin/holistic-services debe retornar 401 sin token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/holistic-services')
        .expect(401);
    });

    it('GET /admin/holistic-services/payments debe retornar 403 para usuario normal', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/holistic-services/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('GET /admin/holistic-services debe retornar lista de servicios para admin (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/holistic-services')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /admin/holistic-services/payments debe retornar pagos pendientes para admin (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/holistic-services/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // La respuesta puede ser array o paginada
      const body = response.body as unknown;
      expect(
        Array.isArray(body) ||
          (typeof body === 'object' && body !== null && 'data' in body),
      ).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Reserva de sesión holística sin pago aprobado — debe fallar con 403
  // ─────────────────────────────────────────────────────────────────────────
  describe('POST /scheduling/book — restricción de pago para sesiones holísticas', () => {
    it('debe retornar 403 al reservar sesión holística sin pago aprobado', async () => {
      // Crear un usuario nuevo sin compras
      const hashedPassword = await bcrypt.hash('TestUserNoPay123!', 10);
      const userResult = await dataSource.query(
        `INSERT INTO "user" (email, password, name, roles, plan)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          `nopay@${TEST_DOMAIN}`,
          hashedPassword,
          'User Without Payment',
          [UserRole.CONSUMER],
          UserPlan.FREE,
        ],
      );
      const noPayUserId = userResult[0].id;

      const noPayLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: `nopay@${TEST_DOMAIN}`, password: 'TestUserNoPay123!' });
      const noPayToken = (noPayLogin.body as LoginResponse).access_token;

      // Buscar el tarotistaId (ID 1 — Flavia según seed)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      await request(app.getHttpServer())
        .post('/api/v1/scheduling/book')
        .set('Authorization', `Bearer ${noPayToken}`)
        .send({
          tarotistaId: 1,
          sessionType: 'family_tree',
          durationMinutes: 60,
          startTime: `${futureDateStr}T10:00:00.000Z`,
        })
        .expect(403);

      // Cleanup usuario sin pago
      await dataSource.query(`DELETE FROM "user" WHERE id = $1`, [noPayUserId]);
    });
  });
});
