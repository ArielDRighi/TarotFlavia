import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { TypeOrmRefreshTokenRepository } from './typeorm-refresh-token.repository';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { User } from '../../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('TypeOrmRefreshTokenRepository', () => {
  let repository: TypeOrmRefreshTokenRepository;
  let mockRefreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;
  let mockConfigService: jest.Mocked<ConfigService>;

  const mockUser: User = {
    id: 1,
    email: 'test@test.com',
    name: 'Test User',
  } as User;

  beforeEach(async () => {
    mockRefreshTokenRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'REFRESH_TOKEN_EXPIRY_DAYS') return 7;
        if (key === 'REFRESH_TOKEN_RETENTION_DAYS') return 30;
        return null;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmRefreshTokenRepository,
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmRefreshTokenRepository>(
      TypeOrmRefreshTokenRepository,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createRefreshToken', () => {
    it('should create and save a refresh token', async () => {
      const mockRefreshToken = {
        id: 'token-id',
        userId: 1,
        token: 'hashed-token',
        tokenHash: 'token-hash',
        expiresAt: expect.any(Date),
      } as RefreshToken;

      mockRefreshTokenRepository.create.mockReturnValue(mockRefreshToken);
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshToken);

      const result = await repository.createRefreshToken(
        mockUser,
        '127.0.0.1',
        'test-agent',
      );

      expect(result.token).toBeDefined();
      expect(result.token).toHaveLength(128); // 64 bytes = 128 hex chars
      expect(result.refreshToken).toBe(mockRefreshToken);
      expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          user: mockUser,
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        }),
      );
      expect(mockRefreshTokenRepository.save).toHaveBeenCalledWith(
        mockRefreshToken,
      );
    });

    it('should use default expiry days if not configured', async () => {
      mockConfigService.get.mockReturnValue(null);

      const mockRefreshToken = {
        id: 'token-id',
        expiresAt: new Date(),
      } as RefreshToken;

      mockRefreshTokenRepository.create.mockReturnValue(mockRefreshToken);
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshToken);

      await repository.createRefreshToken(mockUser);

      const createCall = mockRefreshTokenRepository.create.mock
        .calls[0][0] as any;
      const expiresAt = createCall.expiresAt as Date;
      const now = Date.now();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

      expect(expiresAt.getTime()).toBeGreaterThan(now);
      expect(expiresAt.getTime()).toBeLessThanOrEqual(
        now + sevenDaysInMs + 1000,
      );
    });
  });

  describe('findTokenByPlainToken', () => {
    it('should find and validate a token by plain token', async () => {
      const plainToken = 'plain-token-string';
      const hashedToken = await bcrypt.hash(plainToken, 10);

      const mockRefreshToken = {
        id: 'token-id',
        token: hashedToken,
        revokedAt: null,
      } as RefreshToken;

      mockRefreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);

      const result = await repository.findTokenByPlainToken(plainToken);

      expect(result).toBe(mockRefreshToken);
      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalled();
      const callArg = mockRefreshTokenRepository.findOne.mock
        .calls[0][0] as any;
      expect(callArg.where).toBeDefined();
      expect(callArg.where.tokenHash).toBeDefined();
    });

    it('should return null if token not found', async () => {
      mockRefreshTokenRepository.findOne.mockResolvedValue(null);

      const result = await repository.findTokenByPlainToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null if bcrypt validation fails', async () => {
      const plainToken = 'plain-token';
      const differentHashedToken = await bcrypt.hash('different-token', 10);

      const mockRefreshToken = {
        id: 'token-id',
        token: differentHashedToken,
      } as RefreshToken;

      mockRefreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);

      const result = await repository.findTokenByPlainToken(plainToken);

      expect(result).toBeNull();
    });
  });

  describe('findTokenByHash', () => {
    it('should find token by comparing hashes for all user tokens', async () => {
      const plainToken = 'plain-token';
      const hashedToken = await bcrypt.hash(plainToken, 10);

      const mockTokens = [
        { id: 'token-1', token: await bcrypt.hash('other-token', 10) },
        { id: 'token-2', token: hashedToken },
      ] as RefreshToken[];

      mockRefreshTokenRepository.find.mockResolvedValue(mockTokens);

      const result = await repository.findTokenByHash(plainToken, 1);

      expect(result).toBe(mockTokens[1]);
      expect(mockRefreshTokenRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });

    it('should return null if no matching token found', async () => {
      const mockTokens = [
        { id: 'token-1', token: await bcrypt.hash('other-token-1', 10) },
        { id: 'token-2', token: await bcrypt.hash('other-token-2', 10) },
      ] as RefreshToken[];

      mockRefreshTokenRepository.find.mockResolvedValue(mockTokens);

      const result = await repository.findTokenByHash('non-matching', 1);

      expect(result).toBeNull();
    });
  });

  describe('revokeToken', () => {
    it('should revoke a token by ID', async () => {
      mockRefreshTokenRepository.update.mockResolvedValue({
        affected: 1,
      } as any);

      await repository.revokeToken('token-id');

      expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(
        { id: 'token-id' },
        { revokedAt: expect.any(Date) },
      );
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all active tokens for a user', async () => {
      mockRefreshTokenRepository.update.mockResolvedValue({
        affected: 3,
      } as any);

      await repository.revokeAllUserTokens(1);

      expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
        }),
        { revokedAt: expect.any(Date) },
      );
    });
  });

  describe('deleteExpiredTokens', () => {
    it('should delete tokens older than retention period', async () => {
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      };

      mockRefreshTokenRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await repository.deleteExpiredTokens();

      expect(result).toBe(5);
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.from).toHaveBeenCalledWith(RefreshToken);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it('should return 0 if no tokens deleted', async () => {
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: undefined }),
      };

      mockRefreshTokenRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await repository.deleteExpiredTokens();

      expect(result).toBe(0);
    });

    it('should use default retention days if not configured', async () => {
      mockConfigService.get.mockReturnValue(null);

      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 2 }),
      };

      mockRefreshTokenRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await repository.deleteExpiredTokens();

      expect(result).toBe(2);
    });
  });
});
