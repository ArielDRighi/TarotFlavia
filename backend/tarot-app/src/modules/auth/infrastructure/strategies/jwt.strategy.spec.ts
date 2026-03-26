import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../../../common/enums/user-role.enum';
import { UserPlan } from '../../../users/entities/user.entity';

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
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
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

    it('should return isAdmin from DB, not from JWT payload', async () => {
      // JWT payload dice isAdmin: false, pero DB tiene isAdmin: true
      const payloadWithFalseAdmin = {
        ...validPayload,
        isAdmin: false,
      };
      const dbUserWithAdmin = {
        ...mockUser,
        isAdmin: true,
        isBanned: jest.fn().mockReturnValue(false),
      };
      mockUsersService.findById.mockResolvedValue(dbUserWithAdmin);

      const result = await strategy.validate(payloadWithFalseAdmin);

      expect(result.isAdmin).toBe(true);
    });

    it('should return roles from DB, not from JWT payload', async () => {
      // JWT payload no trae roles, pero DB tiene TAROTIST
      const payloadWithoutRoles = {
        sub: 1,
        email: 'test@example.com',
      };
      const dbUserWithTarotistRole = {
        ...mockUser,
        roles: [UserRole.CONSUMER, UserRole.TAROTIST],
        isBanned: jest.fn().mockReturnValue(false),
      };
      mockUsersService.findById.mockResolvedValue(dbUserWithTarotistRole);

      const result = await strategy.validate(payloadWithoutRoles);

      expect(result.roles).toEqual([UserRole.CONSUMER, UserRole.TAROTIST]);
    });

    it('should return plan from DB when DB plan differs from JWT payload', async () => {
      // Caso crítico: JWT dice free, DB tiene premium (webhook actualizó la DB)
      const staleJwtPayload = {
        sub: 1,
        email: 'test@example.com',
        plan: 'free', // JWT desactualizado
      };
      const dbUserWithPremium = {
        ...mockUser,
        plan: UserPlan.PREMIUM, // DB actualizada por webhook
        isBanned: jest.fn().mockReturnValue(false),
      };
      mockUsersService.findById.mockResolvedValue(dbUserWithPremium);

      const result = await strategy.validate(staleJwtPayload);

      // Debe retornar 'premium' de la DB, ignorando el JWT
      expect(result.plan).toBe(UserPlan.PREMIUM);
    });

    it('should return free plan from DB when JWT has no plan field', async () => {
      const payloadWithoutPlan = {
        sub: 1,
        email: 'test@example.com',
      };
      const dbUserFree = {
        ...mockUser,
        plan: UserPlan.FREE,
        isBanned: jest.fn().mockReturnValue(false),
      };
      mockUsersService.findById.mockResolvedValue(dbUserFree);

      const result = await strategy.validate(payloadWithoutPlan);

      expect(result.plan).toBe(UserPlan.FREE);
    });

    it('should handle admin users reading isAdmin from DB correctly', async () => {
      const adminPayload = {
        ...validPayload,
        isAdmin: true,
      };
      const adminDbUser = {
        ...mockUser,
        isAdmin: true,
        isBanned: jest.fn().mockReturnValue(false),
      };
      mockUsersService.findById.mockResolvedValue(adminDbUser);

      const result = await strategy.validate(adminPayload);

      expect(result.isAdmin).toBe(true);
    });

    it('should not expose tarotistaId when not present in payload', async () => {
      mockUsersService.findById.mockResolvedValue({
        ...mockUser,
        isBanned: jest.fn().mockReturnValue(false),
      });

      const result = await strategy.validate(validPayload);

      expect(result).not.toHaveProperty('tarotistaId');
    });

    it('should include tarotistaId when present in payload', async () => {
      const payloadWithTarotistaId = {
        ...validPayload,
        tarotistaId: 42,
      };
      mockUsersService.findById.mockResolvedValue({
        ...mockUser,
        isBanned: jest.fn().mockReturnValue(false),
      });

      const result = await strategy.validate(payloadWithTarotistaId);

      expect(result.tarotistaId).toBe(42);
    });
  });
});
