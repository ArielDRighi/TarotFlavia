import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
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
  });
});
