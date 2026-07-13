import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { Logger } from '@nestjs/common';
import {
  WelcomeEmailData,
  PlanChangeData,
  ProviderCostWarningData,
  ProviderCostLimitReachedData,
  ContactMessageData,
} from './interfaces/email.interface';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;

  const mockSendMail = jest.fn();
  const mockMailerService = {
    sendMail: mockSendMail,
  };

  /** Variables que un test puede pisar (o borrar, con `undefined`) para ese caso. */
  let configOverrides: Record<string, string | undefined> = {};

  const mockConfigGet = jest.fn((key: string) => {
    const config: Record<string, string | number | undefined> = {
      EMAIL_FROM: 'noreply@tarot.com',
      SMTP_HOST: 'smtp.test.com',
      SMTP_PORT: 587,
      FRONTEND_URL: 'http://localhost:3000',
      ...configOverrides,
    };
    return config[key];
  });

  const mockConfigService = {
    get: mockConfigGet,
    getOrThrow: mockConfigGet,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);

    // Clear all mocks before each test
    jest.clearAllMocks();
    configOverrides = {};
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      const to = 'newuser@example.com';
      const data: WelcomeEmailData = {
        userName: 'Jane Smith',
        email: to,
      };

      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendWelcomeEmail(to, data.userName);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to,
        subject: 'Bienvenida a Auguria',
        template: 'welcome',
        context: {
          userName: data.userName,
          email: to,
          frontendUrl: 'http://localhost:3000',
        },
      });
    });

    it('should handle errors when sending welcome email', async () => {
      const to = 'newuser@example.com';
      const userName = 'Jane Smith';

      const error = new Error('SMTP Error');
      mockMailerService.sendMail.mockRejectedValue(error);

      await expect(service.sendWelcomeEmail(to, userName)).rejects.toThrow(
        'Error al enviar email de bienvenida',
      );
    });

    it('should log success when welcome email is sent', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      const to = 'newuser@example.com';
      const userName = 'Jane Smith';

      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendWelcomeEmail(to, userName);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Email de bienvenida enviado exitosamente'),
      );

      loggerSpy.mockRestore();
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const to = 'user@example.com';
      const userName = 'John Doe';
      const resetToken = 'abc123xyz';

      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendPasswordResetEmail(to, userName, resetToken);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to,
        subject: 'Recuperación de contraseña',
        template: 'password-reset',
        context: {
          userName,
          resetUrl: `http://localhost:3000/restablecer-password?token=${resetToken}`,
        },
      });
    });

    it('should handle errors when sending password reset email', async () => {
      const to = 'user@example.com';
      const userName = 'John Doe';
      const resetToken = 'abc123xyz';

      const error = new Error('SMTP Error');
      mockMailerService.sendMail.mockRejectedValue(error);

      await expect(
        service.sendPasswordResetEmail(to, userName, resetToken),
      ).rejects.toThrow('Error al enviar email de recuperación de contraseña');
    });

    it('should log success when password reset email is sent', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      const to = 'user@example.com';
      const userName = 'John Doe';
      const resetToken = 'abc123xyz';

      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendPasswordResetEmail(to, userName, resetToken);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Email de recuperación de contraseña enviado exitosamente',
        ),
      );

      loggerSpy.mockRestore();
    });
  });

  describe('sendProviderCostWarningEmail', () => {
    const costData: ProviderCostWarningData = {
      provider: 'groq',
      currentCost: 8.23456,
      monthlyLimit: 10,
      percentageUsed: 82.3456,
    };

    it('should send the 80% cost warning with readable numbers', async () => {
      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendProviderCostWarningEmail('admin@example.com', costData);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'admin@example.com',
        subject: '⚠️ Alerta de costo: groq al 80% del límite mensual',
        template: 'provider-cost-warning',
        context: {
          provider: 'groq',
          currentCost: '8.23',
          monthlyLimit: '10.00',
          percentageUsed: '82.3',
          adminUrl: 'http://localhost:3000/admin/ai-usage',
        },
      });
    });

    it('should not throw when the alert cannot be sent', async () => {
      mockMailerService.sendMail.mockRejectedValue(new Error('SMTP Error'));

      // La alerta es informativa: si falla, no debe romper el flujo que la dispara
      await expect(
        service.sendProviderCostWarningEmail('admin@example.com', costData),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendProviderCostLimitReachedEmail', () => {
    const costData: ProviderCostLimitReachedData = {
      provider: 'openai',
      currentCost: 10.0001,
      monthlyLimit: 10,
    };

    it('should send the limit reached alert with readable numbers', async () => {
      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendProviderCostLimitReachedEmail(
        'admin@example.com',
        costData,
      );

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'admin@example.com',
        subject: '🚨 Alerta de costo: LÍMITE ALCANZADO en openai',
        template: 'provider-cost-limit-reached',
        context: {
          provider: 'openai',
          currentCost: '10.00',
          monthlyLimit: '10.00',
          adminUrl: 'http://localhost:3000/admin/ai-usage',
        },
      });
    });

    it('should not throw when the alert cannot be sent', async () => {
      mockMailerService.sendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(
        service.sendProviderCostLimitReachedEmail(
          'admin@example.com',
          costData,
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendPlanChangeEmail', () => {
    it('should send plan change notification email successfully', async () => {
      const to = 'user@example.com';
      const data: PlanChangeData = {
        userName: 'John Doe',
        oldPlan: 'Free',
        newPlan: 'Premium',
        changeDate: new Date('2025-10-31').toISOString(),
      };

      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendPlanChangeEmail(to, data);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to,
        subject: 'Cambio de plan confirmado',
        template: 'plan-change',
        context: data,
      });
    });

    it('should handle errors when sending plan change email', async () => {
      const to = 'user@example.com';
      const data: PlanChangeData = {
        userName: 'John Doe',
        oldPlan: 'Free',
        newPlan: 'Premium',
        changeDate: new Date().toISOString(),
      };

      const error = new Error('SMTP Error');
      mockMailerService.sendMail.mockRejectedValue(error);

      await expect(service.sendPlanChangeEmail(to, data)).rejects.toThrow(
        'Error al enviar email de cambio de plan',
      );
    });

    it('should log success when plan change email is sent', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      const to = 'user@example.com';
      const data: PlanChangeData = {
        userName: 'John Doe',
        oldPlan: 'Free',
        newPlan: 'Premium',
        changeDate: new Date().toISOString(),
      };

      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendPlanChangeEmail(to, data);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Email de cambio de plan enviado exitosamente'),
      );

      loggerSpy.mockRestore();
    });
  });

  describe('sendContactMessageEmail (T-PROD-014)', () => {
    const contactData: ContactMessageData = {
      name: 'Ana Pérez',
      email: 'ana@example.com',
      subject: 'Consulta por una lectura',
      message: 'Hola, quería saber cómo reservar una sesión.',
    };

    it('envía el mensaje al buzón de contacto, con el email del usuario como replyTo', async () => {
      configOverrides = { CONTACT_EMAIL_TO: 'consultas@auguriatarot.com' };
      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendContactMessageEmail(contactData);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'consultas@auguriatarot.com',
        replyTo: contactData.email,
        subject: `Contacto web: ${contactData.subject}`,
        template: 'contact-message',
        context: {
          name: contactData.name,
          email: contactData.email,
          subject: contactData.subject,
          message: contactData.message,
        },
      });
    });

    it('el replyTo pisa el default global: sin esto, responder el mensaje le contestaría al propio buzón de Auguria y no al cliente', async () => {
      configOverrides = {
        CONTACT_EMAIL_TO: 'consultas@auguriatarot.com',
        EMAIL_REPLY_TO: 'consultas@auguriatarot.com',
      };
      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendContactMessageEmail(contactData);

      expect(mockSendMail.mock.calls[0][0]).toMatchObject({
        replyTo: 'ana@example.com',
      });
    });

    it('sin CONTACT_EMAIL_TO cae a EMAIL_REPLY_TO (dev/staging: el buzón que ya recibe las respuestas)', async () => {
      configOverrides = {
        CONTACT_EMAIL_TO: undefined,
        EMAIL_REPLY_TO: 'consultas@auguriatarot.com',
      };
      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendContactMessageEmail(contactData);

      expect(mockSendMail.mock.calls[0][0]).toMatchObject({
        to: 'consultas@auguriatarot.com',
      });
    });

    it('sin CONTACT_EMAIL_TO ni EMAIL_REPLY_TO cae a EMAIL_FROM', async () => {
      configOverrides = {
        CONTACT_EMAIL_TO: undefined,
        EMAIL_REPLY_TO: undefined,
      };
      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendContactMessageEmail(contactData);

      expect(mockSendMail.mock.calls[0][0]).toMatchObject({
        to: 'noreply@tarot.com',
      });
    });

    it('un CONTACT_EMAIL_TO vacío no es un buzón: cae al siguiente fallback en vez de mandar a `to: ""`', async () => {
      configOverrides = {
        CONTACT_EMAIL_TO: '',
        EMAIL_REPLY_TO: 'consultas@auguriatarot.com',
      };
      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendContactMessageEmail(contactData);

      expect(mockSendMail.mock.calls[0][0]).toMatchObject({
        to: 'consultas@auguriatarot.com',
      });
    });

    it('relanza el error si el envío falla: a diferencia de las alertas de costo, el usuario TIENE que enterarse de que su mensaje no salió', async () => {
      configOverrides = { CONTACT_EMAIL_TO: 'consultas@auguriatarot.com' };
      mockMailerService.sendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(
        service.sendContactMessageEmail(contactData),
      ).rejects.toThrow('Error al enviar el mensaje de contacto');
    });

    it('preserva la causa raíz en el error que relanza: sin el `cause`, el llamador loguea que falló pero no por qué', async () => {
      configOverrides = { CONTACT_EMAIL_TO: 'consultas@auguriatarot.com' };
      const smtpFailure = new Error('ECONNREFUSED smtp.resend.com:587');
      mockMailerService.sendMail.mockRejectedValue(smtpFailure);

      await expect(
        service.sendContactMessageEmail(contactData),
      ).rejects.toMatchObject({ cause: smtpFailure });
    });

    it('loguea el envío exitoso', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      configOverrides = { CONTACT_EMAIL_TO: 'consultas@auguriatarot.com' };
      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendContactMessageEmail(contactData);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Mensaje de contacto enviado exitosamente'),
      );

      loggerSpy.mockRestore();
    });
  });
});
