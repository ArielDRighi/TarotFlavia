import type { WebhookProcessResult } from '../../holistic-services/application/use-cases/process-mercadopago-webhook.use-case';
import type { MercadoPagoWebhookPayload } from '../../holistic-services/application/use-cases/process-mercadopago-webhook.use-case';

/**
 * Token de inyección para el use case que procesa webhooks de suscripción.
 * Se usará en T-INT-02 cuando ProcessSubscriptionWebhookUseCase esté implementado.
 * Por ahora se inyecta un stub placeholder.
 */
export const SUBSCRIPTION_WEBHOOK_USE_CASE = 'SUBSCRIPTION_WEBHOOK_USE_CASE';

/**
 * Interfaz del use case de webhooks de suscripción.
 * El stub y la implementación real deben cumplir este contrato.
 */
export interface ISubscriptionWebhookUseCase {
  execute(
    payload: MercadoPagoWebhookPayload,
    xSignature: string,
    xRequestId: string,
  ): Promise<WebhookProcessResult>;
}
