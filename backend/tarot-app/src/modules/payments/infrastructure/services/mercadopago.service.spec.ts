import * as crypto from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  MercadoPagoService,
  CreatePreferenceParams,
  CreatePreapprovalParams,
} from './mercadopago.service';

// ─── Mock SDK ─────────────────────────────────────────────────────────────────

const mockPreferenceCreate = jest.fn();
const mockPaymentGet = jest.fn();
const mockPreApprovalCreate = jest.fn();
const mockPreApprovalGet = jest.fn();
const mockPreApprovalUpdate = jest.fn();

jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn().mockImplementation(() => ({})),
  Preference: jest.fn().mockImplementation(() => ({
    create: mockPreferenceCreate,
  })),
  Payment: jest.fn().mockImplementation(() => ({
    get: mockPaymentGet,
  })),
  PreApproval: jest.fn().mockImplementation(() => ({
    create: mockPreApprovalCreate,
    get: mockPreApprovalGet,
    update: mockPreApprovalUpdate,
  })),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildConfigService(
  overrides: Record<string, string> = {},
): ConfigService {
  const defaults: Record<string, string> = {
    MP_ACCESS_TOKEN: 'TEST-token-123',
    NODE_ENV: 'test',
  };
  const values = { ...defaults, ...overrides };
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MercadoPagoService', () => {
  let service: MercadoPagoService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoService,
        { provide: ConfigService, useValue: buildConfigService() },
      ],
    }).compile();

    service = module.get(MercadoPagoService);
  });

  // ── createPreference ──────────────────────────────────────────────────────

  describe('createPreference', () => {
    const params: CreatePreferenceParams = {
      purchaseId: 42,
      serviceName: 'Árbol Genealógico',
      amountArs: 15000,
      userEmail: 'user@test.com',
      notificationUrl: 'http://localhost:3000/api/v1/webhooks/mercadopago',
      backUrls: {
        success: 'http://localhost:3001/servicios/pago-exitoso',
        pending: 'http://localhost:3001/servicios/pago-pendiente',
        failure: 'http://localhost:3001/servicios/pago-fallido',
      },
    };

    it('debe retornar preferenceId e initPoint cuando MP responde correctamente', async () => {
      mockPreferenceCreate.mockResolvedValue({
        id: 'pref_abc123',
        init_point:
          'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_abc123',
      });

      const result = await service.createPreference(params);

      expect(result.preferenceId).toBe('pref_abc123');
      expect(result.initPoint).toContain('mercadopago.com.ar');
      expect(mockPreferenceCreate).toHaveBeenCalledTimes(1);
    });

    it('debe lanzar error si MP retorna preferencia sin id', async () => {
      mockPreferenceCreate.mockResolvedValue({ id: null, init_point: null });

      await expect(service.createPreference(params)).rejects.toThrow(
        'Mercado Pago devolvió una preferencia sin ID o init_point',
      );
    });

    it('debe incluir external_reference con el purchaseId en el body', async () => {
      mockPreferenceCreate.mockResolvedValue({
        id: 'pref_abc123',
        init_point:
          'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_abc123',
      });

      await service.createPreference(params);

      expect(mockPreferenceCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            external_reference: '42',
          }),
        }),
      );
    });
  });

  // ── getPayment ────────────────────────────────────────────────────────────

  describe('getPayment', () => {
    it('debe retornar el pago por ID numérico', async () => {
      const mockPayment = {
        id: 123456789,
        status: 'approved',
        external_reference: '10',
      };
      mockPaymentGet.mockResolvedValue(mockPayment);

      const result = await service.getPayment(123456789);

      expect(result).toEqual(mockPayment);
      expect(mockPaymentGet).toHaveBeenCalledWith({ id: 123456789 });
    });

    it('debe retornar el pago por ID string', async () => {
      const mockPayment = {
        id: 123456789,
        status: 'approved',
        external_reference: '10',
      };
      mockPaymentGet.mockResolvedValue(mockPayment);

      const result = await service.getPayment('123456789');

      expect(result).toEqual(mockPayment);
    });
  });

  // ── validateSignature ─────────────────────────────────────────────────────

  describe('validateSignature', () => {
    it('debe retornar true si no hay secret configurado en entorno de desarrollo', () => {
      const result = service.validateSignature(
        'ts=123456,v1=abc',
        'req-id-001',
        '123456789',
      );

      expect(result).toBe(true);
    });

    it('debe retornar false si no hay secret configurado en producción', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoService,
          {
            provide: ConfigService,
            useValue: buildConfigService({ NODE_ENV: 'production' }),
          },
        ],
      }).compile();

      const prodService = module.get(MercadoPagoService);

      const result = prodService.validateSignature(
        'ts=123456,v1=abc',
        'req-id-001',
        '123456789',
      );

      expect(result).toBe(false);
    });

    it('debe retornar false si la firma tiene formato inválido (falta ts o v1)', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoService,
          {
            provide: ConfigService,
            useValue: buildConfigService({ MP_WEBHOOK_SECRET: 'mysecret' }),
          },
        ],
      }).compile();

      const serviceWithSecret = module.get(MercadoPagoService);

      const result = serviceWithSecret.validateSignature(
        'malformed-signature',
        'req-id-001',
        '123456789',
      );

      expect(result).toBe(false);
    });

    it('debe retornar true con HMAC válido', async () => {
      const secret = 'mysecret';
      const paymentId = '999';
      const xRequestId = 'req-xyz';
      const ts = '1700000000';

      const signedTemplate = `id:${paymentId};request-id:${xRequestId};ts:${ts};`;
      const expectedHmac = crypto
        .createHmac('sha256', secret)
        .update(signedTemplate)
        .digest('hex');

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoService,
          {
            provide: ConfigService,
            useValue: buildConfigService({ MP_WEBHOOK_SECRET: secret }),
          },
        ],
      }).compile();

      const svc = module.get(MercadoPagoService);
      const result = svc.validateSignature(
        `ts=${ts},v1=${expectedHmac}`,
        xRequestId,
        paymentId,
      );

      expect(result).toBe(true);
    });

    it('debe retornar false cuando timingSafeEqual lanza error (buffers de distinto largo)', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoService,
          {
            provide: ConfigService,
            useValue: buildConfigService({ MP_WEBHOOK_SECRET: 'mysecret' }),
          },
        ],
      }).compile();

      const svc = module.get(MercadoPagoService);
      // 'zz' is not valid hex, Buffer.from('zz', 'hex') produces an empty buffer
      // causing timingSafeEqual to throw due to length mismatch
      const result = svc.validateSignature('ts=1234,v1=zz', 'req-1', '123');

      expect(result).toBe(false);
    });
  });

  // ── createPreapproval ─────────────────────────────────────────────────────

  describe('createPreapproval', () => {
    const params: CreatePreapprovalParams = {
      reason: 'Auguria Premium',
      autoRecurring: {
        frequency: 1,
        frequencyType: 'months',
        transactionAmount: 2999,
        currencyId: 'ARS',
      },
      payerEmail: 'user@test.com',
      externalReference: 'sub_42',
      backUrl: 'http://localhost:3001/premium/activacion',
      notificationUrl: 'http://localhost:3000/api/v1/webhooks/mercadopago',
    };

    it('debe retornar preapprovalId e initPoint cuando MP responde correctamente', async () => {
      mockPreApprovalCreate.mockResolvedValue({
        id: 'preapproval_abc123',
        init_point:
          'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=plan_test_123',
        status: 'pending',
      });

      const result = await service.createPreapproval(params);

      expect(result.preapprovalId).toBe('preapproval_abc123');
      expect(result.initPoint).toContain('mercadopago.com.ar');
      expect(mockPreApprovalCreate).toHaveBeenCalledTimes(1);
    });

    it('debe enviar el external_reference correcto al crear el preapproval', async () => {
      mockPreApprovalCreate.mockResolvedValue({
        id: 'preapproval_abc123',
        init_point: 'https://www.mercadopago.com.ar/subscriptions/checkout',
        status: 'pending',
      });

      await service.createPreapproval(params);

      expect(mockPreApprovalCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            reason: 'Auguria Premium',
            auto_recurring: expect.objectContaining({
              frequency: 1,
              frequency_type: 'months',
              transaction_amount: 2999,
              currency_id: 'ARS',
            }),
            payer_email: 'user@test.com',
            external_reference: 'sub_42',
            back_url: 'http://localhost:3001/premium/activacion',
            notification_url:
              'http://localhost:3000/api/v1/webhooks/mercadopago',
          }),
        }),
      );
    });

    it('debe lanzar error si MP retorna preapproval sin id', async () => {
      mockPreApprovalCreate.mockResolvedValue({ id: null, init_point: null });

      await expect(service.createPreapproval(params)).rejects.toThrow(
        'Mercado Pago devolvió un preapproval sin ID o init_point',
      );
    });

    it('debe propagar el error si la API de MP falla', async () => {
      mockPreApprovalCreate.mockRejectedValue(new Error('MP API timeout'));

      await expect(service.createPreapproval(params)).rejects.toThrow(
        'MP API timeout',
      );
    });
  });

  // ── getPreapproval ────────────────────────────────────────────────────────

  describe('getPreapproval', () => {
    it('debe retornar el preapproval por ID', async () => {
      const mockPreapproval = {
        id: 'preapproval_abc123',
        status: 'authorized',
        external_reference: 'sub_42',
        payer_email: 'user@test.com',
      };
      mockPreApprovalGet.mockResolvedValue(mockPreapproval);

      const result = await service.getPreapproval('preapproval_abc123');

      expect(result).toEqual(mockPreapproval);
      expect(mockPreApprovalGet).toHaveBeenCalledWith({
        id: 'preapproval_abc123',
      });
    });

    it('debe propagar el error si la API de MP falla', async () => {
      mockPreApprovalGet.mockRejectedValue(new Error('Not found'));

      await expect(service.getPreapproval('invalid_id')).rejects.toThrow(
        'Not found',
      );
    });
  });

  // ── cancelPreapproval ─────────────────────────────────────────────────────

  describe('cancelPreapproval', () => {
    it('debe cancelar el preapproval actualizando su status a "cancelled"', async () => {
      mockPreApprovalUpdate.mockResolvedValue({
        id: 'preapproval_abc123',
        status: 'cancelled',
      });

      await service.cancelPreapproval('preapproval_abc123');

      expect(mockPreApprovalUpdate).toHaveBeenCalledWith({
        id: 'preapproval_abc123',
        body: { status: 'cancelled' },
      });
    });

    it('debe propagar el error si la API de MP falla al cancelar', async () => {
      mockPreApprovalUpdate.mockRejectedValue(new Error('Cannot cancel'));

      await expect(
        service.cancelPreapproval('preapproval_abc123'),
      ).rejects.toThrow('Cannot cancel');
    });
  });
});
