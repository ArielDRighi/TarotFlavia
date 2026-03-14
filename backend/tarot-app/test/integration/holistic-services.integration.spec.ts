import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

import { UsersService } from '../../src/modules/users/users.service';
import { AuthOrchestratorService } from '../../src/modules/auth/application/services/auth-orchestrator.service';

import { User } from '../../src/modules/users/entities/user.entity';
import { UserRole } from '../../src/common/enums/user-role.enum';
import { HolisticService } from '../../src/modules/holistic-services/entities/holistic-service.entity';
import { ServicePurchase } from '../../src/modules/holistic-services/entities/service-purchase.entity';
import { PurchaseStatus } from '../../src/modules/holistic-services/domain/enums/purchase-status.enum';
import { SessionType } from '../../src/modules/scheduling/domain/enums';

jest.setTimeout(30000);

describe('Holistic Services Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersService: UsersService;
  let authService: AuthOrchestratorService;

  let holisticServiceRepository: Repository<HolisticService>;
  let servicePurchaseRepository: Repository<ServicePurchase>;
  let userRepository: Repository<User>;

  // Test users
  let adminUser: User;
  let adminToken: string;
  let regularUser: User;
  let regularToken: string;
  let secondUser: User;
  let secondToken: string;

  // Self-created test services (no dependency on seeds)
  let testServiceA: HolisticService;
  let testServiceB: HolisticService;
  let testServiceC: HolisticService;

  // Track service created via admin CRUD tests
  let crudCreatedServiceId: number;

  const API = '/api/v1';

  const adminUserData = {
    password: 'AdminPass123!',
    name: 'Admin Integration Test',
  };

  const regularUserData = {
    password: 'UserPass123!',
    name: 'Regular Integration Test',
  };

  const secondUserData = {
    password: 'SecondPass123!',
    name: 'Second Integration Test',
  };

  /**
   * Helper: crear usuario y obtener token JWT
   */
  async function createUserAndGetToken(
    emailPrefix: string,
    userData: { password: string; name: string },
    roles: UserRole[] = [UserRole.CONSUMER],
  ): Promise<{ user: User; token: string }> {
    const email = `${emailPrefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@integration-test.com`;
    const created = await usersService.create({
      email,
      password: userData.password,
      name: userData.name,
    });

    const user = (await userRepository.findOne({
      where: { id: created.id },
    }))!;

    if (roles.includes(UserRole.ADMIN)) {
      user.roles = roles;
      await userRepository.save(user);
    }

    const loginResponse = await authService.login(
      user.id,
      user.email,
      '127.0.0.1',
      'integration-test-agent',
    );

    return { user, token: loginResponse.access_token };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SETUP GLOBAL: App + Users + Test Services (self-contained, no seeds)
  // ─────────────────────────────────────────────────────────────────────────
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
    usersService = moduleFixture.get<UsersService>(UsersService);
    authService = moduleFixture.get<AuthOrchestratorService>(
      AuthOrchestratorService,
    );

    holisticServiceRepository = dataSource.getRepository(HolisticService);
    servicePurchaseRepository = dataSource.getRepository(ServicePurchase);
    userRepository = dataSource.getRepository(User);

    // Crear usuarios de test
    const admin = await createUserAndGetToken('admin-hs', adminUserData, [
      UserRole.CONSUMER,
      UserRole.ADMIN,
    ]);
    adminUser = admin.user;
    adminToken = admin.token;

    const regular = await createUserAndGetToken('user-hs', regularUserData);
    regularUser = regular.user;
    regularToken = regular.token;

    const second = await createUserAndGetToken('user2-hs', secondUserData);
    secondUser = second.user;
    secondToken = second.token;

    // Crear 3 servicios de test directamente en DB (autosuficiente, sin seeds)
    const uniqueSuffix = Date.now().toString(36);
    testServiceA = await holisticServiceRepository.save({
      name: `Árbol Genealógico Test ${uniqueSuffix}`,
      slug: `arbol-test-${uniqueSuffix}`,
      shortDescription: 'Sanación de linaje familiar',
      longDescription:
        'Descripción larga del árbol genealógico para tests de integración. Contenido suficiente para validación.',
      priceArs: 15000,
      durationMinutes: 60,
      sessionType: SessionType.FAMILY_TREE,
      whatsappNumber: '+5491199990001',
      mercadoPagoLink: 'https://mpago.la/test-arbol',
      displayOrder: 1,
      isActive: true,
    });

    testServiceB = await holisticServiceRepository.save({
      name: `Péndulo Hebreo Test ${uniqueSuffix}`,
      slug: `pendulo-test-${uniqueSuffix}`,
      shortDescription: 'Sanación energética con letras hebreas',
      longDescription:
        'Descripción larga del péndulo hebreo para tests de integración. Contenido suficiente para validación.',
      priceArs: 12000,
      durationMinutes: 60,
      sessionType: SessionType.HEBREW_PENDULUM,
      whatsappNumber: '+5491199990002',
      mercadoPagoLink: 'https://mpago.la/test-pendulo',
      displayOrder: 2,
      isActive: true,
    });

    testServiceC = await holisticServiceRepository.save({
      name: `Limpiezas Energéticas Test ${uniqueSuffix}`,
      slug: `limpiezas-test-${uniqueSuffix}`,
      shortDescription: 'Armonización de espacios',
      longDescription:
        'Descripción larga de limpiezas energéticas para tests de integración. Contenido suficiente para validación.',
      priceArs: 10000,
      durationMinutes: 45,
      sessionType: SessionType.ENERGY_CLEANING,
      whatsappNumber: '+5491199990003',
      mercadoPagoLink: 'https://mpago.la/test-limpiezas',
      displayOrder: 3,
      isActive: true,
    });
  });

  afterAll(async () => {
    // Limpiar en orden: compras → servicios de test → usuarios
    if (dataSource.isInitialized) {
      await servicePurchaseRepository
        .createQueryBuilder()
        .delete()
        .where('userId IN (:...ids)', {
          ids: [regularUser.id, secondUser.id, adminUser.id],
        })
        .execute();

      const serviceIdsToDelete = [
        testServiceA.id,
        testServiceB.id,
        testServiceC.id,
      ];
      if (crudCreatedServiceId) {
        serviceIdsToDelete.push(crudCreatedServiceId);
      }
      await holisticServiceRepository.delete(serviceIdsToDelete);

      await userRepository.delete([
        regularUser.id,
        secondUser.id,
        adminUser.id,
      ]);
    }

    await app.close();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 1: CATÁLOGO PÚBLICO (HUS-001 / HUS-002)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Catálogo público — HUS-001 / HUS-002', () => {
    it('debe listar servicios activos y contener los de test', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/holistic-services`)
        .expect(200);

      const services = response.body as Array<{
        slug: string;
        isActive: boolean;
      }>;
      const slugs = services.map((s) => s.slug);

      expect(slugs).toContain(testServiceA.slug);
      expect(slugs).toContain(testServiceB.slug);
      expect(slugs).toContain(testServiceC.slug);
    });

    it('servicios activos deben estar ordenados por displayOrder', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/holistic-services`)
        .expect(200);

      const services = response.body as Array<{ displayOrder: number }>;
      for (let i = 1; i < services.length; i++) {
        expect(services[i].displayOrder).toBeGreaterThanOrEqual(
          services[i - 1].displayOrder,
        );
      }
    });

    it('cada servicio público debe tener campos de catálogo y NO datos sensibles', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/holistic-services`)
        .expect(200);

      const services = response.body as Record<string, unknown>[];
      for (const service of services) {
        expect(service).toHaveProperty('id');
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('slug');
        expect(service).toHaveProperty('shortDescription');
        expect(service).toHaveProperty('priceArs');
        expect(service).toHaveProperty('durationMinutes');
        expect(service).toHaveProperty('sessionType');
        expect(service).toHaveProperty('isActive', true);

        // Datos sensibles NO presentes
        expect(service).not.toHaveProperty('whatsappNumber');
        expect(service).not.toHaveProperty('mercadoPagoLink');
      }
    });

    it('debe retornar detalle de servicio por slug con longDescription', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/holistic-services/${testServiceA.slug}`)
        .expect(200);

      const detail = response.body as Record<string, unknown>;
      expect(detail).toHaveProperty('slug', testServiceA.slug);
      expect(detail).toHaveProperty('longDescription');
      expect(typeof detail.longDescription).toBe('string');
      expect((detail.longDescription as string).length).toBeGreaterThan(10);

      expect(detail).not.toHaveProperty('whatsappNumber');
      expect(detail).not.toHaveProperty('mercadoPagoLink');
    });

    it('debe retornar 404 para slug inexistente', async () => {
      await request(app.getHttpServer())
        .get(`${API}/holistic-services/servicio-fantasma-xyz-inexistente`)
        .expect(404);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 2: FLUJO DE COMPRA COMPLETO (HUS-003 / HUS-005 / HUS-006)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Flujo de compra completo — HUS-003 / HUS-005 / HUS-006', () => {
    let purchaseId: number;

    afterAll(async () => {
      await servicePurchaseRepository.delete({ userId: regularUser.id });
    });

    it('debe rechazar compra sin autenticación (401)', async () => {
      await request(app.getHttpServer())
        .post(`${API}/holistic-services/purchases`)
        .send({ holisticServiceId: testServiceA.id })
        .expect(401);
    });

    it('debe crear compra PENDING con el monto correcto del servicio', async () => {
      const response = await request(app.getHttpServer())
        .post(`${API}/holistic-services/purchases`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ holisticServiceId: testServiceA.id })
        .expect(201);

      const purchase = response.body as {
        id: number;
        paymentStatus: string;
        amountArs: number;
        userId: number;
        holisticServiceId: number;
        sessionId: number | null;
        paidAt: string | null;
        whatsappNumber?: string;
      };

      expect(purchase.paymentStatus).toBe(PurchaseStatus.PENDING);
      expect(Number(purchase.amountArs)).toBe(Number(testServiceA.priceArs));
      expect(purchase.userId).toBe(regularUser.id);
      expect(purchase.holisticServiceId).toBe(testServiceA.id);
      expect(purchase.sessionId).toBeNull();
      expect(purchase.paidAt).toBeNull();
      expect(purchase.whatsappNumber).toBeUndefined();

      purchaseId = purchase.id;
    });

    it('debe prevenir compra duplicada PENDING del mismo servicio (409)', async () => {
      await request(app.getHttpServer())
        .post(`${API}/holistic-services/purchases`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ holisticServiceId: testServiceA.id })
        .expect(409);
    });

    it('debe rechazar compra de servicio inexistente (404)', async () => {
      await request(app.getHttpServer())
        .post(`${API}/holistic-services/purchases`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ holisticServiceId: 999999 })
        .expect(404);
    });

    it('GET /purchases/my debe listar compras del usuario autenticado', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/holistic-services/purchases/my`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(200);

      const purchases = response.body as Array<{
        id: number;
        userId: number;
        paymentStatus: string;
      }>;
      expect(purchases.length).toBeGreaterThanOrEqual(1);

      const myPurchase = purchases.find((p) => p.id === purchaseId);
      expect(myPurchase).toBeDefined();
      expect(myPurchase!.userId).toBe(regularUser.id);
      expect(myPurchase!.paymentStatus).toBe(PurchaseStatus.PENDING);
    });

    it('GET /purchases/my debe retornar lista vacía para usuario sin compras', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/holistic-services/purchases/my`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('GET /purchases/:id debe retornar detalle de compra propia', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/holistic-services/purchases/${purchaseId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(200);

      const purchase = response.body as {
        id: number;
        userId: number;
        holisticService?: { id: number; name: string; slug: string };
      };
      expect(purchase.id).toBe(purchaseId);
      expect(purchase.userId).toBe(regularUser.id);
      expect(purchase.holisticService).toBeDefined();
      expect(purchase.holisticService!.id).toBe(testServiceA.id);
    });

    it('GET /purchases/:id debe rechazar acceso de otro usuario (403)', async () => {
      await request(app.getHttpServer())
        .get(`${API}/holistic-services/purchases/${purchaseId}`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(403);
    });

    it('GET /purchases/:id debe retornar 404 para compra inexistente', async () => {
      await request(app.getHttpServer())
        .get(`${API}/holistic-services/purchases/999999`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('admin debe ver la compra pendiente en pagos pendientes', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/admin/holistic-services/payments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const pending = response.body as Array<{
        id: number;
        paymentStatus: string;
      }>;
      const found = pending.find((p) => p.id === purchaseId);
      expect(found).toBeDefined();
      expect(found!.paymentStatus).toBe(PurchaseStatus.PENDING);
    });

    it('admin debe aprobar pago → estado cambia a PAID con whatsappNumber', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API}/admin/holistic-services/payments/${purchaseId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ paymentReference: 'MP-TEST-12345' })
        .expect(200);

      const approved = response.body as {
        id: number;
        paymentStatus: string;
        paidAt: string | null;
        whatsappNumber?: string;
        paymentReference: string | null;
      };
      expect(approved.paymentStatus).toBe(PurchaseStatus.PAID);
      expect(approved.paidAt).not.toBeNull();
      expect(approved.whatsappNumber).toBeDefined();
      expect(typeof approved.whatsappNumber).toBe('string');
      expect(approved.paymentReference).toBe('MP-TEST-12345');
    });

    it('GET /purchases/:id post-aprobación debe incluir whatsappNumber', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/holistic-services/purchases/${purchaseId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(200);

      const purchase = response.body as {
        paymentStatus: string;
        whatsappNumber?: string;
      };
      expect(purchase.paymentStatus).toBe(PurchaseStatus.PAID);
      expect(purchase.whatsappNumber).toBeDefined();
    });

    it('no debe poder aprobar un pago ya aprobado (400)', async () => {
      await request(app.getHttpServer())
        .patch(`${API}/admin/holistic-services/payments/${purchaseId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });

    it('no debe poder cancelar una compra ya aprobada (400)', async () => {
      await request(app.getHttpServer())
        .patch(`${API}/holistic-services/purchases/${purchaseId}/cancel`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 3: CANCELACIÓN DE COMPRAS
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Cancelación de compras', () => {
    let cancelPurchaseId: number;

    afterAll(async () => {
      await servicePurchaseRepository.delete({ userId: secondUser.id });
    });

    it('debe crear compra PENDING para test de cancelación', async () => {
      const response = await request(app.getHttpServer())
        .post(`${API}/holistic-services/purchases`)
        .set('Authorization', `Bearer ${secondToken}`)
        .send({ holisticServiceId: testServiceB.id })
        .expect(201);

      cancelPurchaseId = (response.body as { id: number }).id;
    });

    it('otro usuario no debe poder cancelar la compra (403)', async () => {
      await request(app.getHttpServer())
        .patch(`${API}/holistic-services/purchases/${cancelPurchaseId}/cancel`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);
    });

    it('el dueño debe poder cancelar su compra PENDING', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API}/holistic-services/purchases/${cancelPurchaseId}/cancel`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(200);

      const cancelled = response.body as { paymentStatus: string };
      expect(cancelled.paymentStatus).toBe(PurchaseStatus.CANCELLED);
    });

    it('no debe poder cancelar una compra ya cancelada (400)', async () => {
      await request(app.getHttpServer())
        .patch(`${API}/holistic-services/purchases/${cancelPurchaseId}/cancel`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(400);
    });

    it('después de cancelar, el usuario puede comprar el mismo servicio de nuevo', async () => {
      const response = await request(app.getHttpServer())
        .post(`${API}/holistic-services/purchases`)
        .set('Authorization', `Bearer ${secondToken}`)
        .send({ holisticServiceId: testServiceB.id })
        .expect(201);

      const newPurchase = response.body as {
        paymentStatus: string;
        id: number;
      };
      expect(newPurchase.paymentStatus).toBe(PurchaseStatus.PENDING);
      expect(newPurchase.id).not.toBe(cancelPurchaseId);
    });

    it('debe retornar 404 al cancelar compra inexistente', async () => {
      await request(app.getHttpServer())
        .patch(`${API}/holistic-services/purchases/999999/cancel`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(404);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 4: ADMIN CRUD DE SERVICIOS (HUS-007)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Admin CRUD de servicios — HUS-007', () => {
    const uniqueCrudSuffix = Date.now().toString(36);
    const newServiceData = {
      name: 'Servicio de Test CRUD',
      slug: `servicio-crud-${uniqueCrudSuffix}`,
      shortDescription: 'Descripción corta del servicio CRUD de test',
      longDescription:
        'Descripción larga del servicio de test CRUD con suficiente contenido para pasar la validación de longitud mínima.',
      priceArs: 25000,
      durationMinutes: 90,
      sessionType: SessionType.ENERGY_CLEANING,
      whatsappNumber: '+5491155556666',
      mercadoPagoLink: 'https://mpago.la/test-crud-12345',
      displayOrder: 99,
      isActive: false,
    };

    it('usuario normal no debe poder crear servicio (403)', async () => {
      await request(app.getHttpServer())
        .post(`${API}/admin/holistic-services`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newServiceData)
        .expect(403);
    });

    it('admin debe poder crear nuevo servicio', async () => {
      const response = await request(app.getHttpServer())
        .post(`${API}/admin/holistic-services`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newServiceData)
        .expect(201);

      const created = response.body as {
        id: number;
        name: string;
        slug: string;
        priceArs: number;
        isActive: boolean;
        whatsappNumber: string;
        mercadoPagoLink: string;
      };

      expect(created.name).toBe(newServiceData.name);
      expect(created.slug).toBe(newServiceData.slug);
      expect(Number(created.priceArs)).toBe(newServiceData.priceArs);
      expect(created.isActive).toBe(false);
      expect(created.whatsappNumber).toBe(newServiceData.whatsappNumber);
      expect(created.mercadoPagoLink).toBe(newServiceData.mercadoPagoLink);

      crudCreatedServiceId = created.id;
    });

    it('servicio inactivo NO debe aparecer en catálogo público', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/holistic-services`)
        .expect(200);

      const slugs = (response.body as Array<{ slug: string }>).map(
        (s) => s.slug,
      );
      expect(slugs).not.toContain(newServiceData.slug);
    });

    it('servicio inactivo SÍ debe aparecer en listado admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/admin/holistic-services`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const services = response.body as Array<{
        id: number;
        slug: string;
        isActive: boolean;
        whatsappNumber: string;
      }>;
      const testService = services.find((s) => s.slug === newServiceData.slug);
      expect(testService).toBeDefined();
      expect(testService!.isActive).toBe(false);
      expect(testService!.whatsappNumber).toBeDefined();
    });

    it('admin debe poder actualizar servicio (activar + cambiar precio)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API}/admin/holistic-services/${crudCreatedServiceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: true, priceArs: 30000 })
        .expect(200);

      const updated = response.body as {
        isActive: boolean;
        priceArs: number;
        name: string;
      };
      expect(updated.isActive).toBe(true);
      expect(Number(updated.priceArs)).toBe(30000);
      expect(updated.name).toBe(newServiceData.name);
    });

    it('servicio recién activado debe aparecer en catálogo público', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/holistic-services`)
        .expect(200);

      const slugs = (response.body as Array<{ slug: string }>).map(
        (s) => s.slug,
      );
      expect(slugs).toContain(newServiceData.slug);
    });

    it('usuario normal no debe poder actualizar servicio (403)', async () => {
      await request(app.getHttpServer())
        .patch(`${API}/admin/holistic-services/${crudCreatedServiceId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ priceArs: 1 })
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 5: VALIDACIÓN DE DTOs Y EDGE CASES
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Validación de DTOs y edge cases', () => {
    it('debe rechazar compra con holisticServiceId negativo', async () => {
      await request(app.getHttpServer())
        .post(`${API}/holistic-services/purchases`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ holisticServiceId: -1 })
        .expect(400);
    });

    it('debe rechazar compra con holisticServiceId string', async () => {
      await request(app.getHttpServer())
        .post(`${API}/holistic-services/purchases`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ holisticServiceId: 'no-numerico' })
        .expect(400);
    });

    it('debe rechazar compra sin holisticServiceId', async () => {
      await request(app.getHttpServer())
        .post(`${API}/holistic-services/purchases`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({})
        .expect(400);
    });

    it('debe rechazar crear servicio con slug inválido (mayúsculas)', async () => {
      await request(app.getHttpServer())
        .post(`${API}/admin/holistic-services`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Slug',
          slug: 'SLUG-INVALIDO',
          shortDescription: 'Desc corta',
          longDescription:
            'Desc larga con suficiente contenido para la validación mínima.',
          priceArs: 1000,
          durationMinutes: 30,
          sessionType: SessionType.ENERGY_CLEANING,
          whatsappNumber: '+5491155556666',
          mercadoPagoLink: 'https://mpago.la/test',
        })
        .expect(400);
    });

    it('debe rechazar crear servicio sin campos obligatorios', async () => {
      await request(app.getHttpServer())
        .post(`${API}/admin/holistic-services`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Solo nombre' })
        .expect(400);
    });

    it('debe rechazar crear servicio con precio negativo', async () => {
      await request(app.getHttpServer())
        .post(`${API}/admin/holistic-services`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Precio',
          slug: 'test-precio-negativo',
          shortDescription: 'Desc',
          longDescription:
            'Descripción larga suficiente para validación mínima del campo.',
          priceArs: -500,
          durationMinutes: 30,
          sessionType: SessionType.FAMILY_TREE,
          whatsappNumber: '+5491155556666',
          mercadoPagoLink: 'https://mpago.la/test',
        })
        .expect(400);
    });

    it('debe rechazar campos extra no permitidos (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post(`${API}/holistic-services/purchases`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ holisticServiceId: 1, campoExtra: 'valor' })
        .expect(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 6: AISLAMIENTO ENTRE USUARIOS
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Aislamiento entre usuarios', () => {
    let user1PurchaseId: number;

    beforeAll(async () => {
      await servicePurchaseRepository.delete({ userId: regularUser.id });
      await servicePurchaseRepository.delete({ userId: secondUser.id });
    });

    afterAll(async () => {
      await servicePurchaseRepository.delete({ userId: regularUser.id });
      await servicePurchaseRepository.delete({ userId: secondUser.id });
    });

    it('ambos usuarios deben poder comprar el mismo servicio', async () => {
      const res1 = await request(app.getHttpServer())
        .post(`${API}/holistic-services/purchases`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ holisticServiceId: testServiceC.id })
        .expect(201);

      user1PurchaseId = (res1.body as { id: number }).id;

      const res2 = await request(app.getHttpServer())
        .post(`${API}/holistic-services/purchases`)
        .set('Authorization', `Bearer ${secondToken}`)
        .send({ holisticServiceId: testServiceC.id })
        .expect(201);

      expect((res2.body as { id: number }).id).not.toBe(user1PurchaseId);
    });

    it('GET /purchases/my debe retornar SOLO las compras del usuario logueado', async () => {
      const res1 = await request(app.getHttpServer())
        .get(`${API}/holistic-services/purchases/my`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(200);

      const user1Purchases = res1.body as Array<{ userId: number }>;
      for (const p of user1Purchases) {
        expect(p.userId).toBe(regularUser.id);
      }

      const res2 = await request(app.getHttpServer())
        .get(`${API}/holistic-services/purchases/my`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(200);

      const user2Purchases = res2.body as Array<{ userId: number }>;
      for (const p of user2Purchases) {
        expect(p.userId).toBe(secondUser.id);
      }
    });

    it('un usuario no debe poder ver la compra de otro usuario', async () => {
      await request(app.getHttpServer())
        .get(`${API}/holistic-services/purchases/${user1PurchaseId}`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 7: PROTECCIÓN DE ENDPOINTS (AUTORIZACIÓN)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Protección de endpoints — autorización', () => {
    it('GET /purchases/my debe retornar 401 sin token', async () => {
      await request(app.getHttpServer())
        .get(`${API}/holistic-services/purchases/my`)
        .expect(401);
    });

    it('PATCH /purchases/:id/cancel debe retornar 401 sin token', async () => {
      await request(app.getHttpServer())
        .patch(`${API}/holistic-services/purchases/1/cancel`)
        .expect(401);
    });

    it('POST /admin/holistic-services debe retornar 401 sin token', async () => {
      await request(app.getHttpServer())
        .post(`${API}/admin/holistic-services`)
        .send({ name: 'test' })
        .expect(401);
    });

    it('PATCH /admin/holistic-services/:id debe retornar 403 para usuario normal', async () => {
      await request(app.getHttpServer())
        .patch(`${API}/admin/holistic-services/1`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ priceArs: 1000 })
        .expect(403);
    });

    it('GET /admin/holistic-services/payments debe retornar 403 para usuario normal', async () => {
      await request(app.getHttpServer())
        .get(`${API}/admin/holistic-services/payments`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);
    });

    it('PATCH /admin/holistic-services/payments/:id/approve debe retornar 403 para usuario normal', async () => {
      await request(app.getHttpServer())
        .patch(`${API}/admin/holistic-services/payments/1/approve`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({})
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 8: USER JOURNEY COMPLETO
  // ═══════════════════════════════════════════════════════════════════════════
  describe('User journey completo: catálogo → compra → aprobación → WhatsApp', () => {
    let journeyPurchaseId: number;

    beforeAll(async () => {
      await servicePurchaseRepository.delete({ userId: secondUser.id });
    });

    afterAll(async () => {
      await servicePurchaseRepository.delete({ userId: secondUser.id });
    });

    it('Paso 1: usuario ve catálogo y servicios de test están presentes', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/holistic-services`)
        .expect(200);

      const services = response.body as Array<{ slug: string }>;
      expect(services.length).toBeGreaterThan(0);
      const slugs = services.map((s) => s.slug);
      expect(slugs).toContain(testServiceA.slug);
    });

    it('Paso 2: usuario ve detalle del servicio por slug', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/holistic-services/${testServiceA.slug}`)
        .expect(200);

      const detail = response.body as Record<string, unknown>;
      expect(detail).toHaveProperty('longDescription');
      expect(detail).not.toHaveProperty('whatsappNumber');
    });

    it('Paso 3: usuario autenticado crea compra PENDING', async () => {
      const response = await request(app.getHttpServer())
        .post(`${API}/holistic-services/purchases`)
        .set('Authorization', `Bearer ${secondToken}`)
        .send({ holisticServiceId: testServiceA.id })
        .expect(201);

      const purchase = response.body as {
        id: number;
        paymentStatus: string;
        whatsappNumber?: string;
      };
      expect(purchase.paymentStatus).toBe(PurchaseStatus.PENDING);
      expect(purchase.whatsappNumber).toBeUndefined();

      journeyPurchaseId = purchase.id;
    });

    it('Paso 4: usuario ve su compra en "Mis Servicios"', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/holistic-services/purchases/my`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(200);

      const purchases = response.body as Array<{
        id: number;
        paymentStatus: string;
      }>;
      const found = purchases.find((p) => p.id === journeyPurchaseId);
      expect(found).toBeDefined();
      expect(found!.paymentStatus).toBe(PurchaseStatus.PENDING);
    });

    it('Paso 5: admin aprueba el pago', async () => {
      const response = await request(app.getHttpServer())
        .patch(
          `${API}/admin/holistic-services/payments/${journeyPurchaseId}/approve`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ paymentReference: 'MP-JOURNEY-001' })
        .expect(200);

      const approved = response.body as {
        paymentStatus: string;
        whatsappNumber?: string;
      };
      expect(approved.paymentStatus).toBe(PurchaseStatus.PAID);
      expect(approved.whatsappNumber).toBeDefined();
    });

    it('Paso 6: usuario ve WhatsApp en detalle de compra post-aprobación', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/holistic-services/purchases/${journeyPurchaseId}`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(200);

      const purchase = response.body as {
        paymentStatus: string;
        whatsappNumber?: string;
        holisticService?: { name: string };
      };
      expect(purchase.paymentStatus).toBe(PurchaseStatus.PAID);
      expect(purchase.whatsappNumber).toBeDefined();
      expect(typeof purchase.whatsappNumber).toBe('string');
      expect(purchase.holisticService).toBeDefined();
    });

    it('Paso 7: compra aprobada desaparece de pagos pendientes', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API}/admin/holistic-services/payments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const pending = response.body as Array<{ id: number }>;
      const found = pending.find((p) => p.id === journeyPurchaseId);
      expect(found).toBeUndefined();
    });
  });
});
