import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  ProcessMercadoPagoWebhookUseCase,
  MercadoPagoWebhookPayload,
} from './process-mercadopago-webhook.use-case';
import {
  SERVICE_PURCHASE_REPOSITORY,
  IServicePurchaseRepository,
} from '../../domain/interfaces';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';
import { MercadoPagoService } from '../../infrastructure/services/mercadopago.service';
import { EmailService } from '../../../email/email.service';
import { ServicePurchase } from '../../entities/service-purchase.entity';
import { SessionType } from '../../../scheduling/domain/enums';
import type { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUser = {
  id: 5,
  email: 'user@test.com',
  name: 'Test User',
} as ServicePurchase['user'];

const mockService = {
  id: 1,
  name: 'Árbol Genealógico',
  slug: 'arbol-genealogico',
  shortDescription: 'Desc',
  longDescription: 'Long desc',
  priceArs: 15000,
  durationMinutes: 60,
  sessionType: SessionType.FAMILY_TREE,
  whatsappNumber: '+5491112345678',
  mercadoPagoLink: 'https://mpago.la/1234567',
  imageUrl: null,
  displayOrder: 1,
  isActive: true,
  purchases: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockPurchasePending: ServicePurchase = {
  id: 10,
  userId: 5,
  user: mockUser,
  holisticServiceId: 1,
  holisticService: mockService,
  sessionId: null,
  session: null,
  paymentStatus: PurchaseStatus.PENDING,
  amountArs: 15000,
  paymentReference: null,
  paidAt: null,
  approvedByAdminId: null,
  selectedDate: null,
  selectedTime: null,
  mercadoPagoPaymentId: null,
  preferenceId: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockPurchasePaid: ServicePurchase = {
  ...mockPurchasePending,
  paymentStatus: PurchaseStatus.PAID,
  mercadoPagoPaymentId: '123456789',
  paidAt: new Date('2026-01-02'),
};

function buildPaymentResponse(
  status: string,
  paymentId: string,
  externalReference: string,
): PaymentResponse {
  return {
    id: Number(paymentId),
    status,
    status_detail: status === 'approved' ? 'accredited' : status,
    external_reference: externalReference,
    payer: { email: 'user@test.com' },
  } as unknown as PaymentResponse;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProcessMercadoPagoWebhookUseCase', () => {
  let useCase: ProcessMercadoPagoWebhookUseCase;
  let mockPurchaseRepo: jest.Mocked<IServicePurchaseRepository>;
  let mockMpService: jest.Mocked<
    Pick<MercadoPagoService, 'getPayment' | 'validateSignature'>
  >;
  let mockEmailService: jest.Mocked<
    Pick<EmailService, 'sendHolisticServiceConfirmation'>
  >;

  const validPayload: MercadoPagoWebhookPayload = {
    type: 'payment',
    data: { id: '123456789' },
  };

  const xSignature = 'ts=1234567890,v1=abc123';
  const xRequestId = 'req-id-001';

  beforeEach(async () => {
    mockPurchaseRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdWithService: jest.fn(),
      findPendingByUserAndService: jest.fn(),
      findPendingPayments: jest.fn(),
      findByIdWithRelations: jest.fn(),
      updateStatus: jest.fn(),
      findPaidUnassignedByUserAndSessionType: jest.fn(),
      findByMercadoPagoPaymentId: jest.fn(),
      findByPreferenceId: jest.fn(),
    };

    mockMpService = {
      getPayment: jest.fn(),
      validateSignature: jest.fn().mockReturnValue(true),
    };

    mockEmailService = {
      sendHolisticServiceConfirmation: jest.fn().mockResolvedValue(undefined),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('http://localhost:3001'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessMercadoPagoWebhookUseCase,
        { provide: SERVICE_PURCHASE_REPOSITORY, useValue: mockPurchaseRepo },
        { provide: MercadoPagoService, useValue: mockMpService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get(ProcessMercadoPagoWebhookUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  // ── Ignore non-payment types ──────────────────────────────────────────────

  it('debe ignorar notificaciones que no son de tipo "payment"', async () => {
    const result = await useCase.execute(
      { type: 'merchant_order', data: { id: '555' } },
      xSignature,
      xRequestId,
    );

    expect(result.processed).toBe(false);
    expect(result.message).toContain('merchant_order');
    expect(mockMpService.getPayment).not.toHaveBeenCalled();
  });

  // ── Signature validation ──────────────────────────────────────────────────

  it('debe rechazar si la firma es inválida', async () => {
    mockMpService.validateSignature.mockReturnValue(false);

    const result = await useCase.execute(validPayload, xSignature, xRequestId);

    expect(result.processed).toBe(false);
    expect(result.message).toBe('Firma inválida');
    expect(mockMpService.getPayment).not.toHaveBeenCalled();
  });

  // ── Approved payment ──────────────────────────────────────────────────────

  it('debe marcar la compra como PAID cuando el pago es "approved"', async () => {
    mockMpService.getPayment.mockResolvedValue(
      buildPaymentResponse('approved', '123456789', '10'),
    );
    mockPurchaseRepo.findByIdWithRelations.mockResolvedValue(
      mockPurchasePending,
    );
    mockPurchaseRepo.updateStatus.mockResolvedValue(mockPurchasePaid);

    const result = await useCase.execute(validPayload, xSignature, xRequestId);

    expect(result.processed).toBe(true);
    expect(mockPurchaseRepo.updateStatus).toHaveBeenCalledWith(
      10,
      PurchaseStatus.PAID,
      expect.objectContaining({
        mercadoPagoPaymentId: '123456789',
        paidAt: expect.any(Date),
      }),
    );
  });

  it('debe enviar email de confirmación cuando el pago es "approved"', async () => {
    mockMpService.getPayment.mockResolvedValue(
      buildPaymentResponse('approved', '123456789', '10'),
    );
    mockPurchaseRepo.findByIdWithRelations.mockResolvedValue(
      mockPurchasePending,
    );
    mockPurchaseRepo.updateStatus.mockResolvedValue(mockPurchasePaid);

    await useCase.execute(validPayload, xSignature, xRequestId);

    expect(
      mockEmailService.sendHolisticServiceConfirmation,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockEmailService.sendHolisticServiceConfirmation,
    ).toHaveBeenCalledWith(
      'user@test.com',
      expect.objectContaining({
        userName: 'Test User',
        serviceName: 'Árbol Genealógico',
      }),
    );
  });

  it('debe continuar aunque el email falle (aprobado)', async () => {
    mockMpService.getPayment.mockResolvedValue(
      buildPaymentResponse('approved', '123456789', '10'),
    );
    mockPurchaseRepo.findByIdWithRelations.mockResolvedValue(
      mockPurchasePending,
    );
    mockPurchaseRepo.updateStatus.mockResolvedValue(mockPurchasePaid);
    mockEmailService.sendHolisticServiceConfirmation.mockRejectedValue(
      new Error('SMTP down'),
    );

    const result = await useCase.execute(validPayload, xSignature, xRequestId);

    expect(result.processed).toBe(true);
    expect(mockPurchaseRepo.updateStatus).toHaveBeenCalledTimes(1);
  });

  // ── Idempotency ───────────────────────────────────────────────────────────

  it('debe ignorar una notificación duplicada (compra ya PAID con mismo paymentId)', async () => {
    mockMpService.getPayment.mockResolvedValue(
      buildPaymentResponse('approved', '123456789', '10'),
    );
    mockPurchaseRepo.findByIdWithRelations.mockResolvedValue(mockPurchasePaid);

    const result = await useCase.execute(validPayload, xSignature, xRequestId);

    expect(result.processed).toBe(false);
    expect(result.message).toBe('Notificación duplicada');
    expect(mockPurchaseRepo.updateStatus).not.toHaveBeenCalled();
  });

  // ── Rejected payment ──────────────────────────────────────────────────────

  it('debe marcar la compra como CANCELLED cuando el pago es "rejected"', async () => {
    mockMpService.getPayment.mockResolvedValue(
      buildPaymentResponse('rejected', '123456789', '10'),
    );
    mockPurchaseRepo.findByIdWithRelations.mockResolvedValue(
      mockPurchasePending,
    );
    mockPurchaseRepo.updateStatus.mockResolvedValue({
      ...mockPurchasePending,
      paymentStatus: PurchaseStatus.CANCELLED,
    });

    const result = await useCase.execute(validPayload, xSignature, xRequestId);

    expect(result.processed).toBe(true);
    expect(mockPurchaseRepo.updateStatus).toHaveBeenCalledWith(
      10,
      PurchaseStatus.CANCELLED,
      expect.objectContaining({ mercadoPagoPaymentId: '123456789' }),
    );
  });

  it('no debe enviar email de confirmación cuando el pago es "rejected"', async () => {
    mockMpService.getPayment.mockResolvedValue(
      buildPaymentResponse('rejected', '123456789', '10'),
    );
    mockPurchaseRepo.findByIdWithRelations.mockResolvedValue(
      mockPurchasePending,
    );
    mockPurchaseRepo.updateStatus.mockResolvedValue({
      ...mockPurchasePending,
      paymentStatus: PurchaseStatus.CANCELLED,
    });

    await useCase.execute(validPayload, xSignature, xRequestId);

    expect(
      mockEmailService.sendHolisticServiceConfirmation,
    ).not.toHaveBeenCalled();
  });

  // ── Pending / in_process ─────────────────────────────────────────────────

  it('debe retornar processed=true sin acción cuando el pago está "pending"', async () => {
    mockMpService.getPayment.mockResolvedValue(
      buildPaymentResponse('pending', '123456789', '10'),
    );
    mockPurchaseRepo.findByIdWithRelations.mockResolvedValue(
      mockPurchasePending,
    );

    const result = await useCase.execute(validPayload, xSignature, xRequestId);

    expect(result.processed).toBe(true);
    expect(result.message).toContain('pending');
    expect(mockPurchaseRepo.updateStatus).not.toHaveBeenCalled();
  });

  // ── Purchase not found ────────────────────────────────────────────────────

  it('debe retornar processed=false si la compra no existe', async () => {
    mockMpService.getPayment.mockResolvedValue(
      buildPaymentResponse('approved', '123456789', '999'),
    );
    mockPurchaseRepo.findByIdWithRelations.mockResolvedValue(null);

    const result = await useCase.execute(validPayload, xSignature, xRequestId);

    expect(result.processed).toBe(false);
    expect(result.message).toContain('999');
    expect(mockPurchaseRepo.updateStatus).not.toHaveBeenCalled();
  });

  // ── MP API error ──────────────────────────────────────────────────────────

  it('debe retornar processed=false si la API de MP falla', async () => {
    mockMpService.getPayment.mockRejectedValue(new Error('MP API timeout'));

    const result = await useCase.execute(validPayload, xSignature, xRequestId);

    expect(result.processed).toBe(false);
    expect(result.message).toContain('Error consultando pago en MP');
    expect(mockPurchaseRepo.updateStatus).not.toHaveBeenCalled();
  });
});
