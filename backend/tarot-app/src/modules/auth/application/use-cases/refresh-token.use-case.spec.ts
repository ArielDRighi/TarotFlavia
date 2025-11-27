import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { REFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/repository.tokens';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenRepository: any;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    isAdmin: false,
    roles: ['user'],
    plan: 'free',
  };

  const mockTokenEntity = {
    id: 1,
    token: 'hashedToken',
    userId: 1,
    expiresAt: new Date(Date.now() + 86400000),
    isRevoked: false,
    user: mockUser,
    isValid: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('new_access_token'),
          },
        },
        {
          provide: REFRESH_TOKEN_REPOSITORY,
          useValue: {
            findTokenByPlainToken: jest.fn(),
            revokeToken: jest.fn(),
            createRefreshToken: jest.fn().mockResolvedValue({
              token: 'new_refresh_token',
            }),
          },
        },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    jwtService = module.get(JwtService);
    refreshTokenRepository = module.get(REFRESH_TOKEN_REPOSITORY);
  });

  describe('execute', () => {
    it('should successfully refresh tokens', async () => {
      refreshTokenRepository.findTokenByPlainToken.mockResolvedValue(
        mockTokenEntity,
      );

      const result = await useCase.execute(
        'old_refresh_token',
        '127.0.0.1',
        'Mozilla',
      );

      expect(result).toEqual({
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      });
      expect(refreshTokenRepository.revokeToken).toHaveBeenCalledWith(1);
    });

    it('should throw UnauthorizedException when token not found', async () => {
      refreshTokenRepository.findTokenByPlainToken.mockResolvedValue(null);

      await expect(
        useCase.execute('invalid_token', '127.0.0.1', 'Mozilla'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const invalidTokenEntity = {
        ...mockTokenEntity,
        isValid: jest.fn().mockReturnValue(false),
      };
      refreshTokenRepository.findTokenByPlainToken.mockResolvedValue(
        invalidTokenEntity,
      );

      await expect(
        useCase.execute('expired_token', '127.0.0.1', 'Mozilla'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found in token', async () => {
      const tokenWithoutUser = {
        ...mockTokenEntity,
        user: null,
      };
      refreshTokenRepository.findTokenByPlainToken.mockResolvedValue(
        tokenWithoutUser,
      );

      await expect(
        useCase.execute('token_without_user', '127.0.0.1', 'Mozilla'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should generate JWT with correct payload', async () => {
      refreshTokenRepository.findTokenByPlainToken.mockResolvedValue(
        mockTokenEntity,
      );

      await useCase.execute('valid_token', '127.0.0.1', 'Mozilla');

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        isAdmin: mockUser.isAdmin,
        roles: mockUser.roles,
        plan: mockUser.plan,
      });
    });

    it('should create new refresh token with correct parameters', async () => {
      refreshTokenRepository.findTokenByPlainToken.mockResolvedValue(
        mockTokenEntity,
      );

      await useCase.execute('valid_token', '192.168.1.1', 'Chrome');

      expect(refreshTokenRepository.createRefreshToken).toHaveBeenCalledWith(
        mockUser,
        '192.168.1.1',
        'Chrome',
      );
    });

    it('should revoke old token before creating new one', async () => {
      refreshTokenRepository.findTokenByPlainToken.mockResolvedValue(
        mockTokenEntity,
      );

      await useCase.execute('valid_token', '127.0.0.1', 'Mozilla');

      expect(refreshTokenRepository.revokeToken).toHaveBeenCalledWith(1);
      expect(refreshTokenRepository.createRefreshToken).toHaveBeenCalled();
    });
  });
});
