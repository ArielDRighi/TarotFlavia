import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import {
  SharedReadingData,
  PlanChangeData,
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
}
