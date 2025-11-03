import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { UsersService } from '../users/users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('PasswordResetService', () => {
  let service: PasswordResetService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: mockRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateResetToken', () => {
    it('should generate a reset token for existing user', async () => {
      const user = { id: 1, email: 'test@test.com' };

      mockUsersService.findByEmail.mockResolvedValue(user);

      const resetToken = new PasswordResetToken();
      resetToken.id = 'uuid';
      resetToken.userId = user.id;
      resetToken.token = 'some-hashed-token';
      resetToken.expiresAt = new Date(Date.now() + 3600000); // 1 hour
      resetToken.createdAt = new Date();

      mockRepository.create.mockReturnValue(resetToken);
      mockRepository.save.mockResolvedValue(resetToken);

      const result = await service.generateResetToken('test@test.com');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('expiresAt');
      expect(result.token).toHaveLength(64); // 32 bytes en hex = 64 chars
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@test.com',
      );
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.generateResetToken('nonexistent@test.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      const plainToken = 'plain-token';
      const hashedToken = await bcrypt.hash(plainToken, 10);

      const resetToken = new PasswordResetToken();
      resetToken.id = 'uuid';
      resetToken.userId = 1;
      resetToken.token = hashedToken;
      resetToken.expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
      resetToken.usedAt = null;

      mockQueryBuilder.getMany.mockResolvedValue([resetToken]);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateToken(plainToken);

      expect(result).toEqual(resetToken);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });
    it('should throw BadRequestException if token is not found', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if token is expired', async () => {
      const plainToken = 'expired-token';
      const hashedToken = await bcrypt.hash(plainToken, 10);

      const resetToken = new PasswordResetToken();
      resetToken.token = hashedToken;
      resetToken.expiresAt = new Date(Date.now() - 1000); // expired
      resetToken.usedAt = null;

      mockQueryBuilder.getMany.mockResolvedValue([resetToken]);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(service.validateToken(plainToken)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if token is already used', async () => {
      const plainToken = 'used-token';
      const hashedToken = await bcrypt.hash(plainToken, 10);

      const resetToken = new PasswordResetToken();
      resetToken.token = hashedToken;
      resetToken.expiresAt = new Date(Date.now() + 3600000);
      resetToken.usedAt = new Date(); // already used

      mockQueryBuilder.getMany.mockResolvedValue([resetToken]);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(service.validateToken(plainToken)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('markTokenAsUsed', () => {
    it('should mark token as used', async () => {
      const resetToken = new PasswordResetToken();
      resetToken.id = 'uuid';
      resetToken.usedAt = null;

      mockRepository.save.mockResolvedValue(resetToken);

      await service.markTokenAsUsed(resetToken);

      expect(resetToken.usedAt).toBeInstanceOf(Date);
      expect(mockRepository.save).toHaveBeenCalledWith(resetToken);
    });
  });

  describe('deleteExpiredTokens', () => {
    it('should delete tokens older than 7 days', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ affected: 5 });

      const result = await service.deleteExpiredTokens();

      expect(result).toBe(5);
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });
});
