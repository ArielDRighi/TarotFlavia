import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from '../../common/enums/user-role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addTarotistRole: jest.fn(),
    addAdminRole: jest.fn(),
    removeRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
