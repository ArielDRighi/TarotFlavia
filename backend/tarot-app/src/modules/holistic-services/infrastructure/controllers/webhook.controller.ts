import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HolisticServicesOrchestratorService } from '../../application/orchestrators/holistic-services-orchestrator.service';
import {
  MercadoPagoWebhookPayload,
  WebhookProcessResult,
} from '../../application/use-cases/process-mercadopago-webhook.use-case';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly orchestrator: HolisticServicesOrchestratorService,
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
    return this.orchestrator.processWebhook(payload, xSignature, xRequestId);
  }
}
