import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LogoutUseCase } from './logout.use-case';
import { REFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/repository.tokens';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let refreshTokenRepository: any;

  const mockTokenEntity = {
    id: 1,
    token: 'hashedToken',
    userId: 1,
    expiresAt: new Date(Date.now() + 86400000),
    isRevoked: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        {
          provide: REFRESH_TOKEN_REPOSITORY,
          useValue: {
            findTokenByPlainToken: jest.fn(),
            revokeToken: jest.fn(),
            revokeAllUserTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
    refreshTokenRepository = module.get(REFRESH_TOKEN_REPOSITORY);
  });

  describe('execute', () => {
    it('should successfully logout user with valid refresh token', async () => {
      refreshTokenRepository.findTokenByPlainToken.mockResolvedValue(
        mockTokenEntity,
      );

      const result = await useCase.execute('valid_refresh_token');

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(refreshTokenRepository.revokeToken).toHaveBeenCalledWith(1);
    });

    it('should throw UnauthorizedException when token not found', async () => {
      refreshTokenRepository.findTokenByPlainToken.mockResolvedValue(null);

      await expect(useCase.execute('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with correct message', async () => {
      refreshTokenRepository.findTokenByPlainToken.mockResolvedValue(null);

      await expect(useCase.execute('invalid_token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });

  describe('executeAll', () => {
    it('should successfully logout all user sessions', async () => {
      const result = await useCase.executeAll(1);

      expect(result).toEqual({
        message: 'All sessions logged out successfully',
      });
      expect(refreshTokenRepository.revokeAllUserTokens).toHaveBeenCalledWith(
        1,
      );
    });

    it('should throw UnauthorizedException when userId is not provided', async () => {
      await expect(useCase.executeAll(null as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with correct message', async () => {
      await expect(useCase.executeAll(undefined as any)).rejects.toThrow(
        'User not authenticated',
      );
    });
  });
});
