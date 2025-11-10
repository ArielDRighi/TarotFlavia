import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { RefreshTokenService } from '../auth/refresh-token.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
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
});
