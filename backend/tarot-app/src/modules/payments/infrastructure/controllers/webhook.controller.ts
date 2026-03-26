import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Optional,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HolisticServicesOrchestratorService } from '../../../holistic-services/application/orchestrators/holistic-services-orchestrator.service';
import {
  MercadoPagoWebhookPayload,
  WebhookProcessResult,
} from '../../../holistic-services/application/use-cases/process-mercadopago-webhook.use-case';
import {
  SUBSCRIPTION_WEBHOOK_USE_CASE,
  ISubscriptionWebhookUseCase,
} from '../../tokens/payment.tokens';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly holisticOrchestrator: HolisticServicesOrchestratorService,
    @Optional()
    @Inject(SUBSCRIPTION_WEBHOOK_USE_CASE)
    private readonly subscriptionWebhookUseCase: ISubscriptionWebhookUseCase | null,
  ) {}

  @Post('mercadopago')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recibir notificaciones de pago de Mercado Pago' })
  @ApiResponse({
    status: 200,
    description: 'Notificación recibida y procesada',
  })
  async handleMercadoPagoWebhook(
    @Body() payload: MercadoPagoWebhookPayload,
    @Headers('x-signature') xSignature: string = '',
    @Headers('x-request-id') xRequestId: string = '',
  ): Promise<WebhookProcessResult> {
    this.logger.log(
      `Webhook MP recibido — tipo: ${payload?.type}, x-request-id: ${xRequestId}`,
    );

    // Routing por tipo de notificación
    if (payload?.type === 'subscription_preapproval') {
      return this.handleSubscriptionWebhook(payload, xSignature, xRequestId);
    }

    if (payload?.type === 'payment') {
      // Si el external_reference tiene prefijo sub_, es un cobro recurrente de suscripción
      const externalRef = payload.externalReference ?? '';
      if (externalRef.startsWith('sub_')) {
        return this.handleSubscriptionWebhook(payload, xSignature, xRequestId);
      }

      // Pago de servicio holístico (external_reference numérico) → holistic-services
      return this.holisticOrchestrator.processWebhook(
        payload,
        xSignature,
        xRequestId,
      );
    }

    // Otros tipos de notificación → ignorar
    this.logger.log(`Tipo de notificación ignorado: ${payload?.type}`);
    return {
      processed: false,
      message: `Tipo ignorado: ${payload?.type}`,
    };
  }

  private handleSubscriptionWebhook(
    payload: MercadoPagoWebhookPayload,
    xSignature: string,
    xRequestId: string,
  ): Promise<WebhookProcessResult> {
    if (this.subscriptionWebhookUseCase) {
      return this.subscriptionWebhookUseCase.execute(
        payload,
        xSignature,
        xRequestId,
      );
    }

    // Stub: use case de suscripciones aún no implementado (se conecta en T-INT-02)
    this.logger.warn(
      `[STUB] Webhook de suscripción recibido (tipo: ${payload?.type}) — ProcessSubscriptionWebhookUseCase no implementado aún`,
    );
    return Promise.resolve({
      processed: false,
      message: 'Suscripción webhook — not implemented yet',
    });
  }
}
