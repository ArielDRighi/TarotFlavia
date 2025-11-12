import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersController } from './admin-users.controller';
import { UsersService } from '../users/users.service';
import { AuditLogService } from '../audit/audit-log.service';
import { NotFoundException } from '@nestjs/common';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserPlan } from '../users/entities/user.entity';

describe('AdminUsersController', () => {
  let controller: AdminUsersController;
  let usersService: UsersService;
  let auditLogService: AuditLogService;

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
    findById: jest.fn(),
    banUser: jest.fn(),
    unbanUser: jest.fn(),
    updatePlan: jest.fn(),
    addTarotistRole: jest.fn(),
    addAdminRole: jest.fn(),
    removeRole: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuditLogService = {
    log: jest.fn(),
    findAll: jest.fn(),
  };

  const mockAdminUser = { id: 999, roles: [UserRole.ADMIN] };
  const mockRequest = {
    ip: '127.0.0.1',
    headers: { 'user-agent': 'test-agent' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
      ],
    }).compile();

    controller = module.get<AdminUsersController>(AdminUsersController);
    usersService = module.get<UsersService>(UsersService);
    auditLogService = module.get<AuditLogService>(AuditLogService);

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
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.banUser.mockResolvedValue(bannedUser);
      mockAuditLogService.log.mockResolvedValue({});

      const result = await controller.banUser(
        1,
        { reason: 'Test reason' },
        mockAdminUser,
        mockRequest as any,
      );

      expect(result).toEqual({
        message: 'Usuario baneado exitosamente',
        user: bannedUser,
      });
      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(usersService.banUser).toHaveBeenCalledWith(1, 'Test reason');
      expect(auditLogService.log).toHaveBeenCalled();
    });
  });

  describe('unbanUser', () => {
    it('should unban a user', async () => {
      const unbannedUser = { ...mockUser, bannedAt: null, banReason: null };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.unbanUser.mockResolvedValue(unbannedUser);
      mockAuditLogService.log.mockResolvedValue({});

      const result = await controller.unbanUser(
        1,
        mockAdminUser,
        mockRequest as any,
      );

      expect(result).toEqual({
        message: 'Usuario desbaneado exitosamente',
        user: unbannedUser,
      });
      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(usersService.unbanUser).toHaveBeenCalledWith(1);
      expect(auditLogService.log).toHaveBeenCalled();
    });
  });

  describe('updateUserPlan', () => {
    it('should update user plan', async () => {
      const updatedUser = { ...mockUser, plan: UserPlan.PREMIUM };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.updatePlan.mockResolvedValue(updatedUser);
      mockAuditLogService.log.mockResolvedValue({});

      const result = await controller.updateUserPlan(
        1,
        { plan: UserPlan.PREMIUM },
        mockAdminUser,
        mockRequest as any,
      );

      expect(result).toEqual({
        message: 'Plan actualizado exitosamente',
        user: updatedUser,
      });
      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(usersService.updatePlan).toHaveBeenCalledWith(1, {
        plan: UserPlan.PREMIUM,
      });
      expect(auditLogService.log).toHaveBeenCalled();
    });
  });

  describe('addTarotistRole', () => {
    it('should add TAROTIST role', async () => {
      const updatedUser = {
        ...mockUser,
        roles: [UserRole.CONSUMER, UserRole.TAROTIST],
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.addTarotistRole.mockResolvedValue(updatedUser);
      mockAuditLogService.log.mockResolvedValue({});

      const result = await controller.addTarotistRole(
        1,
        mockAdminUser,
        mockRequest as any,
      );

      expect(result).toEqual({
        message: 'Rol TAROTIST agregado exitosamente',
        user: updatedUser,
      });
      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(usersService.addTarotistRole).toHaveBeenCalledWith(1);
      expect(auditLogService.log).toHaveBeenCalled();
    });
  });

  describe('addAdminRole', () => {
    it('should add ADMIN role', async () => {
      const updatedUser = {
        ...mockUser,
        roles: [UserRole.CONSUMER, UserRole.ADMIN],
        isAdmin: true,
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.addAdminRole.mockResolvedValue(updatedUser);
      mockAuditLogService.log.mockResolvedValue({});

      const result = await controller.addAdminRole(
        1,
        mockAdminUser,
        mockRequest as any,
      );

      expect(result).toEqual({
        message: 'Rol ADMIN agregado exitosamente',
        user: updatedUser,
      });
      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(usersService.addAdminRole).toHaveBeenCalledWith(1);
      expect(auditLogService.log).toHaveBeenCalled();
    });
  });

  describe('removeRole', () => {
    it('should remove TAROTIST role', async () => {
      const updatedUser = { ...mockUser, roles: [UserRole.CONSUMER] };
      mockUsersService.findById.mockResolvedValue({
        ...mockUser,
        roles: [UserRole.CONSUMER, UserRole.TAROTIST],
      });
      mockUsersService.removeRole.mockResolvedValue(updatedUser);
      mockAuditLogService.log.mockResolvedValue({});

      const result = await controller.removeRole(
        1,
        'tarotist',
        mockAdminUser,
        mockRequest as any,
      );

      expect(result).toEqual({
        message: 'Rol TAROTIST eliminado exitosamente',
        user: updatedUser,
      });
      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(usersService.removeRole).toHaveBeenCalledWith(
        1,
        UserRole.TAROTIST,
      );
      expect(auditLogService.log).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.remove.mockResolvedValue({ affected: 1 });
      mockAuditLogService.log.mockResolvedValue({});

      const result = await controller.deleteUser(
        1,
        mockAdminUser,
        mockRequest as any,
      );

      expect(result).toEqual({
        message: 'Usuario eliminado exitosamente',
      });
      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(usersService.remove).toHaveBeenCalledWith(1);
      expect(auditLogService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        controller.deleteUser(1, mockAdminUser, mockRequest as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
