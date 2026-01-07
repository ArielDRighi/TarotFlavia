import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersOrchestratorService } from '../../application/services/users-orchestrator.service';
import { UsageLimitsService } from '../../../usage-limits/usage-limits.service';
import { PlanConfigService } from '../../../plan-config/plan-config.service';
import { UserRole } from '../../../../common/enums/user-role.enum';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { UpdatePasswordDto } from '../../application/dto/update-password.dto';
import { UpdateUserPlanDto } from '../../application/dto/update-user-plan.dto';
import { User, UserPlan } from '../../entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersOrchestratorService;
  let usageLimitsService: UsageLimitsService;
  let planConfigService: PlanConfigService;

  const mockUser: Partial<User> = {
    id: 1,
    email: 'test@test.com',
    name: 'Test User',
    plan: UserPlan.FREE,
    roles: [UserRole.CONSUMER],
    password: 'hashedPassword',
  };

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    updatePassword: jest.fn(),
    updatePlan: jest.fn(),
    remove: jest.fn(),
    addTarotistRole: jest.fn(),
    addAdminRole: jest.fn(),
    removeRole: jest.fn(),
  };

  const mockUsageLimitsService = {
    getRemainingUsage: jest.fn(),
    checkLimit: jest.fn(),
    incrementUsage: jest.fn(),
  };

  const mockPlanConfigService = {
    getReadingsLimit: jest.fn(),
    getDailyCardLimit: jest.fn(),
    getTarotReadingsLimit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersOrchestratorService,
          useValue: mockUsersService,
        },
        {
          provide: UsageLimitsService,
          useValue: mockUsageLimitsService,
        },
        {
          provide: PlanConfigService,
          useValue: mockPlanConfigService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersOrchestratorService>(UsersOrchestratorService);
    usageLimitsService = module.get<UsageLimitsService>(UsageLimitsService);
    planConfigService = module.get<PlanConfigService>(PlanConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockPlanConfigService.getDailyCardLimit.mockResolvedValue(1); // FREE plan daily card limit
      mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(1); // FREE plan tarot readings limit
      mockPlanConfigService.getReadingsLimit.mockResolvedValue(2); // Legacy deprecated field
      mockUsageLimitsService.getRemainingUsage
        .mockResolvedValueOnce(1) // daily card remaining
        .mockResolvedValueOnce(1) // tarot readings remaining
        .mockResolvedValueOnce(1); // legacy readings remaining

      const req = { user: { userId: 1 } };
      const result = await controller.getProfile(req);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(planConfigService.getDailyCardLimit).toHaveBeenCalledWith(
        UserPlan.FREE,
      );
      expect(planConfigService.getTarotReadingsLimit).toHaveBeenCalledWith(
        UserPlan.FREE,
      );
      expect(usageLimitsService.getRemainingUsage).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(1);
      expect(result.email).toBe('test@test.com');
      
      // Check new separate fields
      expect(result.dailyCardCount).toBe(0); // 1 - 1 = 0
      expect(result.dailyCardLimit).toBe(1);
      expect(result.tarotReadingsCount).toBe(0); // 1 - 1 = 0
      expect(result.tarotReadingsLimit).toBe(1);
      
      // Check deprecated fields are still present  
      expect(result.dailyReadingsCount).toBeDefined();
      expect(result.dailyReadingsLimit).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      const req = { user: { userId: 999 } };

      await expect(controller.getProfile(req)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getProfile(req)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });

    it('should handle unlimited plan (premium/professional)', async () => {
      const premiumUser = { ...mockUser, plan: UserPlan.PREMIUM };
      mockUsersService.findById.mockResolvedValue(premiumUser);
      mockPlanConfigService.getDailyCardLimit.mockResolvedValue(1); // PREMIUM daily card limit
      mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(3); // PREMIUM tarot readings limit
      mockPlanConfigService.getReadingsLimit.mockResolvedValue(4); // Legacy deprecated field
      mockUsageLimitsService.getRemainingUsage
        .mockResolvedValueOnce(1) // daily card remaining
        .mockResolvedValueOnce(3) // tarot readings remaining
        .mockResolvedValueOnce(3); // legacy readings remaining

      const req = { user: { userId: 1 } };
      const result = await controller.getProfile(req);

      // Check new separate fields
      expect(result.dailyCardCount).toBe(0); // daily card limit - remaining
      expect(result.dailyCardLimit).toBe(1);
      expect(result.tarotReadingsCount).toBe(0); // tarot readings limit - remaining
      expect(result.tarotReadingsLimit).toBe(3);
      
      // Check deprecated fields are still present
      expect(result.dailyReadingsCount).toBeDefined();
      expect(result.dailyReadingsLimit).toBeDefined();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateDto: UpdateUserDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const req = { user: { userId: 1 } };
      const result = await controller.updateProfile(req, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        currentPassword: 'currentPass123',
        newPassword: 'newPassword456',
      };

      mockUsersService.updatePassword.mockResolvedValue(undefined);

      const req = { user: { userId: 1 } };
      const result = await controller.updatePassword(req, updatePasswordDto);

      expect(service.updatePassword).toHaveBeenCalledWith(
        1,
        'currentPass123',
        'newPassword456',
      );
      expect(result.message).toBe('Contraseña actualizada exitosamente');
    });

    it('should handle BadRequestException from service', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword456',
      };

      mockUsersService.updatePassword.mockRejectedValue(
        new BadRequestException('Current password is incorrect'),
      );

      const req = { user: { userId: 1 } };

      await expect(
        controller.updatePassword(req, updatePasswordDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.updatePassword(req, updatePasswordDto),
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should handle NotFoundException from service', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        currentPassword: 'currentPass123',
        newPassword: 'newPassword456',
      };

      mockUsersService.updatePassword.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      const req = { user: { userId: 999 } };

      await expect(
        controller.updatePassword(req, updatePasswordDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.updatePassword(req, updatePasswordDto),
      ).rejects.toThrow('User with ID 999 not found');
    });
  });

  describe('findAll', () => {
    it('should return all users if user is admin', async () => {
      const users = [mockUser, { ...mockUser, id: 2 }];
      mockUsersService.findAll.mockResolvedValue(users);

      const req = { user: { isAdmin: true } };
      const result = await controller.findAll(req);

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it('should throw ForbiddenException if user is not admin', async () => {
      const req = { user: { isAdmin: false } };

      await expect(controller.findAll(req)).rejects.toThrow(ForbiddenException);
      await expect(controller.findAll(req)).rejects.toThrow(
        'Acceso denegado: se requieren permisos de administrador',
      );
      expect(service.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return user if accessing own profile', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const req = { user: { userId: 1, isAdmin: false } };
      const result = await controller.findOne(req, 1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(1);
    });

    it('should return user if admin accessing another profile', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const req = { user: { userId: 999, isAdmin: true } };
      const result = await controller.findOne(req, 1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ForbiddenException if non-admin accessing another profile', async () => {
      const req = { user: { userId: 2, isAdmin: false } };

      await expect(controller.findOne(req, 1)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(controller.findOne(req, 1)).rejects.toThrow(
        'Acceso denegado',
      );
      expect(service.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      const req = { user: { userId: 1, isAdmin: false } };

      await expect(controller.findOne(req, 1)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.findOne(req, 1)).rejects.toThrow(
        'Usuario con ID 1 no encontrado',
      );
    });
  });

  describe('remove', () => {
    it('should remove user if deleting own account', async () => {
      mockUsersService.remove.mockResolvedValue({ affected: 1 });

      const req = { user: { userId: 1, isAdmin: false } };
      const result = await controller.remove(req, 1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result.message).toBe('Usuario eliminado exitosamente');
    });

    it('should remove user if admin', async () => {
      mockUsersService.remove.mockResolvedValue({ affected: 1 });

      const req = { user: { userId: 999, isAdmin: true } };
      const result = await controller.remove(req, 1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result.message).toBe('Usuario eliminado exitosamente');
    });

    it('should throw ForbiddenException if non-admin deleting another account', async () => {
      const req = { user: { userId: 2, isAdmin: false } };

      await expect(controller.remove(req, 1)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(controller.remove(req, 1)).rejects.toThrow(
        'Acceso denegado',
      );
      expect(service.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.remove.mockResolvedValue({ affected: 0 });

      const req = { user: { userId: 1, isAdmin: false } };

      await expect(controller.remove(req, 1)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.remove(req, 1)).rejects.toThrow(
        'Usuario con ID 1 no encontrado',
      );
    });
  });

  describe('updateUserPlan', () => {
    it('should update user plan successfully', async () => {
      const planDto: UpdateUserPlanDto = { plan: UserPlan.PREMIUM };
      const updatedUser = { ...mockUser, plan: UserPlan.PREMIUM };

      mockUsersService.updatePlan.mockResolvedValue(updatedUser);

      const result = await controller.updateUserPlan(1, planDto);

      expect(service.updatePlan).toHaveBeenCalledWith(1, planDto);
      expect(result.message).toContain('Plan actualizado exitosamente');
      expect(result.user).toEqual(updatedUser);
    });
  });

  describe('addTarotistRole', () => {
    it('should add tarotist role successfully', async () => {
      const userWithRole = {
        ...mockUser,
        roles: [UserRole.CONSUMER, UserRole.TAROTIST],
      };
      mockUsersService.addTarotistRole.mockResolvedValue(userWithRole);

      const result = await controller.addTarotistRole(1);

      expect(service.addTarotistRole).toHaveBeenCalledWith(1);
      expect(result.message).toBe('Rol TAROTIST agregado exitosamente');
      expect(result.user).toEqual(userWithRole);
    });
  });

  describe('addAdminRole', () => {
    it('should add admin role successfully', async () => {
      const userWithRole = {
        ...mockUser,
        roles: [UserRole.CONSUMER, UserRole.ADMIN],
      };
      mockUsersService.addAdminRole.mockResolvedValue(userWithRole);

      const result = await controller.addAdminRole(1);

      expect(service.addAdminRole).toHaveBeenCalledWith(1);
      expect(result.message).toBe('Rol ADMIN agregado exitosamente');
      expect(result.user).toEqual(userWithRole);
    });
  });

  describe('removeRole', () => {
    it('should accept lowercase role and convert to enum', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        roles: [UserRole.CONSUMER],
      };

      mockUsersService.removeRole.mockResolvedValue(mockUser);

      const result = await controller.removeRole(1, 'admin');

      expect(service.removeRole).toHaveBeenCalledWith(1, UserRole.ADMIN);
      expect(result.message).toBe('Rol ADMIN eliminado exitosamente');
    });

    it('should accept uppercase role and convert to lowercase enum', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        roles: [UserRole.CONSUMER],
      };

      mockUsersService.removeRole.mockResolvedValue(mockUser);

      const result = await controller.removeRole(1, 'TAROTIST');

      expect(service.removeRole).toHaveBeenCalledWith(1, UserRole.TAROTIST);
      expect(result.message).toBe('Rol TAROTIST eliminado exitosamente');
    });

    it('should accept mixed case role and normalize correctly', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        roles: [UserRole.CONSUMER],
      };

      mockUsersService.removeRole.mockResolvedValue(mockUser);

      const result = await controller.removeRole(1, 'TaRoTiSt');

      expect(service.removeRole).toHaveBeenCalledWith(1, UserRole.TAROTIST);
      expect(result.message).toBe('Rol TAROTIST eliminado exitosamente');
    });

    it('should throw BadRequestException for invalid role', async () => {
      await expect(controller.removeRole(1, 'invalid-role')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.removeRole(1, 'invalid-role')).rejects.toThrow(
        'Rol inválido',
      );
      expect(service.removeRole).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for empty role', async () => {
      await expect(controller.removeRole(1, '')).rejects.toThrow(
        BadRequestException,
      );
      expect(service.removeRole).not.toHaveBeenCalled();
    });
  });
});
