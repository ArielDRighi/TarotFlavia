import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import {
  PlanChangeData,
  QuotaWarningData,
  QuotaLimitReachedData,
  ProviderCostWarningData,
  ProviderCostLimitReachedData,
  HolisticServiceConfirmationData,
  ContactMessageData,
} from './interfaces/email.interface';

/**
 * Último recurso del buzón de contacto, para el dev local sin SMTP: coincide con el
 * `from` de `mailer.config.ts` en modo jsonTransport, donde el mail se loguea y no sale.
 * En producción nunca se usa: `CONTACT_EMAIL_TO` es obligatoria y el boot falla sin ella.
 */
const CONTACT_RECIPIENT_FALLBACK = 'noreply@example.com';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Envía email de bienvenida a nuevos usuarios
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Bienvenida a Auguria',
        template: 'welcome',
        context: {
          userName,
          email: to,
          frontendUrl: this.configService.getOrThrow<string>('FRONTEND_URL'),
        },
      });

      this.logger.log(`Email de bienvenida enviado exitosamente a ${to}`);
    } catch (error) {
      this.logger.error(
        `Error al enviar email de bienvenida a ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error('Error al enviar email de bienvenida');
    }
  }

  /**
   * Envía email para recuperación de contraseña
   */
  async sendPasswordResetEmail(
    to: string,
    userName: string,
    resetToken: string,
  ): Promise<void> {
    try {
      const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
      const resetUrl = `${frontendUrl}/restablecer-password?token=${resetToken}`;

      await this.mailerService.sendMail({
        to,
        subject: 'Recuperación de contraseña',
        template: 'password-reset',
        context: {
          userName,
          resetUrl,
        },
      });

      this.logger.log(
        `Email de recuperación de contraseña enviado exitosamente a ${to}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar email de recuperación de contraseña a ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error('Error al enviar email de recuperación de contraseña');
    }
  }

  /**
   * Envía notificación de cambio de plan
   */
  async sendPlanChangeEmail(
    to: string,
    planData: PlanChangeData,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Cambio de plan confirmado',
        template: 'plan-change',
        context: planData,
      });

      this.logger.log(`Email de cambio de plan enviado exitosamente a ${to}`);
    } catch (error) {
      this.logger.error(
        `Error al enviar email de cambio de plan a ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error('Error al enviar email de cambio de plan');
    }
  }

  /**
   * Envía advertencia de cuota de IA al 80%
   */
  async sendQuotaWarningEmail(
    to: string,
    quotaData: QuotaWarningData,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject:
          '⚠️ Has usado el 80% de tu cuota mensual de interpretaciones personalizadas',
        template: 'quota-warning-80',
        context: quotaData,
      });

      this.logger.log(
        `Email de advertencia de cuota (80%) enviado exitosamente a ${to}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar email de advertencia de cuota a ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error('Error al enviar email de advertencia de cuota');
    }
  }

  /**
   * Envía notificación de cuota de IA alcanzada (100%)
   */
  async sendQuotaLimitReachedEmail(
    to: string,
    quotaData: QuotaLimitReachedData,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject:
          '🚫 Has alcanzado tu límite mensual de interpretaciones personalizadas',
        template: 'quota-limit-reached',
        context: quotaData,
      });

      this.logger.log(
        `Email de límite de cuota alcanzado enviado exitosamente a ${to}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar email de límite de cuota a ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error('Error al enviar email de límite de cuota');
    }
  }

  /**
   * URL del panel de consumo de los proveedores, para los avisos de costo al admin
   */
  private buildAiUsageAdminUrl(): string {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    return `${frontendUrl}/admin/ai-usage`;
  }

  /**
   * Envía advertencia de costo de proveedor al 80%
   */
  async sendProviderCostWarningEmail(
    to: string,
    costData: ProviderCostWarningData,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: `⚠️ Alerta de costo: ${costData.provider} al 80% del límite mensual`,
        template: 'provider-cost-warning',
        context: {
          provider: costData.provider,
          // El servicio pasa números crudos (ej. 82.34567): sin formatear quedan ilegibles
          currentCost: costData.currentCost.toFixed(2),
          monthlyLimit: costData.monthlyLimit.toFixed(2),
          percentageUsed: costData.percentageUsed.toFixed(1),
          adminUrl: this.buildAiUsageAdminUrl(),
        },
      });

      this.logger.log(
        `Email de advertencia de costo de ${costData.provider} enviado exitosamente a ${to}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar email de advertencia de costo a ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      // Don't throw, just log (email is not critical)
    }
  }

  /**
   * Envía notificación de límite de costo de proveedor alcanzado (100%)
   */
  async sendProviderCostLimitReachedEmail(
    to: string,
    costData: ProviderCostLimitReachedData,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: `🚨 Alerta de costo: LÍMITE ALCANZADO en ${costData.provider}`,
        template: 'provider-cost-limit-reached',
        context: {
          provider: costData.provider,
          currentCost: costData.currentCost.toFixed(2),
          monthlyLimit: costData.monthlyLimit.toFixed(2),
          adminUrl: this.buildAiUsageAdminUrl(),
        },
      });

      this.logger.log(
        `Email de límite de costo de ${costData.provider} alcanzado enviado exitosamente a ${to}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar email de límite de costo a ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      // Don't throw, just log (email is not critical)
    }
  }

  /**
   * Envía email de confirmación de pago aprobado para servicio holístico
   */
  async sendHolisticServiceConfirmation(
    to: string,
    data: HolisticServiceConfirmationData,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: `Pago confirmado: ${data.serviceName}`,
        template: 'holistic-service-confirmation',
        context: data,
      });

      this.logger.log(
        `Email de confirmación de servicio holístico enviado exitosamente a ${to}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar email de confirmación de servicio holístico a ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      // No relanzar — el pago ya fue aprobado, el email es no crítico
    }
  }

  /**
   * Buzón que recibe los mensajes del formulario de contacto.
   *
   * En producción es `CONTACT_EMAIL_TO` y punto: el boot falla si no está (T-PROD-014).
   * Los fallbacks son para dev/staging, donde el mailer corre en jsonTransport.
   */
  private resolveContactRecipient(): string {
    return (
      this.configService.get<string>('CONTACT_EMAIL_TO') ??
      this.configService.get<string>('EMAIL_REPLY_TO') ??
      this.configService.get<string>('EMAIL_FROM') ??
      CONTACT_RECIPIENT_FALLBACK
    );
  }

  /**
   * Envía al buzón de contacto un mensaje del formulario público.
   *
   * El `replyTo` es el email del visitante y **pisa** el default global del mailer
   * (`EMAIL_REPLY_TO`, que apunta al propio buzón de Auguria): sin él, responder el
   * mensaje sería responderse a sí misma en vez de contestarle al cliente.
   *
   * Relanza si el envío falla — a diferencia de las alertas de costo, acá el usuario
   * tiene que enterarse: tragarse el error es justamente el bug que arregla T-PROD-014.
   */
  async sendContactMessageEmail(data: ContactMessageData): Promise<void> {
    const to = this.resolveContactRecipient();

    try {
      await this.mailerService.sendMail({
        to,
        replyTo: data.email,
        subject: `Contacto web: ${data.subject}`,
        template: 'contact-message',
        context: {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
        },
      });

      this.logger.log(
        `Mensaje de contacto enviado exitosamente a ${to} (de ${data.email})`,
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar el mensaje de contacto de ${data.email} a ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error('Error al enviar el mensaje de contacto');
    }
  }
}
