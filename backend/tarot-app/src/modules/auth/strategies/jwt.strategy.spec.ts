import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../../common/enums/user-role.enum';
import { UserPlan } from '../../users/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: UsersService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

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
    isBanned: jest.fn().mockReturnValue(false),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const validPayload = {
      sub: 1,
      email: 'test@example.com',
      isAdmin: false,
      plan: 'free',
    };

    it('should return user data for valid non-banned user', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate(validPayload);

      expect(result).toEqual({
        userId: 1,
        email: 'test@example.com',
        isAdmin: false,
        roles: [],
        plan: 'free',
      });
      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(mockUser.isBanned).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(strategy.validate(validPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(validPayload)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });

    it('should throw UnauthorizedException if user is banned', async () => {
      const bannedUser = {
        ...mockUser,
        bannedAt: new Date(),
        banReason: 'Violación de términos',
        isBanned: jest.fn().mockReturnValue(true),
      };
      mockUsersService.findById.mockResolvedValue(bannedUser);

      await expect(strategy.validate(validPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(validPayload)).rejects.toThrow(
        'Usuario baneado: Violación de términos',
      );
    });

    it('should throw UnauthorizedException with generic message if banned without reason', async () => {
      const bannedUser = {
        ...mockUser,
        bannedAt: new Date(),
        banReason: null,
        isBanned: jest.fn().mockReturnValue(true),
      };
      mockUsersService.findById.mockResolvedValue(bannedUser);

      await expect(strategy.validate(validPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(validPayload)).rejects.toThrow(
        'Usuario baneado',
      );
    });

    it('should handle admin users correctly', async () => {
      const adminPayload = {
        ...validPayload,
        isAdmin: true,
      };
      mockUsersService.findById.mockResolvedValue({
        ...mockUser,
        isAdmin: true,
      });

      const result = await strategy.validate(adminPayload);

      expect(result.isAdmin).toBe(true);
    });
  });
});
