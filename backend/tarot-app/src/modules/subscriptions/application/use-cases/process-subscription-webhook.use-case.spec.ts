import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import type { PreApprovalResponse } from 'mercadopago/dist/clients/preApproval/commonTypes';
import type { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { ProcessSubscriptionWebhookUseCase } from './process-subscription-webhook.use-case';
import { MercadoPagoService } from '../../../payments/infrastructure/services/mercadopago.service';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/repository.tokens';
import { IUserRepository } from '../../../users/domain/interfaces/user-repository.interface';
import {
  User,
  UserPlan,
  SubscriptionStatus,
} from '../../../users/entities/user.entity';
import type { MercadoPagoWebhookPayload } from '../../../holistic-services/application/use-cases/process-mercadopago-webhook.use-case';

// Helper to build partial MP API responses for mocking
function buildPreapprovalResponse(
  fields: Partial<PreApprovalResponse>,
): PreApprovalResponse {
  return fields as unknown as PreApprovalResponse;
}

function buildPaymentResponse(
  fields: Partial<PaymentResponse>,
): PaymentResponse {
  return fields as unknown as PaymentResponse;
}

describe('ProcessSubscriptionWebhookUseCase', () => {
  let useCase: ProcessSubscriptionWebhookUseCase;

  const mockUserRepo: jest.Mocked<Pick<IUserRepository, 'findById' | 'save'>> =
    {
      findById: jest.fn(),
      save: jest.fn(),
    };

  const mockMercadoPagoService: jest.Mocked<
    Pick<
      MercadoPagoService,
      'getPreapproval' | 'getPayment' | 'validateSignature'
    >
  > = {
    getPreapproval: jest.fn(),
    getPayment: jest.fn(),
    validateSignature: jest.fn(),
  };

  const makeUser = (overrides: Partial<User> = {}): User => {
    const user = new User();
    user.id = 42;
    user.email = 'test@example.com';
    user.name = 'Test User';
    user.plan = UserPlan.FREE;
    user.subscriptionStatus = null as unknown as SubscriptionStatus;
    user.planStartedAt = null as unknown as Date;
    user.planExpiresAt = null as unknown as Date;
    user.mpPreapprovalId = null;
    Object.assign(user, overrides);
    return user;
  };

  const xSignature = 'ts=1234,v1=abc123';
  const xRequestId = 'req-001';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessSubscriptionWebhookUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepo },
        { provide: MercadoPagoService, useValue: mockMercadoPagoService },
      ],
    }).compile();

    // Suppress logger output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    useCase = module.get<ProcessSubscriptionWebhookUseCase>(
      ProcessSubscriptionWebhookUseCase,
    );

    jest.clearAllMocks();
    // Default: signature is valid
    mockMercadoPagoService.validateSignature.mockReturnValue(true);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers de payload
  // ─────────────────────────────────────────────────────────────────────────

  const makePreapprovalPayload = (
    preapprovalId: string,
  ): MercadoPagoWebhookPayload => ({
    type: 'subscription_preapproval',
    data: { id: preapprovalId },
  });

  const makePaymentPayload = (
    paymentId: string,
    externalRef?: string,
  ): MercadoPagoWebhookPayload => ({
    type: 'payment',
    data: { id: paymentId },
    externalReference: externalRef,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Firma inválida
  // ─────────────────────────────────────────────────────────────────────────

  describe('cuando la firma es inválida', () => {
    it('debe rechazar el webhook con processed: false', async () => {
      mockMercadoPagoService.validateSignature.mockReturnValue(false);
      const payload = makePreapprovalPayload('preapproval-123');

      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(false);
      expect(result.message).toContain('Firma inválida');
      expect(mockMercadoPagoService.getPreapproval).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // type: subscription_preapproval — status: authorized
  // ─────────────────────────────────────────────────────────────────────────

  describe('subscription_preapproval con status=authorized', () => {
    it('debe activar el plan premium del usuario', async () => {
      const user = makeUser({ id: 42, plan: UserPlan.FREE });
      const nextPaymentDate = '2026-04-26T10:00:00.000Z';

      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        buildPreapprovalResponse({
          id: 'preapproval-123',
          status: 'authorized',
          external_reference: 'sub_42',
          next_payment_date: nextPaymentDate,
        }),
      );
      mockUserRepo.findById.mockResolvedValue(user);
      mockUserRepo.save.mockResolvedValue({ ...user } as User);

      const payload = makePreapprovalPayload('preapproval-123');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(true);
      expect(mockUserRepo.save).toHaveBeenCalledTimes(1);

      const savedUser: User = mockUserRepo.save.mock.calls[0][0];
      expect(savedUser.plan).toBe(UserPlan.PREMIUM);
      expect(savedUser.subscriptionStatus).toBe(SubscriptionStatus.ACTIVE);
      expect(savedUser.mpPreapprovalId).toBe('preapproval-123');
      expect(savedUser.planStartedAt).toBeInstanceOf(Date);
      expect(savedUser.planExpiresAt).toEqual(new Date(nextPaymentDate));
    });

    it('debe ser idempotente: no actualizar si ya está authorized+premium con mismo preapprovalId y planExpiresAt', async () => {
      const nextPaymentDate = '2026-04-26T10:00:00.000Z';
      const user = makeUser({
        id: 42,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        mpPreapprovalId: 'preapproval-123',
        planExpiresAt: new Date(nextPaymentDate),
      });

      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        buildPreapprovalResponse({
          id: 'preapproval-123',
          status: 'authorized',
          external_reference: 'sub_42',
          next_payment_date: nextPaymentDate,
        }),
      );
      mockUserRepo.findById.mockResolvedValue(user);

      const payload = makePreapprovalPayload('preapproval-123');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(false);
      expect(result.message).toContain('duplicada');
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('debe actualizar campos de suscripción si ya es PREMIUM+ACTIVE pero con distinto preapprovalId', async () => {
      const nextPaymentDate = '2026-04-26T10:00:00.000Z';
      const user = makeUser({
        id: 42,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        mpPreapprovalId: 'preapproval-OLD',
        planExpiresAt: new Date(nextPaymentDate),
      });

      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        buildPreapprovalResponse({
          id: 'preapproval-NEW',
          status: 'authorized',
          external_reference: 'sub_42',
          next_payment_date: nextPaymentDate,
        }),
      );
      mockUserRepo.findById.mockResolvedValue(user);
      mockUserRepo.save.mockResolvedValue({ ...user } as User);

      const payload = makePreapprovalPayload('preapproval-NEW');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(true);
      expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
      const savedUser: User = mockUserRepo.save.mock.calls[0][0];
      expect(savedUser.mpPreapprovalId).toBe('preapproval-NEW');
      // plan y subscriptionStatus no deben cambiar
      expect(savedUser.plan).toBe(UserPlan.PREMIUM);
      expect(savedUser.subscriptionStatus).toBe(SubscriptionStatus.ACTIVE);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // type: subscription_preapproval — status: cancelled
  // ─────────────────────────────────────────────────────────────────────────

  describe('subscription_preapproval con status=cancelled', () => {
    it('debe poner subscriptionStatus=cancelled pero mantener plan premium', async () => {
      const user = makeUser({
        id: 42,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        mpPreapprovalId: 'preapproval-123',
        planExpiresAt: new Date('2026-04-26'),
      });

      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        buildPreapprovalResponse({
          id: 'preapproval-123',
          status: 'cancelled',
          external_reference: 'sub_42',
        }),
      );
      mockUserRepo.findById.mockResolvedValue(user);
      mockUserRepo.save.mockResolvedValue({ ...user } as User);

      const payload = makePreapprovalPayload('preapproval-123');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(true);
      const savedUser: User = mockUserRepo.save.mock.calls[0][0];
      expect(savedUser.plan).toBe(UserPlan.PREMIUM);
      expect(savedUser.subscriptionStatus).toBe(SubscriptionStatus.CANCELLED);
    });

    it('debe ser idempotente: no actualizar si ya está cancelled', async () => {
      const user = makeUser({
        id: 42,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.CANCELLED,
        mpPreapprovalId: 'preapproval-123',
      });

      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        buildPreapprovalResponse({
          id: 'preapproval-123',
          status: 'cancelled',
          external_reference: 'sub_42',
        }),
      );
      mockUserRepo.findById.mockResolvedValue(user);

      const payload = makePreapprovalPayload('preapproval-123');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(false);
      expect(result.message).toContain('duplicada');
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // type: subscription_preapproval — status: paused
  // ─────────────────────────────────────────────────────────────────────────

  describe('subscription_preapproval con status=paused', () => {
    it('debe loggear y no cambiar el plan ni el estado', async () => {
      const user = makeUser({
        id: 42,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      });

      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        buildPreapprovalResponse({
          id: 'preapproval-123',
          status: 'paused',
          external_reference: 'sub_42',
        }),
      );
      mockUserRepo.findById.mockResolvedValue(user);

      const payload = makePreapprovalPayload('preapproval-123');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(false);
      expect(result.message).toContain('paused');
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // type: payment con external_reference sub_XXX — status: approved
  // ─────────────────────────────────────────────────────────────────────────

  describe('payment con external_reference=sub_XXX y status=approved', () => {
    it('debe actualizar planExpiresAt con next_payment_date del preapproval', async () => {
      const existingExpiry = new Date('2026-03-26');
      const user = makeUser({
        id: 42,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        mpPreapprovalId: 'preapproval-123',
        planExpiresAt: existingExpiry,
      });
      const nextPaymentDate = '2026-04-26T10:00:00.000Z';

      mockMercadoPagoService.getPayment.mockResolvedValue(
        buildPaymentResponse({
          id: 9001,
          status: 'approved',
          external_reference: 'sub_42',
        }),
      );
      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        buildPreapprovalResponse({
          id: 'preapproval-123',
          status: 'authorized',
          external_reference: 'sub_42',
          next_payment_date: nextPaymentDate,
        }),
      );
      mockUserRepo.findById.mockResolvedValue(user);
      mockUserRepo.save.mockResolvedValue({ ...user } as User);

      const payload = makePaymentPayload('9001', 'sub_42');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(true);
      const savedUser: User = mockUserRepo.save.mock.calls[0][0];
      expect(savedUser.planExpiresAt).toEqual(new Date(nextPaymentDate));
    });

    it('debe ser idempotente: no guardar si planExpiresAt ya es igual al nuevo valor', async () => {
      const nextPaymentDate = '2026-04-26T10:00:00.000Z';
      const user = makeUser({
        id: 42,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        mpPreapprovalId: 'preapproval-123',
        planExpiresAt: new Date(nextPaymentDate),
      });

      mockMercadoPagoService.getPayment.mockResolvedValue(
        buildPaymentResponse({
          id: 9003,
          status: 'approved',
          external_reference: 'sub_42',
        }),
      );
      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        buildPreapprovalResponse({
          id: 'preapproval-123',
          status: 'authorized',
          external_reference: 'sub_42',
          next_payment_date: nextPaymentDate,
        }),
      );
      mockUserRepo.findById.mockResolvedValue(user);

      const payload = makePaymentPayload('9003', 'sub_42');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(true);
      expect(result.message).toContain('duplicado');
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('debe ignorar payment cuyo external_reference de MP no tiene prefijo sub_', async () => {
      mockMercadoPagoService.getPayment.mockResolvedValue(
        buildPaymentResponse({
          id: 9004,
          status: 'approved',
          external_reference: 'holistic_service_99',
        }),
      );

      const payload = makePaymentPayload('9004');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(false);
      expect(result.message).toContain('sub_');
      expect(mockUserRepo.findById).not.toHaveBeenCalled();
    });

    it('debe loggear y no cambiar el plan si status=rejected', async () => {
      const user = makeUser({
        id: 42,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        mpPreapprovalId: 'preapproval-123',
        planExpiresAt: new Date('2026-04-26'),
      });

      mockMercadoPagoService.getPayment.mockResolvedValue(
        buildPaymentResponse({
          id: 9002,
          status: 'rejected',
          external_reference: 'sub_42',
        }),
      );
      mockUserRepo.findById.mockResolvedValue(user);

      const payload = makePaymentPayload('9002', 'sub_42');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(false);
      expect(result.message).toContain('rechazado');
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Casos de error / edge cases
  // ─────────────────────────────────────────────────────────────────────────

  describe('external_reference inválido', () => {
    it('debe ignorar con log si external_reference no tiene formato sub_XXX', async () => {
      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        buildPreapprovalResponse({
          id: 'preapproval-999',
          status: 'authorized',
          external_reference: 'invalid-ref',
        }),
      );

      const payload = makePreapprovalPayload('preapproval-999');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(false);
      expect(result.message).toContain('external_reference');
      expect(mockUserRepo.findById).not.toHaveBeenCalled();
    });

    it('debe ignorar con log si external_reference está ausente', async () => {
      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        buildPreapprovalResponse({
          id: 'preapproval-999',
          status: 'authorized',
          external_reference: undefined,
        }),
      );

      const payload = makePreapprovalPayload('preapproval-999');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(false);
      expect(result.message).toContain('external_reference');
      expect(mockUserRepo.findById).not.toHaveBeenCalled();
    });

    it('debe ignorar external_reference con formato ambiguo como sub_42abc (regex estricto)', async () => {
      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        buildPreapprovalResponse({
          id: 'preapproval-999',
          status: 'authorized',
          external_reference: 'sub_42abc',
        }),
      );

      const payload = makePreapprovalPayload('preapproval-999');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(false);
      expect(result.message).toContain('external_reference');
      expect(mockUserRepo.findById).not.toHaveBeenCalled();
    });
  });

  describe('usuario no encontrado', () => {
    it('debe ignorar con log si el usuario no existe en DB', async () => {
      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        buildPreapprovalResponse({
          id: 'preapproval-123',
          status: 'authorized',
          external_reference: 'sub_9999',
        }),
      );
      mockUserRepo.findById.mockResolvedValue(null);

      const payload = makePreapprovalPayload('preapproval-123');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(false);
      expect(result.message).toContain('Usuario no encontrado');
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('error al consultar MP API', () => {
    it('debe retornar processed: false si getPreapproval lanza error', async () => {
      mockMercadoPagoService.getPreapproval.mockRejectedValue(
        new Error('MP API unreachable'),
      );

      const payload = makePreapprovalPayload('preapproval-123');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(false);
      expect(result.message).toContain('Error');
    });

    it('debe retornar processed: false si getPayment lanza error para payment webhook', async () => {
      mockMercadoPagoService.getPayment.mockRejectedValue(
        new Error('MP API unreachable'),
      );

      const payload = makePaymentPayload('9001', 'sub_42');
      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(false);
      expect(result.message).toContain('Error');
    });
  });

  describe('tipo de notificación desconocido', () => {
    it('debe ignorar tipos que no son subscription_preapproval ni payment sub_', async () => {
      const payload: MercadoPagoWebhookPayload = {
        type: 'unknown_type',
        data: { id: '123' },
      };

      const result = await useCase.execute(payload, xSignature, xRequestId);

      expect(result.processed).toBe(false);
      expect(result.message).toContain('unknown_type');
      expect(mockMercadoPagoService.getPreapproval).not.toHaveBeenCalled();
      expect(mockMercadoPagoService.getPayment).not.toHaveBeenCalled();
    });
  });
});
