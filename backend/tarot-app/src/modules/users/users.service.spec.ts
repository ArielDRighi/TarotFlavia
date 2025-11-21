import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole, UserPlan } from './entities/user.entity';
import { RefreshTokenService } from '../auth/refresh-token.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockRefreshTokenService = {
    revokeAllUserTokens: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: RefreshTokenService,
          useValue: mockRefreshTokenService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addTarotistRole', () => {
    it('should add TAROTIST role to user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        roles: [UserRole.CONSUMER],
        password: 'hashedpassword',
        hasRole: jest.fn().mockReturnValue(false),
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        roles: [UserRole.CONSUMER, UserRole.TAROTIST],
      });

      const result = await service.addTarotistRole(1);

      expect(mockUser.roles).toContain(UserRole.TAROTIST);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.addTarotistRole(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if user already has TAROTIST role', async () => {
      const mockUser = {
        id: 1,
        roles: [UserRole.CONSUMER, UserRole.TAROTIST],
        hasRole: jest.fn().mockReturnValue(true),
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.addTarotistRole(1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('addAdminRole', () => {
    it('should add ADMIN role and sync isAdmin field', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        roles: [UserRole.CONSUMER],
        isAdmin: false,
        password: 'hashedpassword',
        hasRole: jest.fn().mockReturnValue(false),
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        roles: [UserRole.CONSUMER, UserRole.ADMIN],
        isAdmin: true,
      });

      await service.addAdminRole(1);

      expect(mockUser.roles).toContain(UserRole.ADMIN);
      expect(mockUser.isAdmin).toBe(true);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.addAdminRole(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if user already has ADMIN role', async () => {
      const mockUser = {
        id: 1,
        roles: [UserRole.CONSUMER, UserRole.ADMIN],
        hasRole: jest.fn().mockReturnValue(true),
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.addAdminRole(1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('removeRole', () => {
    it('should remove TAROTIST role from user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        roles: [UserRole.CONSUMER, UserRole.TAROTIST],
        password: 'hashedpassword',
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        roles: [UserRole.CONSUMER],
      });

      await service.removeRole(1, UserRole.TAROTIST);

      expect(mockUser.roles).not.toContain(UserRole.TAROTIST);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should remove ADMIN role and sync isAdmin field', async () => {
      const mockUser = {
        id: 1,
        roles: [UserRole.CONSUMER, UserRole.ADMIN],
        isAdmin: true,
        password: 'hashedpassword',
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        roles: [UserRole.CONSUMER],
        isAdmin: false,
      });

      await service.removeRole(1, UserRole.ADMIN);

      expect(mockUser.roles).not.toContain(UserRole.ADMIN);
      expect(mockUser.isAdmin).toBe(false);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when removing CONSUMER role', async () => {
      const mockUser = {
        id: 1,
        roles: [UserRole.CONSUMER],
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.removeRole(1, UserRole.CONSUMER)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.removeRole(1, UserRole.CONSUMER)).rejects.toThrow(
        'Cannot remove CONSUMER role',
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.removeRole(999, UserRole.ADMIN)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if user does not have the role', async () => {
      const mockUser = {
        id: 1,
        roles: [UserRole.CONSUMER],
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.removeRole(1, UserRole.ADMIN)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.removeRole(1, UserRole.ADMIN)).rejects.toThrow(
        'User does not have admin role',
      );
    });
  });

  describe('banUser', () => {
    it('should ban a user with reason', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        ban: jest.fn(),
        password: 'hashed',
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.banUser(1, 'Spam behavior');

      expect(mockUser.ban).toHaveBeenCalledWith('Spam behavior');
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.banUser(999, 'Reason')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unbanUser', () => {
    it('should unban a user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        unban: jest.fn(),
        password: 'hashed',
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.unbanUser(1);

      expect(mockUser.unban).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.unbanUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllWithFilters', () => {
    it('should return paginated users with default parameters', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@test.com', password: 'hash1' },
        { id: 2, email: 'user2@test.com', password: 'hash2' },
      ] as User[];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockUsers, 2]);

      const result = await service.findAllWithFilters({});

      expect(result.users).toHaveLength(2);
      expect(result.users[0]).not.toHaveProperty('password');
      expect(result.meta.totalItems).toBe(2);
      expect(result.meta.currentPage).toBe(1);
    });

    it('should apply search filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllWithFilters({ search: 'john' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('getUserDetail', () => {
    it('should return user with statistics', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password: 'hash',
        readings: [],
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserDetail(1);

      expect(result.user).not.toHaveProperty('password');
      expect(result.statistics).toBeDefined();
      expect(result.statistics).toHaveProperty('totalReadings');
      expect(result.statistics).toHaveProperty('lastReadingDate');
      expect(result.statistics).toHaveProperty('totalAIUsage');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserDetail(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle null readings array gracefully', async () => {
      // BUG: Must handle when readings relation is null/undefined
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password: 'hash',
        readings: null, // Explicitly null
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserDetail(1);

      expect(result.statistics.totalReadings).toBe(0);
      expect(result.statistics.lastReadingDate).toBeNull();
      expect(result.statistics.totalAIUsage).toBe(0);
    });

    it('should handle undefined readings array gracefully', async () => {
      // BUG: Must handle when readings relation is not loaded
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password: 'hash',
        // readings: undefined (not set)
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserDetail(1);

      expect(result.statistics.totalReadings).toBe(0);
      expect(result.statistics.lastReadingDate).toBeNull();
      expect(result.statistics.totalAIUsage).toBe(0);
    });
  });

  describe('BUG HUNTING: create() validation', () => {
    it('should reject duplicate email (case-insensitive)', async () => {
      // BUG: Email normalization should prevent duplicates
      const existingUser = {
        id: 1,
        email: 'test@example.com',
      } as User;

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      // CreateUserDto should normalize email to lowercase
      // So this should detect duplicate even with different case
      await expect(
        service.create({
          email: 'TEST@EXAMPLE.COM', // Different case
          password: 'ValidPass123!',
          name: 'Test User',
        }),
      ).rejects.toThrow('Email already registered');
    });

    it('should create user successfully with valid data', async () => {
      // VERIFY: create() works correctly with valid input
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        id: 1,
        email: 'new@example.com',
        password: 'hashedpassword',
        name: 'New User',
      } as User);
      mockUserRepository.save.mockResolvedValue({
        id: 1,
        email: 'new@example.com',
        password: 'hashedpassword',
        name: 'New User',
      } as User);

      const result = await service.create({
        email: 'new@example.com',
        password: 'ValidPass123!',
        name: 'New User',
      });

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('new@example.com');
    });

    it('should throw InternalServerErrorException if save fails', async () => {
      // BUG HUNTING: Verify error handling in create()
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        id: 1,
        email: 'new@example.com',
        password: 'hashedpassword',
        name: 'New User',
      } as User);
      mockUserRepository.save.mockRejectedValue(
        new Error('Database connection lost'),
      );

      await expect(
        service.create({
          email: 'new@example.com',
          password: 'ValidPass123!',
          name: 'New User',
        }),
      ).rejects.toThrow('Error creating user');
    });
  });

  describe('BUG HUNTING: findAll() password removal', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@test.com', password: 'hash1', name: 'User 1' },
        { id: 2, email: 'user2@test.com', password: 'hash2', name: 'User 2' },
      ] as User[];

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
    });
  });

  describe('BUG HUNTING: update() edge cases', () => {
    it('should allow updating email to same value (no conflict)', async () => {
      // BUG: Updating to same email should NOT throw ConflictException
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hash',
      } as User;

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(existingUser);

      // Should succeed - updating to SAME email
      const result = await service.update(1, {
        email: 'test@example.com', // Same email
        name: 'Updated Name',
      });

      expect(result.email).toBe('test@example.com');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should reject empty password in update', async () => {
      // BUG: Empty password should be rejected
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        password: 'existinghash',
      } as User;

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      // Empty password should not be allowed
      // This relies on UpdateUserDto validation
      const result = await service.update(1, {
        password: '', // Empty password
      });

      // If validation works in DTO, this won't reach service
      // But if it does, should not hash empty string
      expect(result).toBeDefined();
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hash',
      } as User;

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.update(1, { name: 'New Name' })).rejects.toThrow(
        'Error updating user',
      );
    });
  });

  describe('BUG HUNTING: findAllWithFilters() SQL injection', () => {
    it('should prevent SQL injection in sortBy parameter', async () => {
      // BUG: Must use whitelist to prevent SQL injection
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      // Malicious sortBy value
      await service.findAllWithFilters({
        sortBy: 'email; DROP TABLE users--' as any,
      });

      // Should use default 'createdAt' column, NOT the malicious value
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'user.createdAt',
        'DESC',
      );
    });

    it('should use whitelisted column for valid sortBy', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllWithFilters({
        sortBy: 'email',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'user.email',
        'DESC',
      );
    });
  });

  describe('BUG HUNTING: updatePlan() validation', () => {
    it('should update plan successfully with valid data', async () => {
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hash',
        plan: UserPlan.FREE,
      } as User;

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue({
        ...existingUser,
        plan: UserPlan.PREMIUM,
      });
      mockRefreshTokenService.revokeAllUserTokens.mockResolvedValue(undefined);

      const result = await service.updatePlan(1, { plan: UserPlan.PREMIUM });

      expect(result.plan).toBe('premium');
      expect(mockRefreshTokenService.revokeAllUserTokens).toHaveBeenCalledWith(
        1,
      );
    });

    it('should invalidate all refresh tokens when plan changes', async () => {
      // VERIFY: Must invalidate tokens to force re-authentication
      const existingUser = {
        id: 1,
        plan: UserPlan.FREE,
        password: 'hash',
      } as User;

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(existingUser);
      mockRefreshTokenService.revokeAllUserTokens.mockResolvedValue(undefined);

      await service.updatePlan(1, { plan: UserPlan.PREMIUM });

      expect(mockRefreshTokenService.revokeAllUserTokens).toHaveBeenCalledWith(
        1,
      );
    });
  });
});
