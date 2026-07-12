import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ForgotPasswordUseCase } from './forgot-password.use-case';
import { PASSWORD_RESET_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { UsersService } from '../../../users/users.service';
import { EmailService } from '../../../email/email.service';
import { User } from '../../../users/entities/user.entity';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let passwordResetRepository: Record<string, jest.Mock>;
  let usersService: jest.Mocked<Pick<UsersService, 'findByEmail'>>;
  let emailService: jest.Mocked<Pick<EmailService, 'sendPasswordResetEmail'>>;

  const GENERIC_MESSAGE =
    'Si el email está registrado, recibirás un enlace para restablecer tu contraseña.';

  /** Deja correr los microtasks pendientes (el envío del email va en segundo plano) */
  const flushPromises = (): Promise<void> =>
    new Promise((resolve) => setImmediate(resolve));

  const mockUser = {
    id: 7,
    email: 'test@example.com',
    name: 'Test User',
  } as unknown as User;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn().mockResolvedValue(mockUser),
    };
    emailService = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordUseCase,
        {
          provide: PASSWORD_RESET_REPOSITORY,
          useValue: {
            generateResetToken: jest.fn().mockResolvedValue({
              token: 'reset_token_123',
              expiresAt: new Date(),
            }),
          },
        },
        { provide: UsersService, useValue: usersService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    useCase = module.get<ForgotPasswordUseCase>(ForgotPasswordUseCase);
    passwordResetRepository = module.get(PASSWORD_RESET_REPOSITORY);
  });

  describe('execute', () => {
    it('should send the reset email with the generated token', async () => {
      const result = await useCase.execute('test@example.com');

      expect(passwordResetRepository.generateResetToken).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name,
        'reset_token_123',
      );
      expect(result.message).toBe(GENERIC_MESSAGE);
    });

    it('should never return the reset token in the response', async () => {
      const originalEnv = process.env.NODE_ENV;

      process.env.NODE_ENV = 'development';
      const devResult = await useCase.execute('test@example.com');

      process.env.NODE_ENV = 'production';
      const prodResult = await useCase.execute('test@example.com');

      process.env.NODE_ENV = originalEnv;

      expect(devResult).toEqual({ message: GENERIC_MESSAGE });
      expect(prodResult).toEqual({ message: GENERIC_MESSAGE });
      expect(devResult).not.toHaveProperty('token');
      expect(prodResult).not.toHaveProperty('token');
    });

    it('should not leak the reset token through the logs', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const loggerLogSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation();

      await useCase.execute('test@example.com');

      expect(consoleSpy).not.toHaveBeenCalled();
      const loggedMessages = loggerLogSpy.mock.calls.flat().join(' ');
      expect(loggedMessages).not.toContain('reset_token_123');

      consoleSpy.mockRestore();
      loggerLogSpy.mockRestore();
    });

    it('should not generate a token nor send an email when the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await useCase.execute('unknown@example.com');

      expect(passwordResetRepository.generateResetToken).not.toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(result).toEqual({ message: GENERIC_MESSAGE });
    });

    it('should return the same message whether the user exists or not', async () => {
      const existingResult = await useCase.execute('test@example.com');

      usersService.findByEmail.mockResolvedValue(null);
      const unknownResult = await useCase.execute('unknown@example.com');

      expect(existingResult).toEqual(unknownResult);
    });

    it('should not propagate email failures to the caller', async () => {
      const loggerErrorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();
      emailService.sendPasswordResetEmail.mockRejectedValue(
        new Error('SMTP down'),
      );

      const result = await useCase.execute('test@example.com');

      expect(result).toEqual({ message: GENERIC_MESSAGE });

      // El envío va en segundo plano: el error se loguea después de responder
      await flushPromises();
      expect(loggerErrorSpy).toHaveBeenCalled();

      loggerErrorSpy.mockRestore();
    });

    it('should not wait for the SMTP round-trip before answering', async () => {
      // Enumeración por timing: si la respuesta esperara al envío, tardaría mucho más
      // para un email registrado que para uno inexistente.
      let resolveSend: () => void = () => {};
      emailService.sendPasswordResetEmail.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveSend = resolve;
          }),
      );

      const result = await useCase.execute('test@example.com');

      expect(result).toEqual({ message: GENERIC_MESSAGE });
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();

      resolveSend();
    });
  });
});
