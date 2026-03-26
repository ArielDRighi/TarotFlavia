import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { HolisticServicesOrchestratorService } from '../../../holistic-services/application/orchestrators/holistic-services-orchestrator.service';
import {
  MercadoPagoWebhookPayload,
  WebhookProcessResult,
} from '../../../holistic-services/application/use-cases/process-mercadopago-webhook.use-case';
import {
  SUBSCRIPTION_WEBHOOK_USE_CASE,
  ISubscriptionWebhookUseCase,
} from '../../tokens/payment.tokens';

describe('WebhookController (payments module)', () => {
  let controller: WebhookController;
  let mockHolisticOrchestrator: jest.Mocked<
    Pick<HolisticServicesOrchestratorService, 'processWebhook'>
  >;
  let mockSubscriptionWebhookUseCase: jest.Mocked<ISubscriptionWebhookUseCase>;

  beforeEach(async () => {
    mockHolisticOrchestrator = {
      processWebhook: jest.fn().mockResolvedValue({
        processed: true,
        message: 'Compra 10 aprobada',
      } satisfies WebhookProcessResult),
    };

    mockSubscriptionWebhookUseCase = {
      execute: jest.fn().mockResolvedValue({
        processed: true,
        message: 'Suscripción procesada (stub)',
      } satisfies WebhookProcessResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: HolisticServicesOrchestratorService,
          useValue: mockHolisticOrchestrator,
        },
        {
          provide: SUBSCRIPTION_WEBHOOK_USE_CASE,
          useValue: mockSubscriptionWebhookUseCase,
        },
      ],
    }).compile();

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    controller = module.get(WebhookController);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('type: "payment" (pago de servicio holístico — external_reference numérico)', () => {
    it('debe delegar al orchestrator de holistic-services y retornar el resultado', async () => {
      const payload: MercadoPagoWebhookPayload = {
        type: 'payment',
        data: { id: '123456789' },
      };

      const result = await controller.handleMercadoPagoWebhook(
        payload,
        'ts=1234,v1=abc',
        'req-id-001',
      );

      expect(mockHolisticOrchestrator.processWebhook).toHaveBeenCalledWith(
        payload,
        'ts=1234,v1=abc',
        'req-id-001',
      );
      expect(mockSubscriptionWebhookUseCase.execute).not.toHaveBeenCalled();
      expect(result.processed).toBe(true);
      expect(result.message).toBe('Compra 10 aprobada');
    });

    it('debe manejar headers vacíos sin lanzar errores', async () => {
      const payload: MercadoPagoWebhookPayload = {
        type: 'payment',
        data: { id: '111' },
      };

      mockHolisticOrchestrator.processWebhook.mockResolvedValue({
        processed: false,
        message: 'Firma inválida',
      });

      const result = await controller.handleMercadoPagoWebhook(payload, '', '');

      expect(result.processed).toBe(false);
      expect(mockHolisticOrchestrator.processWebhook).toHaveBeenCalledTimes(1);
    });
  });

  describe('type: "payment" con external_reference sub_ (cobro recurrente)', () => {
    it('debe delegar al use case de suscripciones cuando el payload indica external_reference sub_', async () => {
      const payload: MercadoPagoWebhookPayload = {
        type: 'payment',
        data: { id: '999' },
        externalReference: 'sub_42',
      };

      const result = await controller.handleMercadoPagoWebhook(
        payload,
        'ts=5678,v1=xyz',
        'req-id-002',
      );

      expect(mockSubscriptionWebhookUseCase.execute).toHaveBeenCalledWith(
        payload,
        'ts=5678,v1=xyz',
        'req-id-002',
      );
      expect(mockHolisticOrchestrator.processWebhook).not.toHaveBeenCalled();
      expect(result.processed).toBe(true);
    });

    it('debe delegar al use case de suscripciones para sub_1', async () => {
      const payload: MercadoPagoWebhookPayload = {
        type: 'payment',
        data: { id: '777' },
        externalReference: 'sub_1',
      };

      await controller.handleMercadoPagoWebhook(payload, '', '');

      expect(mockSubscriptionWebhookUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockHolisticOrchestrator.processWebhook).not.toHaveBeenCalled();
    });
  });

  describe('type: "subscription_preapproval"', () => {
    it('debe delegar al use case de suscripciones', async () => {
      const payload: MercadoPagoWebhookPayload = {
        type: 'subscription_preapproval',
        data: { id: 'preapproval-abc-123' },
      };

      const result = await controller.handleMercadoPagoWebhook(
        payload,
        'ts=9999,v1=sig',
        'req-id-003',
      );

      expect(mockSubscriptionWebhookUseCase.execute).toHaveBeenCalledWith(
        payload,
        'ts=9999,v1=sig',
        'req-id-003',
      );
      expect(mockHolisticOrchestrator.processWebhook).not.toHaveBeenCalled();
      expect(result.processed).toBe(true);
    });
  });

  describe('tipo desconocido', () => {
    it('debe ignorar el webhook con 200 OK y processed: false', async () => {
      const payload: MercadoPagoWebhookPayload = {
        type: 'unknown_event',
        data: { id: '000' },
      };

      const result = await controller.handleMercadoPagoWebhook(payload, '', '');

      expect(mockHolisticOrchestrator.processWebhook).not.toHaveBeenCalled();
      expect(mockSubscriptionWebhookUseCase.execute).not.toHaveBeenCalled();
      expect(result.processed).toBe(false);
      expect(result.message).toContain('unknown_event');
    });

    it('debe ignorar el webhook de tipo "merchant_order" con 200 OK', async () => {
      const payload: MercadoPagoWebhookPayload = {
        type: 'merchant_order',
        data: { id: '555' },
      };

      const result = await controller.handleMercadoPagoWebhook(payload, '', '');

      expect(result.processed).toBe(false);
      expect(mockHolisticOrchestrator.processWebhook).not.toHaveBeenCalled();
    });
  });

  describe('endpoint URL', () => {
    it('debe exponer el controller bajo la ruta "webhooks"', () => {
      const controllerPath = Reflect.getMetadata(
        'path',
        WebhookController,
      ) as string;
      expect(controllerPath).toBe('webhooks');
    });
  });

  describe('stub — sin use case de suscripciones inyectado', () => {
    let controllerWithoutUseCase: WebhookController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [WebhookController],
        providers: [
          {
            provide: HolisticServicesOrchestratorService,
            useValue: mockHolisticOrchestrator,
          },
          // SUBSCRIPTION_WEBHOOK_USE_CASE NO se provee → @Optional() → null
        ],
      }).compile();

      jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

      controllerWithoutUseCase = module.get(WebhookController);
    });

    it('debe retornar processed: false con mensaje de stub cuando no hay use case inyectado', async () => {
      const payload: MercadoPagoWebhookPayload = {
        type: 'subscription_preapproval',
        data: { id: 'preapproval-xyz' },
      };

      const result = await controllerWithoutUseCase.handleMercadoPagoWebhook(
        payload,
        '',
        '',
      );

      expect(result.processed).toBe(false);
      expect(result.message).toContain('not implemented yet');
    });

    it('debe retornar stub cuando type payment tiene external_reference sub_ y no hay use case', async () => {
      const payload: MercadoPagoWebhookPayload = {
        type: 'payment',
        data: { id: '888' },
        externalReference: 'sub_99',
      };

      const result = await controllerWithoutUseCase.handleMercadoPagoWebhook(
        payload,
        '',
        '',
      );

      expect(result.processed).toBe(false);
      expect(result.message).toContain('not implemented yet');
    });
  });
});
