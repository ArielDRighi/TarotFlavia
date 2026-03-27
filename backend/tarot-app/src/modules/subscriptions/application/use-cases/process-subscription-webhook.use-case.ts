import { Injectable, Inject, Logger } from '@nestjs/common';
import type { PreApprovalResponse } from 'mercadopago/dist/clients/preApproval/commonTypes';
import { MercadoPagoService } from '../../../payments/infrastructure/services/mercadopago.service';
import {
  MercadoPagoWebhookPayload,
  WebhookProcessResult,
} from '../../../holistic-services/application/use-cases/process-mercadopago-webhook.use-case';
import { IUserRepository } from '../../../users/domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/repository.tokens';
import {
  User,
  UserPlan,
  SubscriptionStatus,
} from '../../../users/entities/user.entity';

@Injectable()
export class ProcessSubscriptionWebhookUseCase {
  private readonly logger = new Logger(ProcessSubscriptionWebhookUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  async execute(
    payload: MercadoPagoWebhookPayload,
    xSignature: string,
    xRequestId: string,
  ): Promise<WebhookProcessResult> {
    this.logger.log(
      `Webhook de suscripción recibido — tipo: ${payload?.type}, data.id: ${payload?.data?.id}`,
    );

    // Validar firma
    const isValidSignature = this.mercadoPagoService.validateSignature(
      xSignature,
      xRequestId,
      payload?.data?.id ?? '',
    );
    if (!isValidSignature) {
      this.logger.warn(
        `Firma inválida para webhook de suscripción — rechazando`,
      );
      return { processed: false, message: 'Firma inválida' };
    }

    if (payload?.type === 'subscription_preapproval') {
      return this.handlePreapprovalWebhook(payload);
    }

    if (payload?.type === 'payment') {
      return this.handleSubscriptionPaymentWebhook(payload);
    }

    this.logger.log(`Tipo de notificación ignorado: ${payload?.type}`);
    return {
      processed: false,
      message: `Tipo ignorado: ${payload?.type}`,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers privados
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Procesa webhooks de tipo subscription_preapproval:
   * - authorized → activa plan premium
   * - cancelled → marca subscriptionStatus=cancelled (plan sigue premium)
   * - paused → log warning, sin cambio de estado
   */
  private async handlePreapprovalWebhook(
    payload: MercadoPagoWebhookPayload,
  ): Promise<WebhookProcessResult> {
    const preapprovalId = payload.data?.id;

    let preapproval: PreApprovalResponse;
    try {
      preapproval = await this.mercadoPagoService.getPreapproval(preapprovalId);
    } catch (error) {
      this.logger.error(
        `Error al consultar preapproval ${preapprovalId} en MP`,
        error instanceof Error ? error.stack : String(error),
      );
      return {
        processed: false,
        message: `Error al consultar preapproval en MP`,
      };
    }

    const externalReference = preapproval.external_reference;
    const userId = this.parseUserId(externalReference);
    if (userId === null) {
      this.logger.warn(
        `external_reference inválido o ausente: "${externalReference}"`,
      );
      return {
        processed: false,
        message: `external_reference inválido: "${externalReference}"`,
      };
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      this.logger.warn(
        `Usuario no encontrado para external_reference: ${externalReference}`,
      );
      return { processed: false, message: 'Usuario no encontrado' };
    }

    const status = preapproval.status;
    this.logger.log(
      `Preapproval ${preapprovalId}: status=${status}, userId=${userId}`,
    );

    switch (status) {
      case 'authorized':
        return this.activatePremium(user, preapproval, preapprovalId);
      case 'cancelled':
        return this.cancelSubscription(user, preapprovalId);
      case 'paused':
        this.logger.warn(
          `Preapproval ${preapprovalId} en estado paused — MP reintenta automáticamente`,
        );
        return {
          processed: false,
          message: `Suscripción en estado paused — sin cambio`,
        };
      default:
        this.logger.log(
          `Estado de preapproval desconocido: ${status} — ignorando`,
        );
        return {
          processed: false,
          message: `Estado desconocido: ${status}`,
        };
    }
  }

  /**
   * Activa el plan premium del usuario.
   * Idempotente: si ya está ACTIVE+PREMIUM no hace nada.
   */
  private async activatePremium(
    user: User,
    preapproval: PreApprovalResponse,
    preapprovalId: string,
  ): Promise<WebhookProcessResult> {
    // Idempotencia: si ya está activo y premium, ignorar
    if (
      user.plan === UserPlan.PREMIUM &&
      user.subscriptionStatus === SubscriptionStatus.ACTIVE
    ) {
      this.logger.log(
        `Usuario ${user.id} ya tiene plan premium activo — notificación duplicada`,
      );
      return { processed: false, message: 'Notificación duplicada' };
    }

    user.plan = UserPlan.PREMIUM;
    user.subscriptionStatus = SubscriptionStatus.ACTIVE;
    user.planStartedAt = new Date();
    user.mpPreapprovalId = preapprovalId;

    if (preapproval.next_payment_date) {
      user.planExpiresAt = new Date(preapproval.next_payment_date);
    }

    await this.userRepo.save(user);
    this.logger.log(
      `Usuario ${user.id} activado como PREMIUM (preapproval: ${preapprovalId})`,
    );

    return {
      processed: true,
      message: `Usuario ${user.id} activado como premium`,
    };
  }

  /**
   * Cancela la suscripción del usuario.
   * El plan premium sigue activo hasta planExpiresAt.
   * Idempotente: si ya está CANCELLED no hace nada.
   */
  private async cancelSubscription(
    user: User,
    preapprovalId: string,
  ): Promise<WebhookProcessResult> {
    // Idempotencia: si ya está cancelado, ignorar
    if (user.subscriptionStatus === SubscriptionStatus.CANCELLED) {
      this.logger.log(
        `Usuario ${user.id} ya tiene suscripción cancelada — notificación duplicada`,
      );
      return { processed: false, message: 'Notificación duplicada' };
    }

    user.subscriptionStatus = SubscriptionStatus.CANCELLED;
    // plan permanece PREMIUM hasta planExpiresAt (el CRON lo degradará)

    await this.userRepo.save(user);
    this.logger.log(
      `Suscripción del usuario ${user.id} cancelada (preapproval: ${preapprovalId}). Plan premium activo hasta ${user.planExpiresAt?.toISOString() ?? 'sin fecha'}`,
    );

    return {
      processed: true,
      message: `Suscripción del usuario ${user.id} cancelada`,
    };
  }

  /**
   * Procesa webhooks de tipo payment con external_reference=sub_XXX (cobros recurrentes).
   * - approved → actualiza planExpiresAt con next_payment_date del preapproval
   * - rejected → log warning (MP maneja reintentos)
   */
  private async handleSubscriptionPaymentWebhook(
    payload: MercadoPagoWebhookPayload,
  ): Promise<WebhookProcessResult> {
    const paymentId = payload.data?.id;

    let paymentStatus: string | undefined;
    let paymentExternalRef: string | undefined;

    try {
      const payment = await this.mercadoPagoService.getPayment(paymentId);
      paymentStatus = payment.status;
      paymentExternalRef = payment.external_reference ?? undefined;
    } catch (error) {
      this.logger.error(
        `Error al consultar pago de suscripción ${paymentId} en MP`,
        error instanceof Error ? error.stack : String(error),
      );
      return {
        processed: false,
        message: `Error al consultar pago de suscripción en MP`,
      };
    }

    // Usar external_reference del payload si la API de MP no lo retornó
    const externalRef =
      paymentExternalRef ?? payload.externalReference ?? undefined;
    const userId = this.parseUserId(externalRef);
    if (userId === null) {
      this.logger.warn(
        `external_reference inválido o ausente en payment: "${externalRef}"`,
      );
      return {
        processed: false,
        message: `external_reference inválido: "${externalRef}"`,
      };
    }

    this.logger.log(
      `Cobro recurrente ${paymentId}: status=${paymentStatus}, userId=${userId}`,
    );

    if (paymentStatus === 'rejected') {
      this.logger.warn(
        `Cobro recurrente ${paymentId} rechazado para usuario ${userId} — MP reintenta automáticamente`,
      );
      return {
        processed: false,
        message: `Cobro recurrente rechazado — sin cambio de plan`,
      };
    }

    if (paymentStatus !== 'approved') {
      this.logger.log(
        `Estado de cobro recurrente ${paymentStatus} — ignorando`,
      );
      return {
        processed: false,
        message: `Estado de pago ${paymentStatus} — sin cambio`,
      };
    }

    // status === 'approved': actualizar planExpiresAt
    const user = await this.userRepo.findById(userId);
    if (!user) {
      this.logger.warn(
        `Usuario no encontrado para cobro recurrente: userId=${userId}`,
      );
      return { processed: false, message: 'Usuario no encontrado' };
    }

    // Obtener next_payment_date del preapproval vigente
    if (user.mpPreapprovalId) {
      try {
        const preapproval = await this.mercadoPagoService.getPreapproval(
          user.mpPreapprovalId,
        );
        if (preapproval.next_payment_date) {
          user.planExpiresAt = new Date(preapproval.next_payment_date);
          await this.userRepo.save(user);
          this.logger.log(
            `planExpiresAt actualizado para usuario ${userId}: ${preapproval.next_payment_date}`,
          );
          return {
            processed: true,
            message: `planExpiresAt actualizado para usuario ${userId}`,
          };
        }
      } catch (error) {
        this.logger.error(
          `Error al obtener preapproval ${user.mpPreapprovalId} para actualizar planExpiresAt`,
          error instanceof Error ? error.stack : String(error),
        );
        return {
          processed: false,
          message: `Error al obtener preapproval para actualizar planExpiresAt`,
        };
      }
    }

    this.logger.log(
      `Cobro recurrente aprobado para usuario ${userId} — sin mpPreapprovalId o sin next_payment_date`,
    );
    return {
      processed: true,
      message: `Cobro recurrente aprobado para usuario ${userId}`,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utilidades
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Parsea el userId desde un external_reference con formato "sub_{userId}".
   * Retorna null si el formato es inválido o ausente.
   */
  private parseUserId(
    externalReference: string | undefined | null,
  ): number | null {
    if (!externalReference || !externalReference.startsWith('sub_')) {
      return null;
    }
    const userIdStr = externalReference.slice('sub_'.length);
    const userId = parseInt(userIdStr, 10);
    return isNaN(userId) ? null : userId;
  }
}
