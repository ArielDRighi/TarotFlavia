import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { HolisticServicesOrchestratorService } from '../../application/orchestrators/holistic-services-orchestrator.service';
import { MercadoPagoWebhookPayload } from '../../application/use-cases/process-mercadopago-webhook.use-case';

describe('WebhookController', () => {
  let controller: WebhookController;
  let mockOrchestrator: jest.Mocked<
    Pick<HolisticServicesOrchestratorService, 'processWebhook'>
  >;

  beforeEach(async () => {
    mockOrchestrator = {
      processWebhook: jest.fn().mockResolvedValue({
        processed: true,
        message: 'Compra 10 aprobada',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: HolisticServicesOrchestratorService,
          useValue: mockOrchestrator,
        },
      ],
    }).compile();

    controller = module.get(WebhookController);
  });

  afterEach(() => jest.clearAllMocks());

  it('debe delegar al orquestador y retornar el resultado', async () => {
    const payload: MercadoPagoWebhookPayload = {
      type: 'payment',
      data: { id: '123456789' },
    };

    const result = await controller.handleMercadoPagoWebhook(
      payload,
      'ts=1234,v1=abc',
      'req-id-001',
    );

    expect(mockOrchestrator.processWebhook).toHaveBeenCalledWith(
      payload,
      'ts=1234,v1=abc',
      'req-id-001',
    );
    expect(result.processed).toBe(true);
  });

  it('debe manejar headers vacíos sin lanzar errores', async () => {
    const payload: MercadoPagoWebhookPayload = {
      type: 'payment',
      data: { id: '111' },
    };

    mockOrchestrator.processWebhook.mockResolvedValue({
      processed: false,
      message: 'Firma inválida',
    });

    const result = await controller.handleMercadoPagoWebhook(payload, '', '');

    expect(result.processed).toBe(false);
  });
});
