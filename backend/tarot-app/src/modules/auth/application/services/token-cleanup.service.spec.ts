import { Test, TestingModule } from '@nestjs/testing';
import { TokenCleanupService } from './token-cleanup.service';
import {
  REFRESH_TOKEN_REPOSITORY,
  PASSWORD_RESET_REPOSITORY,
} from '../../domain/interfaces/repository.tokens';

describe('TokenCleanupService', () => {
  let service: TokenCleanupService;
  let refreshTokenRepository: any;
  let passwordResetRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenCleanupService,
        {
          provide: REFRESH_TOKEN_REPOSITORY,
          useValue: {
            deleteExpiredTokens: jest.fn(),
          },
        },
        {
          provide: PASSWORD_RESET_REPOSITORY,
          useValue: {
            deleteExpiredTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenCleanupService>(TokenCleanupService);
    refreshTokenRepository = module.get(REFRESH_TOKEN_REPOSITORY);
    passwordResetRepository = module.get(PASSWORD_RESET_REPOSITORY);
  });

  describe('cleanupNow', () => {
    it('should cleanup both refresh tokens and password reset tokens', async () => {
      refreshTokenRepository.deleteExpiredTokens.mockResolvedValue(5);
      passwordResetRepository.deleteExpiredTokens.mockResolvedValue(3);

      const result = await service.cleanupNow();

      expect(result).toEqual({
        deletedRefreshTokens: 5,
        deletedPasswordResetTokens: 3,
      });
      expect(refreshTokenRepository.deleteExpiredTokens).toHaveBeenCalled();
      expect(passwordResetRepository.deleteExpiredTokens).toHaveBeenCalled();
    });

    it('should handle cleanup with zero expired tokens', async () => {
      refreshTokenRepository.deleteExpiredTokens.mockResolvedValue(0);
      passwordResetRepository.deleteExpiredTokens.mockResolvedValue(0);

      const result = await service.cleanupNow();

      expect(result).toEqual({
        deletedRefreshTokens: 0,
        deletedPasswordResetTokens: 0,
      });
    });

    it('should handle repository errors', async () => {
      refreshTokenRepository.deleteExpiredTokens.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.cleanupNow()).rejects.toThrow('Database error');
    });
  });

  describe('handleCleanup', () => {
    it('should execute scheduled cleanup successfully', async () => {
      refreshTokenRepository.deleteExpiredTokens.mockResolvedValue(5);
      passwordResetRepository.deleteExpiredTokens.mockResolvedValue(3);

      await service.handleCleanup();

      expect(refreshTokenRepository.deleteExpiredTokens).toHaveBeenCalled();
      expect(passwordResetRepository.deleteExpiredTokens).toHaveBeenCalled();
    });

    it('should handle errors during cleanup gracefully', async () => {
      refreshTokenRepository.deleteExpiredTokens.mockRejectedValue(
        new Error('Database error'),
      );

      // Should not throw, errors are logged
      await service.handleCleanup();

      expect(refreshTokenRepository.deleteExpiredTokens).toHaveBeenCalled();
    });
  });
});
