import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { IsNull } from 'typeorm';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'REFRESH_TOKEN_EXPIRY_DAYS') return 7;
      if (key === 'REFRESH_TOKEN_RETENTION_DAYS') return 30;
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate a secure random token', async () => {
      const token1 = await service.generateToken();
      const token2 = await service.generateToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(32);
    });
  });

  describe('hashToken', () => {
    it('should hash a token using bcrypt', async () => {
      const token = 'my-token-123';
      const hashed = await service.hashToken(token);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(token);
      expect(await bcrypt.compare(token, hashed)).toBe(true);
    });
  });

  describe('createRefreshToken', () => {
    it('should create and save a refresh token', async () => {
      const user = new User();
      user.id = 1;

      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';

      const mockToken = new RefreshToken();
      mockToken.id = 'uuid-123';
      mockToken.userId = user.id;
      mockToken.user = user;

      mockRepository.create.mockReturnValue(mockToken);
      mockRepository.save.mockResolvedValue(mockToken);

      const result = await service.createRefreshToken(
        user,
        ipAddress,
        userAgent,
      );

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledWith(mockToken);
    });
  });

  describe('findTokenByHash', () => {
    it('should find all tokens for a user and return the one that matches', async () => {
      const user = new User();
      user.id = 1;

      const plainToken = 'my-plain-token';
      const hashedToken = await bcrypt.hash(plainToken, 10);

      const mockTokens = [
        {
          id: 'uuid-1',
          token: hashedToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 10000),
          revokedAt: null,
          isExpired: () => false,
          isRevoked: () => false,
          isValid: () => true,
        } as RefreshToken,
      ];

      mockRepository.find.mockResolvedValue(mockTokens);

      const result = await service.findTokenByHash(plainToken, user.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe('uuid-1');
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: user.id },
        relations: ['user'],
      });
    });

    it('should return null if no matching token found', async () => {
      const user = new User();
      user.id = 1;

      const plainToken = 'wrong-token';
      const differentToken = await bcrypt.hash('different-token', 10);

      const mockTokens = [
        {
          id: 'uuid-1',
          token: differentToken,
          userId: user.id,
        } as RefreshToken,
      ];

      mockRepository.find.mockResolvedValue(mockTokens);

      const result = await service.findTokenByHash(plainToken, user.id);

      expect(result).toBeNull();
    });

    it('should return null if no tokens found for user', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findTokenByHash('any-token', 1);

      expect(result).toBeNull();
    });
  });

  describe('revokeToken', () => {
    it('should revoke a token by setting revokedAt', async () => {
      const tokenId = 'uuid-123';

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.revokeToken(tokenId);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: tokenId },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { revokedAt: expect.any(Date) },
      );
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all tokens for a user', async () => {
      const userId = 1;

      mockRepository.update.mockResolvedValue({ affected: 3 });

      await service.revokeAllUserTokens(userId);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { userId, revokedAt: IsNull() },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { revokedAt: expect.any(Date) },
      );
    });
  });

  describe('deleteExpiredTokens', () => {
    it('should delete tokens expired more than 30 days ago', async () => {
      const queryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.deleteExpiredTokens();

      expect(result).toBe(5);
      expect(queryBuilder.delete).toHaveBeenCalled();
      expect(queryBuilder.from).toHaveBeenCalledWith(RefreshToken);
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.execute).toHaveBeenCalled();
    });
  });
});
