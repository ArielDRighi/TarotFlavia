import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

// Services
import { UsersService } from '../../src/modules/users/users.service';
import { AuthOrchestratorService } from '../../src/modules/auth/application/services/auth-orchestrator.service';
import { MercadoPagoService } from '../../src/modules/payments/infrastructure/services/mercadopago.service';
import { SubscriptionCronService } from '../../src/modules/subscriptions/application/services/subscription-cron.service';

// Entities
import {
  User,
  UserPlan,
  SubscriptionStatus,
} from '../../src/modules/users/entities/user.entity';

// Types
import type { PreApprovalResponse } from 'mercadopago/dist/clients/preApproval/commonTypes';
import type { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

jest.setTimeout(30000);

describe('Subscriptions Webhook → Activation Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersService: UsersService;
  let authService: AuthOrchestratorService;
  let mercadoPagoService: MercadoPagoService;
  let subscriptionCronService: SubscriptionCronService;
  let userRepository: Repository<User>;

  // Test user data
  let testUser: User;
  let authToken: string;

  const testUserPassword = 'TestPass123!';

  // ─────────────────────────────────────────────────────────────────────────
  // Setup / Teardown
  // ─────────────────────────────────────────────────────────────────────────

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

    dataSource = moduleFixture.get<DataSource>(DataSource);
    usersService = moduleFixture.get<UsersService>(UsersService);
    authService = moduleFixture.get<AuthOrchestratorService>(
      AuthOrchestratorService,
    );
    mercadoPagoService =
      moduleFixture.get<MercadoPagoService>(MercadoPagoService);
    subscriptionCronService = moduleFixture.get<SubscriptionCronService>(
      SubscriptionCronService,
    );

    userRepository = dataSource.getRepository(User);
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  beforeEach(async () => {
    // Crear usuario de prueba con email único para cada test
    const uniqueEmail = `webhook-integration-${Date.now()}-${Math.random()}@example.com`;

    const userWithoutPassword = await usersService.create({
      email: uniqueEmail,
      password: testUserPassword,
      name: 'Webhook Integration Test User',
    });

    testUser = (await userRepository.findOne({
      where: { id: userWithoutPassword.id },
    }))!;

    // Obtener auth token
    const loginResponse = await authService.login(
      testUser.id,
      testUser.email,
      '127.0.0.1',
      'test-user-agent',
    );
    authToken = loginResponse.access_token;
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    if (testUser?.id) {
      await userRepository.delete({ id: testUser.id });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Construye un mock de PreApprovalResponse para usar con jest.spyOn
   */
  function buildMockPreapproval(
    overrides: Partial<PreApprovalResponse> = {},
  ): PreApprovalResponse {
    return {
      id: 'preapproval-test-123',
      status: 'authorized',
      external_reference: `sub_${testUser.id}`,
      next_payment_date: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      ...overrides,
    } as PreApprovalResponse;
  }

  /**
   * Construye un mock de PaymentResponse para usar con jest.spyOn
   */
  function buildMockPayment(
    overrides: Partial<PaymentResponse> = {},
  ): PaymentResponse {
    return {
      id: 999,
      status: 'approved',
      external_reference: `sub_${testUser.id}`,
      ...overrides,
    } as PaymentResponse;
  }

  /**
   * Envía un webhook simulado al endpoint POST /webhooks/mercadopago
   */
  async function sendWebhook(
    payload: Record<string, unknown>,
    headers: Record<string, string> = {},
  ): Promise<request.Response> {
    return request(app.getHttpServer())
      .post('/webhooks/mercadopago')
      .set('x-signature', headers['x-signature'] ?? '')
      .set('x-request-id', headers['x-request-id'] ?? '')
      .send(payload)
      .expect(200);
  }

  /**
   * Consulta el estado de suscripción del usuario autenticado
   */
  async function getSubscriptionStatus(): Promise<request.Response> {
    return request(app.getHttpServer())
      .get('/subscriptions/status')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Test 1: webhook subscription_preapproval authorized → plan=premium
  // ─────────────────────────────────────────────────────────────────────────

  describe('Flujo de activación: subscription_preapproval authorized', () => {
    it('debería activar el plan premium cuando el webhook llega con status=authorized', async () => {
      // ARRANGE: mock de MP que retorna preapproval authorized
      const nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const mockPreapproval = buildMockPreapproval({
        status: 'authorized',
        id: 'preapproval-activation-123',
        next_payment_date: nextPaymentDate.toISOString(),
      });

      jest
        .spyOn(mercadoPagoService, 'getPreapproval')
        .mockResolvedValue(mockPreapproval);

      // ACT: simular webhook de suscripción autorizada
      const webhookPayload = {
        type: 'subscription_preapproval',
        data: { id: 'preapproval-activation-123' },
      };
      const webhookResponse = await sendWebhook(webhookPayload);

      // ASSERT webhook procesado
      expect(webhookResponse.body.processed).toBe(true);

      // ASSERT: GET /subscriptions/status retorna plan=premium
      const statusResponse = await getSubscriptionStatus();

      expect(statusResponse.body.plan).toBe(UserPlan.PREMIUM);
      expect(statusResponse.body.subscriptionStatus).toBe(
        SubscriptionStatus.ACTIVE,
      );
      expect(statusResponse.body.planExpiresAt).toBeDefined();
      expect(statusResponse.body.mpPreapprovalId).toBe(
        'preapproval-activation-123',
      );

      // ASSERT: DB también refleja el cambio
      const updatedUser = await userRepository.findOne({
        where: { id: testUser.id },
      });
      expect(updatedUser!.plan).toBe(UserPlan.PREMIUM);
      expect(updatedUser!.subscriptionStatus).toBe(SubscriptionStatus.ACTIVE);
      expect(updatedUser!.mpPreapprovalId).toBe('preapproval-activation-123');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 2: webhook payment sub_ approved → planExpiresAt actualizado
  // ─────────────────────────────────────────────────────────────────────────

  describe('Cobro recurrente: webhook payment sub_ approved', () => {
    it('debería actualizar planExpiresAt cuando llega un cobro recurrente aprobado', async () => {
      // ARRANGE: usuario ya es premium
      const originalExpiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      testUser.plan = UserPlan.PREMIUM;
      testUser.subscriptionStatus = SubscriptionStatus.ACTIVE;
      testUser.mpPreapprovalId = 'preapproval-recurring-123';
      testUser.planExpiresAt = originalExpiresAt;
      await userRepository.save(testUser);

      // Mock de MP: getPayment retorna pago aprobado con external_reference sub_
      const mockPayment = buildMockPayment({
        status: 'approved',
        external_reference: `sub_${testUser.id}`,
      });
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPayment);

      // Mock de MP: getPreapproval retorna nueva fecha de cobro (30 días más)
      const newNextPaymentDate = new Date(
        Date.now() + 45 * 24 * 60 * 60 * 1000,
      );
      const mockPreapproval = buildMockPreapproval({
        id: 'preapproval-recurring-123',
        status: 'authorized',
        next_payment_date: newNextPaymentDate.toISOString(),
      });
      jest
        .spyOn(mercadoPagoService, 'getPreapproval')
        .mockResolvedValue(mockPreapproval);

      // ACT: simular webhook de cobro recurrente
      const webhookPayload = {
        type: 'payment',
        data: { id: '999' },
        externalReference: `sub_${testUser.id}`,
      };
      const webhookResponse = await sendWebhook(webhookPayload);

      // ASSERT webhook procesado
      expect(webhookResponse.body.processed).toBe(true);

      // ASSERT: GET /subscriptions/status retorna planExpiresAt actualizado
      const statusResponse = await getSubscriptionStatus();

      expect(statusResponse.body.plan).toBe(UserPlan.PREMIUM);
      expect(statusResponse.body.subscriptionStatus).toBe(
        SubscriptionStatus.ACTIVE,
      );

      // planExpiresAt debe ser la nueva fecha (no la original)
      const returnedExpiresAt = new Date(statusResponse.body.planExpiresAt);
      expect(returnedExpiresAt.getTime()).toBeGreaterThan(
        originalExpiresAt.getTime(),
      );

      // ASSERT: DB actualizada — planExpiresAt debe ser mayor que originalExpiresAt
      // (comparamos a nivel de día para evitar problemas de timezone UTC vs local)
      const updatedUser = await userRepository.findOne({
        where: { id: testUser.id },
      });
      expect(updatedUser!.planExpiresAt).toBeDefined();
      expect(updatedUser!.planExpiresAt.getTime()).toBeGreaterThan(
        originalExpiresAt.getTime(),
      );
      // La nueva fecha de expiración debe estar aproximadamente 45 días en el futuro
      // (newNextPaymentDate.toISOString().split('T')[0] should match stored date ± 1 day timezone tolerance)
      const storedDateStr = updatedUser!.planExpiresAt
        .toISOString()
        .split('T')[0];
      const expectedDateStr = newNextPaymentDate.toISOString().split('T')[0];
      // Allow 1 day difference to account for timezone offsets (UTC vs local)
      const storedDay = new Date(storedDateStr).getTime();
      const expectedDay = new Date(expectedDateStr).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      expect(Math.abs(storedDay - expectedDay)).toBeLessThanOrEqual(oneDayMs);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 3: cancelación → plan sigue premium, subscriptionStatus=cancelled
  // ─────────────────────────────────────────────────────────────────────────

  describe('Flujo de cancelación: subscription_preapproval cancelled', () => {
    it('debería mantener el plan premium pero marcar subscriptionStatus=cancelled', async () => {
      // ARRANGE: usuario con suscripción activa
      const planExpiresAt = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
      testUser.plan = UserPlan.PREMIUM;
      testUser.subscriptionStatus = SubscriptionStatus.ACTIVE;
      testUser.mpPreapprovalId = 'preapproval-cancel-123';
      testUser.planExpiresAt = planExpiresAt;
      await userRepository.save(testUser);

      // Mock de MP: preapproval con status=cancelled
      const mockPreapproval = buildMockPreapproval({
        id: 'preapproval-cancel-123',
        status: 'cancelled',
        external_reference: `sub_${testUser.id}`,
        next_payment_date: planExpiresAt.toISOString(),
      });
      jest
        .spyOn(mercadoPagoService, 'getPreapproval')
        .mockResolvedValue(mockPreapproval);

      // ACT: simular webhook de cancelación
      const webhookPayload = {
        type: 'subscription_preapproval',
        data: { id: 'preapproval-cancel-123' },
      };
      const webhookResponse = await sendWebhook(webhookPayload);

      // ASSERT webhook procesado
      expect(webhookResponse.body.processed).toBe(true);

      // ASSERT: GET /subscriptions/status retorna plan=premium pero cancelled
      const statusResponse = await getSubscriptionStatus();

      expect(statusResponse.body.plan).toBe(UserPlan.PREMIUM);
      expect(statusResponse.body.subscriptionStatus).toBe(
        SubscriptionStatus.CANCELLED,
      );
      // planExpiresAt sigue presente (usuario mantiene acceso)
      expect(statusResponse.body.planExpiresAt).toBeDefined();

      // ASSERT: DB actualizada correctamente
      const updatedUser = await userRepository.findOne({
        where: { id: testUser.id },
      });
      expect(updatedUser!.plan).toBe(UserPlan.PREMIUM);
      expect(updatedUser!.subscriptionStatus).toBe(
        SubscriptionStatus.CANCELLED,
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 4: CRON degrada plan después de planExpiresAt
  // ─────────────────────────────────────────────────────────────────────────

  describe('Degradación automática: CRON después de planExpiresAt', () => {
    it('debería degradar a free cuando el CRON corre con suscripción cancelada y planExpiresAt vencido', async () => {
      // ARRANGE: usuario con suscripción cancelada y planExpiresAt en el pasado
      const expiredDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // ayer
      testUser.plan = UserPlan.PREMIUM;
      testUser.subscriptionStatus = SubscriptionStatus.CANCELLED;
      testUser.mpPreapprovalId = 'preapproval-cron-123';
      testUser.planExpiresAt = expiredDate;
      await userRepository.save(testUser);

      // ASSERT PRECONDICIÓN: usuario aún es premium antes del CRON
      const beforeCron = await userRepository.findOne({
        where: { id: testUser.id },
      });
      expect(beforeCron!.plan).toBe(UserPlan.PREMIUM);

      // ACT: ejecutar el CRON manualmente
      await subscriptionCronService.degradeExpiredPlans();

      // ASSERT: GET /subscriptions/status retorna plan=free
      const statusResponse = await getSubscriptionStatus();

      expect(statusResponse.body.plan).toBe(UserPlan.FREE);
      expect(statusResponse.body.subscriptionStatus).toBe(
        SubscriptionStatus.EXPIRED,
      );

      // ASSERT: DB actualizada
      const afterCron = await userRepository.findOne({
        where: { id: testUser.id },
      });
      expect(afterCron!.plan).toBe(UserPlan.FREE);
      expect(afterCron!.subscriptionStatus).toBe(SubscriptionStatus.EXPIRED);
    });

    it('NO debería degradar usuarios con suscripción activa aunque planExpiresAt haya pasado', async () => {
      // ARRANGE: usuario con suscripción ACTIVA y planExpiresAt en el pasado
      const expiredDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      testUser.plan = UserPlan.PREMIUM;
      testUser.subscriptionStatus = SubscriptionStatus.ACTIVE;
      testUser.mpPreapprovalId = 'preapproval-active-no-degrade';
      testUser.planExpiresAt = expiredDate;
      await userRepository.save(testUser);

      // ACT: ejecutar el CRON
      await subscriptionCronService.degradeExpiredPlans();

      // ASSERT: usuario SIGUE siendo premium (activos no se degradan)
      const afterCron = await userRepository.findOne({
        where: { id: testUser.id },
      });
      expect(afterCron!.plan).toBe(UserPlan.PREMIUM);
      expect(afterCron!.subscriptionStatus).toBe(SubscriptionStatus.ACTIVE);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 5: no regresión — webhook holístico numérico sigue procesándose
  // ─────────────────────────────────────────────────────────────────────────

  describe('No regresión: webhook de pago de servicio holístico', () => {
    it('debería procesar webhooks de pago con external_reference numérico (no sub_) sin afectar suscripciones', async () => {
      // ARRANGE: usuario free sin suscripción MP
      expect(testUser.plan).toBe(UserPlan.FREE);
      expect(testUser.mpPreapprovalId).toBeNull();

      // ACT: simular webhook de pago holístico con external_reference numérico
      // El WebhookController enruta este tipo al HolisticServicesOrchestratorService
      // No mockeamos MercadoPago porque el holistic controller tiene su propio mock path,
      // pero verificamos que el routing funciona devolviendo 200.
      const webhookPayload = {
        type: 'payment',
        data: { id: '12345' },
        externalReference: '9876', // numérico, no "sub_"
      };

      // El webhook debe responder 200 (el holistic service puede fallar internamente,
      // pero el controller NO debe desviar el pago a suscripciones)
      await request(app.getHttpServer())
        .post('/webhooks/mercadopago')
        .set('x-signature', '')
        .set('x-request-id', '')
        .send(webhookPayload)
        .expect(200);

      // ASSERT: el plan del usuario no cambió (el webhook holístico no afecta suscripciones)
      const userAfter = await userRepository.findOne({
        where: { id: testUser.id },
      });
      expect(userAfter!.plan).toBe(UserPlan.FREE);
      expect(userAfter!.subscriptionStatus).toBeNull();
      expect(userAfter!.mpPreapprovalId).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 6: flujo completo activación → consulta status → cancelación → CRON
  // ─────────────────────────────────────────────────────────────────────────

  describe('Flujo completo end-to-end', () => {
    it('debería completar el ciclo: activación → status premium → cancelación → CRON degrada', async () => {
      // PASO 1: activar premium vía webhook
      const nextPaymentDate = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hora atrás (para que el CRON lo degrade)
      const mockPreapprovalAuthorized = buildMockPreapproval({
        id: 'preapproval-e2e-flow',
        status: 'authorized',
        next_payment_date: nextPaymentDate.toISOString(),
      });

      jest
        .spyOn(mercadoPagoService, 'getPreapproval')
        .mockResolvedValue(mockPreapprovalAuthorized);

      await sendWebhook({
        type: 'subscription_preapproval',
        data: { id: 'preapproval-e2e-flow' },
      });

      // Verificar que ahora es premium
      let statusResp = await getSubscriptionStatus();
      expect(statusResp.body.plan).toBe(UserPlan.PREMIUM);
      expect(statusResp.body.subscriptionStatus).toBe(
        SubscriptionStatus.ACTIVE,
      );

      // PASO 2: simular cancelación vía webhook
      const mockPreapprovalCancelled = buildMockPreapproval({
        id: 'preapproval-e2e-flow',
        status: 'cancelled',
        next_payment_date: nextPaymentDate.toISOString(),
      });

      jest
        .spyOn(mercadoPagoService, 'getPreapproval')
        .mockResolvedValue(mockPreapprovalCancelled);

      await sendWebhook({
        type: 'subscription_preapproval',
        data: { id: 'preapproval-e2e-flow' },
      });

      // Verificar que está cancelado pero sigue premium
      statusResp = await getSubscriptionStatus();
      expect(statusResp.body.plan).toBe(UserPlan.PREMIUM);
      expect(statusResp.body.subscriptionStatus).toBe(
        SubscriptionStatus.CANCELLED,
      );

      // PASO 3: CRON degrada (planExpiresAt ya está en el pasado)
      await subscriptionCronService.degradeExpiredPlans();

      // Verificar degradación final
      statusResp = await getSubscriptionStatus();
      expect(statusResp.body.plan).toBe(UserPlan.FREE);
      expect(statusResp.body.subscriptionStatus).toBe(
        SubscriptionStatus.EXPIRED,
      );
    });
  });
});
