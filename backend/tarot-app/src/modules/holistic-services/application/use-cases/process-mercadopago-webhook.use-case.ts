import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import {
  SERVICE_PURCHASE_REPOSITORY,
  IServicePurchaseRepository,
} from '../../domain/interfaces';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';
import { MercadoPagoService } from '../../infrastructure/services/mercadopago.service';
import { EmailService } from '../../../email/email.service';
import { ServicePurchase } from '../../entities/service-purchase.entity';

export interface MercadoPagoWebhookPayload {
  type: string;
  data: {
    id: string;
  };
}

export interface WebhookProcessResult {
  processed: boolean;
  message: string;
}

@Injectable()
export class ProcessMercadoPagoWebhookUseCase {
  private readonly logger = new Logger(ProcessMercadoPagoWebhookUseCase.name);

  constructor(
    @Inject(SERVICE_PURCHASE_REPOSITORY)
    private readonly servicePurchaseRepository: IServicePurchaseRepository,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    payload: MercadoPagoWebhookPayload,
    xSignature: string,
    xRequestId: string,
  ): Promise<WebhookProcessResult> {
    this.logger.log(
      `Webhook MP recibido — tipo: ${payload.type}, data.id: ${payload.data?.id}`,
    );

    // Only handle payment notifications
    if (payload.type !== 'payment') {
      this.logger.log(`Tipo de notificación ignorado: ${payload.type}`);
      return { processed: false, message: `Tipo ignorado: ${payload.type}` };
    }

    const paymentId = payload.data?.id;
    if (!paymentId) {
      this.logger.warn('Webhook MP sin data.id — ignorando');
      return { processed: false, message: 'Sin payment ID' };
    }

    // Validate signature (skipped if MP_WEBHOOK_SECRET not set)
    const isValidSignature = this.mercadoPagoService.validateSignature(
      xSignature,
      xRequestId,
      paymentId,
    );
    if (!isValidSignature) {
      this.logger.warn(`Firma inválida para payment ${paymentId} — rechazando`);
      return { processed: false, message: 'Firma inválida' };
    }

    // Fetch payment details from MP API
    let payment: PaymentResponse;
    try {
      payment = await this.mercadoPagoService.getPayment(paymentId);
    } catch (error) {
      this.logger.error(
        `Error al consultar pago ${paymentId} en MP`,
        error instanceof Error ? error.stack : String(error),
      );
      return { processed: false, message: 'Error consultando pago en MP' };
    }

    const paymentStatus: string | undefined = payment.status;
    const externalReference: string | undefined = payment.external_reference;

    this.logger.log(
      `Pago MP ${paymentId}: status=${paymentStatus}, external_reference=${externalReference}`,
    );

    if (!externalReference) {
      this.logger.warn(
        `Pago ${paymentId} sin external_reference — no se puede asociar a compra`,
      );
      return { processed: false, message: 'Sin external_reference' };
    }

    const purchaseId = parseInt(externalReference, 10);
    if (isNaN(purchaseId)) {
      this.logger.warn(`external_reference inválido: ${externalReference}`);
      return { processed: false, message: 'external_reference inválido' };
    }

    // Find the purchase
    const purchase =
      await this.servicePurchaseRepository.findByIdWithRelations(purchaseId);
    if (!purchase) {
      this.logger.warn(`Compra ${purchaseId} no encontrada`);
      return {
        processed: false,
        message: `Compra ${purchaseId} no encontrada`,
      };
    }

    // Idempotency: if already processed with this exact payment ID, skip
    if (
      purchase.mercadoPagoPaymentId === paymentId &&
      purchase.paymentStatus === PurchaseStatus.PAID
    ) {
      this.logger.log(
        `Compra ${purchaseId} ya fue procesada con payment ${paymentId} — ignorando duplicado`,
      );
      return { processed: false, message: 'Notificación duplicada' };
    }

    switch (paymentStatus) {
      case 'approved':
        return this.handleApproved(purchase, paymentId);
      case 'rejected':
        return this.handleRejected(purchase, paymentId);
      case 'pending':
      case 'in_process':
        this.logger.log(
          `Pago ${paymentId} en estado ${paymentStatus} — sin acción`,
        );
        return {
          processed: true,
          message: `Pago en estado ${paymentStatus}`,
        };
      default:
        this.logger.log(`Estado MP desconocido: ${paymentStatus}`);
        return {
          processed: false,
          message: `Estado desconocido: ${paymentStatus}`,
        };
    }
  }

  private async handleApproved(
    purchase: ServicePurchase,
    paymentId: string,
  ): Promise<WebhookProcessResult> {
    if (purchase.paymentStatus === PurchaseStatus.PAID) {
      this.logger.log(`Compra ${purchase.id} ya estaba PAID — ignorando`);
      return { processed: false, message: 'Compra ya estaba PAID' };
    }

    await this.servicePurchaseRepository.updateStatus(
      purchase.id,
      PurchaseStatus.PAID,
      {
        mercadoPagoPaymentId: paymentId,
        paidAt: new Date(),
      },
    );

    this.logger.log(
      `Compra ${purchase.id} marcada como PAID (payment: ${paymentId})`,
    );

    // Send confirmation email (non-blocking — failure must not break the flow)
    try {
      const user = purchase.user;
      const service = purchase.holisticService;
      if (user?.email && service) {
        const frontendUrl =
          this.configService.get<string>('FRONTEND_URL') ??
          'http://localhost:3001';
        const bookingUrl = `${frontendUrl}/servicios/reservar/${purchase.id}`;
        const rawWhatsapp = service.whatsappNumber ?? '';
        const whatsappNumberForLink = rawWhatsapp.replace(/\D/g, '');

        await this.emailService.sendHolisticServiceConfirmation(user.email, {
          userName: user.name ?? user.email,
          serviceName: service.name,
          amountArs: purchase.amountArs,
          whatsappNumber: rawWhatsapp,
          whatsappNumberForLink,
          bookingUrl,
        });
        this.logger.log(
          `Email de confirmación enviado a ${user.email} para compra ${purchase.id}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error al enviar email de confirmación para compra ${purchase.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      // Intentionally not re-throwing
    }

    return {
      processed: true,
      message: `Compra ${purchase.id} aprobada`,
    };
  }

  private async handleRejected(
    purchase: ServicePurchase,
    paymentId: string,
  ): Promise<WebhookProcessResult> {
    if (purchase.paymentStatus === PurchaseStatus.CANCELLED) {
      this.logger.log(`Compra ${purchase.id} ya estaba CANCELLED — ignorando`);
      return { processed: false, message: 'Compra ya estaba CANCELLED' };
    }

    await this.servicePurchaseRepository.updateStatus(
      purchase.id,
      PurchaseStatus.CANCELLED,
      {
        mercadoPagoPaymentId: paymentId,
      },
    );

    this.logger.log(
      `Compra ${purchase.id} marcada como CANCELLED por pago rechazado (payment: ${paymentId})`,
    );

    return {
      processed: true,
      message: `Compra ${purchase.id} cancelada por rechazo`,
    };
  }
}
