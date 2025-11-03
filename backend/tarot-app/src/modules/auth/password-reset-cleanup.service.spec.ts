import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetCleanupService } from './password-reset-cleanup.service';
import { PasswordResetService } from './password-reset.service';
import { Logger } from '@nestjs/common';

describe('PasswordResetCleanupService', () => {
  let service: PasswordResetCleanupService;
  let passwordResetServiceMock: Partial<PasswordResetService>;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    passwordResetServiceMock = {
      deleteExpiredTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetCleanupService,
        {
          provide: PasswordResetService,
          useValue: passwordResetServiceMock,
        },
      ],
    }).compile();

    service = module.get<PasswordResetCleanupService>(
      PasswordResetCleanupService,
    );
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cleanupExpiredTokens', () => {
    it('should call passwordResetService.deleteExpiredTokens', async () => {
      (
        passwordResetServiceMock.deleteExpiredTokens as jest.Mock
      ).mockResolvedValue(5);

      await service.cleanupExpiredTokens();

      expect(passwordResetServiceMock.deleteExpiredTokens).toHaveBeenCalled();
    });

    it('should log the number of deleted tokens', async () => {
      const deletedCount = 10;
      (
        passwordResetServiceMock.deleteExpiredTokens as jest.Mock
      ).mockResolvedValue(deletedCount);

      await service.cleanupExpiredTokens();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Starting password reset tokens cleanup...',
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `Password reset tokens cleanup completed. Deleted ${deletedCount} expired tokens.`,
      );
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      (
        passwordResetServiceMock.deleteExpiredTokens as jest.Mock
      ).mockRejectedValue(error);

      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      await service.cleanupExpiredTokens();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error during password reset tokens cleanup',
        error.stack,
      );

      errorSpy.mockRestore();
    });

    it('should handle non-Error exceptions', async () => {
      const errorMessage = 'Unknown error';
      (
        passwordResetServiceMock.deleteExpiredTokens as jest.Mock
      ).mockRejectedValue(errorMessage);

      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      await service.cleanupExpiredTokens();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error during password reset tokens cleanup',
        errorMessage,
      );

      errorSpy.mockRestore();
    });
  });
});
