import { Test, TestingModule } from '@nestjs/testing';
import { ForgotPasswordUseCase } from './forgot-password.use-case';
import { PASSWORD_RESET_REPOSITORY } from '../../domain/interfaces/repository.tokens';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let passwordResetRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordUseCase,
        {
          provide: PASSWORD_RESET_REPOSITORY,
          useValue: {
            generateResetToken: jest.fn().mockResolvedValue({
              token: 'reset_token_123',
            }),
          },
        },
      ],
    }).compile();

    useCase = module.get<ForgotPasswordUseCase>(ForgotPasswordUseCase);
    passwordResetRepository = module.get(PASSWORD_RESET_REPOSITORY);
  });

  describe('execute', () => {
    it('should generate reset token successfully', async () => {
      const result = await useCase.execute('test@example.com');

      expect(result.message).toBe('Password reset email sent');
      expect(passwordResetRepository.generateResetToken).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should return token in non-production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const result = await useCase.execute('test@example.com');

      expect(result.token).toBe('reset_token_123');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not return token in production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const result = await useCase.execute('test@example.com');

      expect(result.token).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should log reset link to console', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await useCase.execute('test@example.com');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Password reset link:'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('/reset-password?token=reset_token_123'),
      );

      consoleSpy.mockRestore();
    });
  });
});
