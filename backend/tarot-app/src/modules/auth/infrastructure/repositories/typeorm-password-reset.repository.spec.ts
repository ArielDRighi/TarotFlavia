import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TypeOrmPasswordResetRepository } from './typeorm-password-reset.repository';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';
import { UsersService } from '../../../users/users.service';
import { User } from '../../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('TypeOrmPasswordResetRepository', () => {
  let repository: TypeOrmPasswordResetRepository;
  let mockPasswordResetTokenRepository: jest.Mocked<
    Repository<PasswordResetToken>
  >;
  let mockUsersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    mockPasswordResetTokenRepository = {
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    mockUsersService = {
      findByEmail: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmPasswordResetRepository,
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: mockPasswordResetTokenRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmPasswordResetRepository>(
      TypeOrmPasswordResetRepository,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('generateResetToken', () => {
    it('should generate and save a reset token for existing user', async () => {
      const mockUser = { id: 1, email: 'test@test.com' } as User;
      const mockResetToken = {
        id: 'token-id',
        userId: 1,
        token: 'hashed-token',
        expiresAt: expect.any(Date),
      } as PasswordResetToken;

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockPasswordResetTokenRepository.create.mockReturnValue(mockResetToken);
      mockPasswordResetTokenRepository.save.mockResolvedValue(mockResetToken);

      const result = await repository.generateResetToken('test@test.com');

      expect(result.token).toBeDefined();
      expect(result.token).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@test.com',
      );
      expect(mockPasswordResetTokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          usedAt: null,
        }),
      );
      expect(mockPasswordResetTokenRepository.save).toHaveBeenCalledWith(
        mockResetToken,
      );
    });

    it('should return dummy token for non-existent user (security)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await repository.generateResetToken(
        'nonexistent@test.com',
      );

      expect(result.token).toBe(
        '0000000000000000000000000000000000000000000000000000000000000000',
      );
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(mockPasswordResetTokenRepository.create).not.toHaveBeenCalled();
      expect(mockPasswordResetTokenRepository.save).not.toHaveBeenCalled();
    });

    it('should set expiration to 1 hour from now', async () => {
      const mockUser = { id: 1, email: 'test@test.com' } as User;
      const mockResetToken = {
        id: 'token-id',
        expiresAt: new Date(),
      } as PasswordResetToken;

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockPasswordResetTokenRepository.create.mockReturnValue(mockResetToken);
      mockPasswordResetTokenRepository.save.mockResolvedValue(mockResetToken);

      const before = Date.now();
      const result = await repository.generateResetToken('test@test.com');
      const after = Date.now();

      const oneHourMs = 3600000;
      expect(result.expiresAt.getTime()).toBeGreaterThanOrEqual(
        before + oneHourMs,
      );
      expect(result.expiresAt.getTime()).toBeLessThanOrEqual(after + oneHourMs);
    });
  });

  describe('validateToken', () => {
    it('should validate and return a valid token', async () => {
      const plainToken = 'valid-plain-token';
      const hashedToken = await bcrypt.hash(plainToken, 10);
      const futureDate = new Date(Date.now() + 3600000);

      const mockToken = {
        id: 'token-id',
        token: hashedToken,
        expiresAt: futureDate,
        usedAt: null,
      } as PasswordResetToken;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockToken]),
      } as unknown as SelectQueryBuilder<PasswordResetToken>;

      mockPasswordResetTokenRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await repository.validateToken(plainToken);

      expect(result).toBe(mockToken);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'token.usedAt IS NULL',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'token.expiresAt > :now',
        expect.objectContaining({ now: expect.any(Date) }),
      );
    });

    it('should throw BadRequestException for invalid token', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as unknown as SelectQueryBuilder<PasswordResetToken>;

      mockPasswordResetTokenRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      await expect(repository.validateToken('invalid-token')).rejects.toThrow(
        BadRequestException,
      );
      await expect(repository.validateToken('invalid-token')).rejects.toThrow(
        'Invalid token',
      );
    });

    it('should throw BadRequestException for expired token (race condition check)', async () => {
      const plainToken = 'valid-plain-token';
      const hashedToken = await bcrypt.hash(plainToken, 10);
      const pastDate = new Date(Date.now() - 1000); // 1 second ago

      const mockToken = {
        id: 'token-id',
        token: hashedToken,
        expiresAt: pastDate,
        usedAt: null,
      } as PasswordResetToken;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockToken]),
      } as unknown as SelectQueryBuilder<PasswordResetToken>;

      mockPasswordResetTokenRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      await expect(repository.validateToken(plainToken)).rejects.toThrow(
        BadRequestException,
      );
      await expect(repository.validateToken(plainToken)).rejects.toThrow(
        'Token has expired',
      );
    });

    it('should find correct token when multiple tokens exist', async () => {
      const plainToken = 'correct-token';
      const correctHashedToken = await bcrypt.hash(plainToken, 10);
      const futureDate = new Date(Date.now() + 3600000);

      const mockTokens = [
        {
          id: 'token-1',
          token: await bcrypt.hash('wrong-token-1', 10),
          expiresAt: futureDate,
        },
        {
          id: 'token-2',
          token: correctHashedToken,
          expiresAt: futureDate,
        },
        {
          id: 'token-3',
          token: await bcrypt.hash('wrong-token-2', 10),
          expiresAt: futureDate,
        },
      ] as PasswordResetToken[];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTokens),
      } as unknown as SelectQueryBuilder<PasswordResetToken>;

      mockPasswordResetTokenRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await repository.validateToken(plainToken);

      expect(result).toBe(mockTokens[1]);
      expect(result.id).toBe('token-2');
    });
  });

  describe('markTokenAsUsed', () => {
    it('should mark token as used with current timestamp', async () => {
      const mockToken = {
        id: 'token-id',
        usedAt: null,
      } as PasswordResetToken;

      mockPasswordResetTokenRepository.save.mockResolvedValue({
        ...mockToken,
        usedAt: expect.any(Date),
      } as PasswordResetToken);

      await repository.markTokenAsUsed(mockToken);

      expect(mockToken.usedAt).toBeInstanceOf(Date);
      expect(mockPasswordResetTokenRepository.save).toHaveBeenCalledWith(
        mockToken,
      );
    });
  });

  describe('deleteExpiredTokens', () => {
    it('should delete tokens older than 7 days', async () => {
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 10 }),
      } as unknown as SelectQueryBuilder<PasswordResetToken>;

      mockPasswordResetTokenRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await repository.deleteExpiredTokens();

      expect(result).toBe(10);
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.from).toHaveBeenCalledWith(PasswordResetToken);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'created_at < :date',
        expect.objectContaining({ date: expect.any(Date) }),
      );
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it('should return 0 if no tokens deleted', async () => {
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: undefined }),
      } as unknown as SelectQueryBuilder<PasswordResetToken>;

      mockPasswordResetTokenRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await repository.deleteExpiredTokens();

      expect(result).toBe(0);
    });

    it('should calculate deletion date as 7 days ago', async () => {
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      } as unknown as SelectQueryBuilder<PasswordResetToken>;

      mockPasswordResetTokenRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const before = Date.now();
      await repository.deleteExpiredTokens();
      const after = Date.now();

      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const whereCall = (mockQueryBuilder.where as jest.Mock).mock.calls[0][1];
      const deletionDate = whereCall.date as Date;

      expect(deletionDate.getTime()).toBeGreaterThanOrEqual(
        before - sevenDaysMs,
      );
      expect(deletionDate.getTime()).toBeLessThanOrEqual(after - sevenDaysMs);
    });
  });
});
