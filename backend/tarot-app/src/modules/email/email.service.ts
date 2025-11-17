import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import {
  SharedReadingData,
  PlanChangeData,
  QuotaWarningData,
  QuotaLimitReachedData,
} from './interfaces/email.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Envía un email con la lectura de tarot compartida
   */
  async sendSharedReading(
    to: string,
    readingData: SharedReadingData,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Tu lectura de Tarot',
        template: 'shared-reading',
        context: readingData,
      });

      this.logger.log(
        `Email de lectura compartida enviado exitosamente a ${to}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar email de lectura compartida a ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error('Error al enviar email de lectura compartida');
    }
  }

  /**
   * Envía email de bienvenida a nuevos usuarios
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Bienvenido a Tarot App',
        template: 'welcome',
        context: {
          userName,
          email: to,
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
      const resetUrl = `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      await this.mailerService.sendMail({
        to,
        subject: 'Recuperación de contraseña',
        template: 'password-reset',
        context: {
          userName,
          resetToken,
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
        subject: '⚠️ Has usado el 80% de tu cuota mensual de IA',
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
          '🚫 Has alcanzado tu límite mensual de interpretaciones con IA',
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
}
