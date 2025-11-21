import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { Logger } from '@nestjs/common';
import {
  SharedReadingData,
  WelcomeEmailData,
  PlanChangeData,
} from './interfaces/email.interface';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;

  const mockSendMail = jest.fn();
  const mockMailerService = {
    sendMail: mockSendMail,
  };

  const mockConfigGet = jest.fn((key: string) => {
    const config: Record<string, string | number> = {
      EMAIL_FROM: 'noreply@tarot.com',
      SMTP_HOST: 'smtp.test.com',
      SMTP_PORT: 587,
      FRONTEND_URL: 'http://localhost:3000',
    };
    return config[key];
  });

  const mockConfigService = {
    get: mockConfigGet,
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendSharedReading', () => {
    it('should send shared reading email successfully', async () => {
      const to = 'user@example.com';
      const readingData: SharedReadingData = {
        userName: 'John Doe',
        readingType: 'Tirada de 3 cartas',
        cards: [
          {
            name: 'El Mago',
            position: 'Pasado',
            interpretation: 'Nuevos comienzos',
          },
          {
            name: 'La Emperatriz',
            position: 'Presente',
            interpretation: 'Creatividad',
          },
          {
            name: 'El Sol',
            position: 'Futuro',
            interpretation: 'Éxito',
          },
        ],
        interpretation: 'Una lectura positiva indicando crecimiento personal',
        date: new Date('2025-10-31'),
      };

      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendSharedReading(to, readingData);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to,
        subject: 'Tu lectura de Tarot',
        template: 'shared-reading',
        context: readingData,
      });
    });

    it('should handle errors when sending shared reading email', async () => {
      const to = 'user@example.com';
      const readingData: SharedReadingData = {
        userName: 'John Doe',
        readingType: 'Tirada de 3 cartas',
        cards: [],
        interpretation: 'Test interpretation',
        date: new Date(),
      };

      const error = new Error('SMTP Error');
      mockMailerService.sendMail.mockRejectedValue(error);

      await expect(service.sendSharedReading(to, readingData)).rejects.toThrow(
        'Error al enviar email de lectura compartida',
      );

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
    });

    it('should log success when email is sent', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      const to = 'user@example.com';
      const readingData: SharedReadingData = {
        userName: 'John Doe',
        readingType: 'Tirada de 3 cartas',
        cards: [],
        interpretation: 'Test interpretation',
        date: new Date(),
      };

      mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendSharedReading(to, readingData);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Email de lectura compartida enviado exitosamente',
        ),
      );

      loggerSpy.mockRestore();
    });
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
        subject: 'Bienvenido a Tarot App',
        template: 'welcome',
        context: {
          userName: data.userName,
          email: to,
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
          resetToken,
          resetUrl: expect.stringContaining(resetToken),
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
});
