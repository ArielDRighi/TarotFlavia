import { Test, TestingModule } from '@nestjs/testing';
import { ResetPasswordUseCase } from './reset-password.use-case';
import { UsersService } from '../../../users/users.service';
import {
  PASSWORD_RESET_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
} from '../../domain/interfaces/repository.tokens';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let passwordResetRepository: any;
  let refreshTokenRepository: any;
  let usersService: jest.Mocked<UsersService>;

  const mockResetToken = {
    id: 1,
    token: 'hashedToken',
    userId: 1,
    expiresAt: new Date(Date.now() + 3600000),
    isUsed: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordUseCase,
        {
          provide: PASSWORD_RESET_REPOSITORY,
          useValue: {
            validateToken: jest.fn(),
            markTokenAsUsed: jest.fn(),
          },
        },
        {
          provide: REFRESH_TOKEN_REPOSITORY,
          useValue: {
            revokeAllUserTokens: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
    passwordResetRepository = module.get(PASSWORD_RESET_REPOSITORY);
    refreshTokenRepository = module.get(REFRESH_TOKEN_REPOSITORY);
    usersService = module.get(UsersService);
  });

  describe('execute', () => {
    it('should successfully reset password', async () => {
      passwordResetRepository.validateToken.mockResolvedValue(mockResetToken);

      const result = await useCase.execute(
        'valid_reset_token',
        'NewSecurePass123!',
      );

      expect(result).toEqual({ message: 'Password reset successful' });
      expect(usersService.update).toHaveBeenCalledWith(1, {
        password: 'NewSecurePass123!',
      });
    });

    it('should revoke all user refresh tokens', async () => {
      passwordResetRepository.validateToken.mockResolvedValue(mockResetToken);

      await useCase.execute('valid_reset_token', 'NewSecurePass123!');

      expect(refreshTokenRepository.revokeAllUserTokens).toHaveBeenCalledWith(
        1,
      );
    });

    it('should mark reset token as used', async () => {
      passwordResetRepository.validateToken.mockResolvedValue(mockResetToken);

      await useCase.execute('valid_reset_token', 'NewSecurePass123!');

      expect(passwordResetRepository.markTokenAsUsed).toHaveBeenCalledWith(
        mockResetToken,
      );
    });

    it('should call operations in correct order', async () => {
      passwordResetRepository.validateToken.mockResolvedValue(mockResetToken);
      const callOrder: string[] = [];

      usersService.update.mockImplementation(() => {
        callOrder.push('update');
        return Promise.resolve({} as any);
      });
      refreshTokenRepository.revokeAllUserTokens.mockImplementation(() => {
        callOrder.push('revoke');
        return Promise.resolve();
      });
      passwordResetRepository.markTokenAsUsed.mockImplementation(() => {
        callOrder.push('markUsed');
        return Promise.resolve();
      });

      await useCase.execute('valid_reset_token', 'NewSecurePass123!');

      expect(callOrder).toEqual(['update', 'revoke', 'markUsed']);
    });

    it('should propagate validation errors', async () => {
      passwordResetRepository.validateToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(
        useCase.execute('invalid_token', 'NewSecurePass123!'),
      ).rejects.toThrow('Invalid token');
    });
  });
});
