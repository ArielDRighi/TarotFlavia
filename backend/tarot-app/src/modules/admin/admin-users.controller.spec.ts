import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersController } from './admin-users.controller';
import { UsersService } from '../users/users.service';
import { NotFoundException } from '@nestjs/common';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserPlan } from '../users/entities/user.entity';

describe('AdminUsersController', () => {
  let controller: AdminUsersController;
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    roles: [UserRole.CONSUMER],
    plan: UserPlan.FREE,
    isAdmin: false,
    bannedAt: null,
    banReason: null,
    lastLogin: new Date(),
    createdAt: new Date(),
  };

  const mockUsersService = {
    findAllWithFilters: jest.fn(),
    getUserDetail: jest.fn(),
    banUser: jest.fn(),
    unbanUser: jest.fn(),
    updatePlan: jest.fn(),
    addTarotistRole: jest.fn(),
    addAdminRole: jest.fn(),
    removeRole: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<AdminUsersController>(AdminUsersController);
    usersService = module.get<UsersService>(UsersService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users with default parameters', async () => {
      const mockResponse = {
        users: [mockUser],
        meta: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 1,
          totalPages: 1,
        },
      };

      mockUsersService.findAllWithFilters.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(usersService.findAllWithFilters).toHaveBeenCalledWith({});
    });

    it('should pass query parameters to service', async () => {
      const query = {
        page: 2,
        limit: 20,
        search: 'test',
        role: UserRole.TAROTIST,
        banned: false,
      };

      const mockResponse = {
        users: [],
        meta: {
          currentPage: 2,
          itemsPerPage: 20,
          totalItems: 0,
          totalPages: 0,
        },
      };

      mockUsersService.findAllWithFilters.mockResolvedValue(mockResponse);

      await controller.findAll(query);

      expect(usersService.findAllWithFilters).toHaveBeenCalledWith(query);
    });
  });

  describe('getUserDetail', () => {
    it('should return detailed user information', async () => {
      const mockDetail = {
        user: mockUser,
        statistics: {
          totalReadings: 5,
          lastReadingDate: new Date(),
          totalAIUsage: 10,
        },
      };

      mockUsersService.getUserDetail.mockResolvedValue(mockDetail);

      const result = await controller.getUserDetail(1);

      expect(result).toEqual(mockDetail);
      expect(usersService.getUserDetail).toHaveBeenCalledWith(1);
    });
  });

  describe('banUser', () => {
    it('should ban a user with reason', async () => {
      const bannedUser = {
        ...mockUser,
        bannedAt: new Date(),
        banReason: 'Test reason',
      };
      mockUsersService.banUser.mockResolvedValue(bannedUser);

      const result = await controller.banUser(1, { reason: 'Test reason' });

      expect(result).toEqual({
        message: 'Usuario baneado exitosamente',
        user: bannedUser,
      });
      expect(usersService.banUser).toHaveBeenCalledWith(1, 'Test reason');
    });
  });

  describe('unbanUser', () => {
    it('should unban a user', async () => {
      const unbannedUser = { ...mockUser, bannedAt: null, banReason: null };
      mockUsersService.unbanUser.mockResolvedValue(unbannedUser);

      const result = await controller.unbanUser(1);

      expect(result).toEqual({
        message: 'Usuario desbaneado exitosamente',
        user: unbannedUser,
      });
      expect(usersService.unbanUser).toHaveBeenCalledWith(1);
    });
  });

  describe('updateUserPlan', () => {
    it('should update user plan', async () => {
      const updatedUser = { ...mockUser, plan: UserPlan.PREMIUM };
      mockUsersService.updatePlan.mockResolvedValue(updatedUser);

      const result = await controller.updateUserPlan(1, {
        plan: UserPlan.PREMIUM,
      });

      expect(result).toEqual({
        message: 'Plan actualizado exitosamente',
        user: updatedUser,
      });
      expect(usersService.updatePlan).toHaveBeenCalledWith(1, {
        plan: UserPlan.PREMIUM,
      });
    });
  });

  describe('addTarotistRole', () => {
    it('should add TAROTIST role', async () => {
      const updatedUser = {
        ...mockUser,
        roles: [UserRole.CONSUMER, UserRole.TAROTIST],
      };
      mockUsersService.addTarotistRole.mockResolvedValue(updatedUser);

      const result = await controller.addTarotistRole(1);

      expect(result).toEqual({
        message: 'Rol TAROTIST agregado exitosamente',
        user: updatedUser,
      });
      expect(usersService.addTarotistRole).toHaveBeenCalledWith(1);
    });
  });

  describe('addAdminRole', () => {
    it('should add ADMIN role', async () => {
      const updatedUser = {
        ...mockUser,
        roles: [UserRole.CONSUMER, UserRole.ADMIN],
        isAdmin: true,
      };
      mockUsersService.addAdminRole.mockResolvedValue(updatedUser);

      const result = await controller.addAdminRole(1);

      expect(result).toEqual({
        message: 'Rol ADMIN agregado exitosamente',
        user: updatedUser,
      });
      expect(usersService.addAdminRole).toHaveBeenCalledWith(1);
    });
  });

  describe('removeRole', () => {
    it('should remove TAROTIST role', async () => {
      const updatedUser = { ...mockUser, roles: [UserRole.CONSUMER] };
      mockUsersService.removeRole.mockResolvedValue(updatedUser);

      const result = await controller.removeRole(1, 'tarotist');

      expect(result).toEqual({
        message: 'Rol TAROTIST eliminado exitosamente',
        user: updatedUser,
      });
      expect(usersService.removeRole).toHaveBeenCalledWith(
        1,
        UserRole.TAROTIST,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      mockUsersService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.deleteUser(1);

      expect(result).toEqual({
        message: 'Usuario eliminado exitosamente',
      });
      expect(usersService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersService.remove.mockResolvedValue({ affected: 0 });

      await expect(controller.deleteUser(1)).rejects.toThrow(NotFoundException);
    });
  });
});
