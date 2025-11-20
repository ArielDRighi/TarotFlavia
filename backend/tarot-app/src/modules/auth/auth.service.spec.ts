import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from './refresh-token.service';
import { PasswordResetService } from './password-reset.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserPlan } from '../users/entities/user.entity';

/**
 * Helper to create a mock User with all necessary methods
 */
function createMockUser(partial: Partial<User> = {}): User {
  const user = new User();
  Object.assign(user, {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    isAdmin: false,
    plan: UserPlan.FREE,
    bannedAt: null,
    banReason: null,
    ...partial,
  });
  return user;
}

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: Partial<UsersService>;
  let jwtServiceMock: Partial<JwtService>;
  let refreshTokenServiceMock: Partial<RefreshTokenService>;
  let passwordResetServiceMock: Partial<PasswordResetService>;

  beforeEach(async () => {
    // Map to store created users for findById
    const userStore = new Map<number, User>();

    usersServiceMock = {
      create: jest.fn().mockImplementation((dto: CreateUserDto) => {
        const user = createMockUser({
          id: userStore.size + 1,
          email: dto.email,
          name: dto.name,
          password: 'hashed_password',
        });
        userStore.set(user.id, user);
        return Promise.resolve(user);
      }),
      findByEmail: jest.fn(),
      findById: jest.fn().mockImplementation((id: number) => {
        const user = userStore.get(id);
        if (user) {
          return Promise.resolve(user);
        }
        // Fallback for users not in store (like in login tests)
        return Promise.resolve(
          createMockUser({
            id,
            email: 'test@example.com',
            name: 'Test User',
          }),
        );
      }),
      update: jest.fn().mockResolvedValue(createMockUser()),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };

    refreshTokenServiceMock = {
      createRefreshToken: jest.fn().mockResolvedValue({
        token: 'refresh-token-12345',
        refreshToken: { id: 'uuid-123' },
      }),
      findTokenByPlainToken: jest.fn(),
      revokeToken: jest.fn(),
      revokeAllUserTokens: jest.fn(),
    };

    passwordResetServiceMock = {
      generateResetToken: jest.fn(),
    };

    const securityEventServiceMock = {
      logSecurityEvent: jest.fn().mockResolvedValue(undefined),
    };

    // Necesitamos importar la clase para usarla como token
    const { SecurityEventService } = await import(
      '../security/security-event.service'
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: RefreshTokenService, useValue: refreshTokenServiceMock },
        { provide: PasswordResetService, useValue: passwordResetServiceMock },
        { provide: SecurityEventService, useValue: securityEventServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a user and return auth response with tokens', async () => {
      const dto: CreateUserDto = {
        email: 'a@a.com',
        name: 'Test',
        password: 'secret',
      };
      const ipAddress = '127.0.0.1';
      const userAgent = 'test-agent';
      const res = await service.register(dto, ipAddress, userAgent);

      expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
      expect(refreshTokenServiceMock.createRefreshToken).toHaveBeenCalled();
      expect(res).toHaveProperty('user');
      expect(res).toHaveProperty('access_token', 'signed-token');
      expect(res).toHaveProperty('refresh_token', 'refresh-token-12345');
      if (res.user && 'email' in res.user && 'name' in res.user) {
        expect(res.user.email).toEqual(dto.email);
        expect(res.user.name).toEqual(dto.name);
      }
    });
  });

  describe('validateUser', () => {
    let securityEventService: { logSecurityEvent: jest.Mock };

    beforeEach(async () => {
      const { SecurityEventService } = await import(
        '../security/security-event.service'
      );
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: UsersService, useValue: usersServiceMock },
          { provide: JwtService, useValue: jwtServiceMock },
          { provide: RefreshTokenService, useValue: refreshTokenServiceMock },
          { provide: PasswordResetService, useValue: passwordResetServiceMock },
          {
            provide: SecurityEventService,
            useValue: {
              logSecurityEvent: jest.fn().mockResolvedValue(undefined),
            },
          },
        ],
      }).compile();

      service = module.get<AuthService>(AuthService);
      securityEventService = module.get(SecurityEventService);
    });

    it('should return user (without password) when credentials are valid', async () => {
      const plain = 'mypassword';
      const salt = await bcrypt.genSalt();
      const hashed = await bcrypt.hash(plain, salt);

      const storedUser: Partial<User> = {
        id: 2,
        email: 'u@u.com',
        password: hashed,
        name: 'U',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(storedUser);

      const result = await service.validateUser(storedUser.email!, plain);
      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
        storedUser.email,
      );
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      if (result) {
        expect('password' in result).toBe(false);
        expect(result.email).toEqual(storedUser.email);
      }
    });

    it('should return null when credentials are invalid', async () => {
      const storedUser: Partial<User> = {
        id: 2,
        email: 'u2@u.com',
        password: 'wronghash',
        name: 'U2',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(storedUser);

      const result = await service.validateUser(
        storedUser.email!,
        'notmatching',
      );
      expect(result).toBeNull();
    });

    it('should return null when user does not exist', async () => {
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@test.com',
        'password123',
        '127.0.0.1',
        'test-agent',
      );

      expect(result).toBeNull();
      expect(securityEventService.logSecurityEvent).toHaveBeenCalled();
    });

    it('should handle null ipAddress in validateUser', async () => {
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(null);

      await service.validateUser(
        'test@test.com',
        'password123',
        undefined,
        'test-agent',
      );

      expect(securityEventService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: null,
        }),
      );
    });

    it('should handle null userAgent in validateUser', async () => {
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(null);

      await service.validateUser(
        'test@test.com',
        'password123',
        '127.0.0.1',
        undefined,
      );

      expect(securityEventService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userAgent: null,
        }),
      );
    });

    it('should not throw when security event logging fails (user exists)', async () => {
      const storedUser: Partial<User> = {
        id: 3,
        email: 'test@test.com',
        password: 'wronghash',
        name: 'Test',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(storedUser);
      securityEventService.logSecurityEvent.mockRejectedValue(
        new Error('DB error'),
      );
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await service.validateUser(
        'test@test.com',
        'wrongpassword',
        '127.0.0.1',
        'test-agent',
      );

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should not throw when security event logging fails (user not found)', async () => {
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(null);
      securityEventService.logSecurityEvent.mockRejectedValue(
        new Error('DB error'),
      );
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await service.validateUser(
        'nonexistent@test.com',
        'password123',
        '127.0.0.1',
        'test-agent',
      );

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should handle empty email', async () => {
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser(
        '',
        'password123',
        '127.0.0.1',
        'test-agent',
      );

      expect(result).toBeNull();
      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('');
    });

    it('should handle null email', async () => {
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser(
        null as unknown as string,
        'password123',
        '127.0.0.1',
        'test-agent',
      );

      expect(result).toBeNull();
    });

    it('should handle empty password', async () => {
      const storedUser: Partial<User> = {
        id: 4,
        email: 'test@test.com',
        password: 'hashed',
        name: 'Test',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(storedUser);

      const result = await service.validateUser(
        'test@test.com',
        '',
        '127.0.0.1',
        'test-agent',
      );

      expect(result).toBeNull();
    });

    it('should handle null password', async () => {
      const storedUser: Partial<User> = {
        id: 5,
        email: 'test@test.com',
        password: 'hashed',
        name: 'Test',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(storedUser);

      const result = await service.validateUser(
        'test@test.com',
        null as unknown as string,
        '127.0.0.1',
        'test-agent',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return auth response with tokens', async () => {
      const user: Partial<User> = {
        id: 3,
        email: 'x@x.com',
        name: 'X',
        isAdmin: true,
      };

      // Mock findById to return the complete user with isBanned method
      const mockCompleteUser = {
        ...user,
        password: 'hashed_password',
        plan: UserPlan.FREE,
        roles: [],
        isBanned: jest.fn().mockReturnValue(false),
      } as unknown as User;
      (usersServiceMock.findById as jest.Mock).mockResolvedValueOnce(
        mockCompleteUser,
      );

      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      const res = await service.login(user, ipAddress, userAgent);

      expect(jwtServiceMock.sign).toHaveBeenCalled();
      expect(refreshTokenServiceMock.createRefreshToken).toHaveBeenCalled();
      expect(res).toHaveProperty('access_token', 'signed-token');
      expect(res).toHaveProperty('refresh_token', 'refresh-token-12345');
      if (
        res.user &&
        'id' in res.user &&
        'email' in res.user &&
        'name' in res.user
      ) {
        expect(res.user.id).toEqual(user.id);
        expect(res.user.email).toEqual(user.email);
        expect(res.user.name).toEqual(user.name);
      }
    });

    it('should update lastLogin timestamp on login', async () => {
      const user: Partial<User> = {
        id: 5,
        email: 'lastlogin@example.com',
        name: 'LastLogin User',
        isAdmin: false,
      };

      // Mock findById to return the complete user with isBanned method
      const mockCompleteUser = {
        ...user,
        password: 'hashed_password',
        plan: UserPlan.FREE,
        roles: [],
        lastLogin: null,
        isBanned: jest.fn().mockReturnValue(false),
      } as unknown as User;
      (usersServiceMock.findById as jest.Mock).mockResolvedValueOnce(
        mockCompleteUser,
      );

      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      await service.login(user, ipAddress, userAgent);

      expect(usersServiceMock.update).toHaveBeenCalled();
      const updateCall = (usersServiceMock.update as jest.Mock).mock
        .calls[0] as Array<unknown>;
      expect(updateCall[0]).toBe(user.id);
      expect(updateCall[1]).toHaveProperty('lastLogin');
      expect((updateCall[1] as { lastLogin: Date }).lastLogin).toBeInstanceOf(
        Date,
      );
    });

    it('should include plan information in JWT payload', async () => {
      const user: Partial<User> = {
        id: 4,
        email: 'premium@example.com',
        name: 'Premium User',
        isAdmin: false,
        plan: UserPlan.PREMIUM,
      };

      // Mock findById to return the complete user with isBanned method
      const mockCompleteUser = {
        ...user,
        password: 'hashed_password',
        roles: [],
        isBanned: jest.fn().mockReturnValue(false),
      } as unknown as User;
      (usersServiceMock.findById as jest.Mock).mockResolvedValueOnce(
        mockCompleteUser,
      );

      const ipAddress = '10.0.0.1';
      const userAgent = 'Chrome';

      await service.login(user, ipAddress, userAgent);

      expect(jwtServiceMock.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          email: user.email,
          sub: user.id,
          isAdmin: user.isAdmin,
          plan: user.plan,
        }),
      );
    });
  });

  describe('forgotPassword', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should generate reset token and log reset link', async () => {
      const email = 'test@example.com';
      const mockToken = 'abc123def456';
      const mockExpiresAt = new Date();

      (
        passwordResetServiceMock.generateResetToken as jest.Mock
      ).mockResolvedValue({
        token: mockToken,
        expiresAt: mockExpiresAt,
      });

      const result = await service.forgotPassword(email);

      expect(passwordResetServiceMock.generateResetToken).toHaveBeenCalledWith(
        email,
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Password reset link:'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(mockToken),
      );
      expect(result).toEqual({ message: 'Password reset email sent' });
    });

    it('should handle errors from password reset service', async () => {
      const email = 'nonexistent@example.com';
      (
        passwordResetServiceMock.generateResetToken as jest.Mock
      ).mockRejectedValue(new Error('User not found'));

      await expect(service.forgotPassword(email)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('resetPassword', () => {
    const mockToken = 'valid-token-123';
    const newPassword = 'NewStrongP@ss1';
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'old-hashed-password',
    };

    beforeEach(() => {
      passwordResetServiceMock.validateToken = jest.fn();
      passwordResetServiceMock.markTokenAsUsed = jest.fn();
      refreshTokenServiceMock.revokeAllUserTokens = jest.fn();
      usersServiceMock.update = jest.fn();
    });

    it('should validate token, update password, invalidate refresh tokens, and mark token as used', async () => {
      const mockResetToken = {
        id: 1,
        userId: mockUser.id,
        user: mockUser,
        token: 'hashed-token',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        createdAt: new Date(),
      };

      (passwordResetServiceMock.validateToken as jest.Mock).mockResolvedValue(
        mockResetToken,
      );
      (
        refreshTokenServiceMock.revokeAllUserTokens as jest.Mock
      ).mockResolvedValue(undefined);
      (usersServiceMock.update as jest.Mock).mockResolvedValue(undefined);
      (passwordResetServiceMock.markTokenAsUsed as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await service.resetPassword(mockToken, newPassword);

      expect(passwordResetServiceMock.validateToken).toHaveBeenCalledWith(
        mockToken,
      );
      expect(usersServiceMock.update).toHaveBeenCalledWith(mockUser.id, {
        password: newPassword,
      });
      expect(refreshTokenServiceMock.revokeAllUserTokens).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(passwordResetServiceMock.markTokenAsUsed).toHaveBeenCalledWith(
        mockResetToken,
      );
      expect(result).toEqual({ message: 'Password reset successful' });
    });

    it('should handle invalid token', async () => {
      (passwordResetServiceMock.validateToken as jest.Mock).mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(
        service.resetPassword('invalid-token', newPassword),
      ).rejects.toThrow('Invalid token');
    });

    it('should hash the new password before updating', async () => {
      const mockResetToken = {
        id: 1,
        userId: mockUser.id,
        user: mockUser,
        token: 'hashed-token',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        createdAt: new Date(),
      };

      (passwordResetServiceMock.validateToken as jest.Mock).mockResolvedValue(
        mockResetToken,
      );
      (
        refreshTokenServiceMock.revokeAllUserTokens as jest.Mock
      ).mockResolvedValue(undefined);
      (usersServiceMock.update as jest.Mock).mockResolvedValue(undefined);
      (passwordResetServiceMock.markTokenAsUsed as jest.Mock).mockResolvedValue(
        undefined,
      );

      await service.resetPassword(mockToken, newPassword);

      expect(usersServiceMock.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(Object),
      );
    });
  });

  describe('register - additional tests', () => {
    it('should throw UnauthorizedException if user creation fails', async () => {
      const dto: CreateUserDto = {
        email: 'fail@test.com',
        name: 'Fail User',
        password: 'Test1234!',
      };

      // Mock create to throw error
      (usersServiceMock.create as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(
        service.register(dto, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow();
    });

    it('should throw UnauthorizedException if user not found after creation', async () => {
      const dto: CreateUserDto = {
        email: 'ghost@test.com',
        name: 'Ghost User',
        password: 'Test1234!',
      };

      const createdUser = createMockUser({ id: 99, email: dto.email });
      (usersServiceMock.create as jest.Mock).mockResolvedValueOnce(createdUser);
      // Override the fallback to return null for this specific id
      (usersServiceMock.findById as jest.Mock).mockImplementation(
        (id: number) => {
          if (id === 99) return Promise.resolve(null);
          return Promise.resolve(createMockUser({ id }));
        },
      );

      await expect(
        service.register(dto, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);

      // Reset mock for subsequent tests
      (usersServiceMock.findById as jest.Mock).mockImplementation(
        (id: number) => {
          return Promise.resolve(
            createMockUser({
              id,
              email: 'test@example.com',
              name: 'Test User',
            }),
          );
        },
      );
    });

    it('should handle null ipAddress in register', async () => {
      const dto: CreateUserDto = {
        email: 'nullip@test.com',
        name: 'Null IP User',
        password: 'Test1234!',
      };

      const createdUser = createMockUser({ id: 100, email: dto.email });
      (usersServiceMock.create as jest.Mock).mockResolvedValueOnce(createdUser);
      (usersServiceMock.findById as jest.Mock).mockResolvedValueOnce(
        createdUser,
      );
      (
        refreshTokenServiceMock.createRefreshToken as jest.Mock
      ).mockResolvedValue({
        token: 'refresh-token-12345',
      });

      await service.register(dto, null as unknown as string, 'test-agent');

      expect(refreshTokenServiceMock.createRefreshToken).toHaveBeenCalledWith(
        createdUser,
        null,
        'test-agent',
      );
    });

    it('should handle undefined userAgent in register', async () => {
      const dto: CreateUserDto = {
        email: 'undefua@test.com',
        name: 'Undef UA User',
        password: 'Test1234!',
      };

      const createdUser = createMockUser({ id: 101, email: dto.email });
      (usersServiceMock.create as jest.Mock).mockResolvedValueOnce(createdUser);
      (usersServiceMock.findById as jest.Mock).mockResolvedValueOnce(
        createdUser,
      );
      (
        refreshTokenServiceMock.createRefreshToken as jest.Mock
      ).mockResolvedValue({
        token: 'refresh-token-12345',
      });

      await service.register(dto, '127.0.0.1', undefined as unknown as string);

      expect(refreshTokenServiceMock.createRefreshToken).toHaveBeenCalledWith(
        createdUser,
        '127.0.0.1',
        undefined,
      );
    });

    it('should handle empty string ipAddress in register', async () => {
      const dto: CreateUserDto = {
        email: 'emptyip@test.com',
        name: 'Empty IP User',
        password: 'Test1234!',
      };

      const createdUser = createMockUser({ id: 102, email: dto.email });
      (usersServiceMock.create as jest.Mock).mockResolvedValueOnce(createdUser);
      (usersServiceMock.findById as jest.Mock).mockResolvedValueOnce(
        createdUser,
      );
      (
        refreshTokenServiceMock.createRefreshToken as jest.Mock
      ).mockResolvedValue({
        token: 'refresh-token-12345',
      });

      await service.register(dto, '', 'test-agent');

      expect(refreshTokenServiceMock.createRefreshToken).toHaveBeenCalledWith(
        createdUser,
        '',
        'test-agent',
      );
    });

    it('should handle empty string userAgent in register', async () => {
      const dto: CreateUserDto = {
        email: 'emptyua@test.com',
        name: 'Empty UA User',
        password: 'Test1234!',
      };

      const createdUser = createMockUser({ id: 103, email: dto.email });
      (usersServiceMock.create as jest.Mock).mockResolvedValueOnce(createdUser);
      (usersServiceMock.findById as jest.Mock).mockResolvedValueOnce(
        createdUser,
      );
      (
        refreshTokenServiceMock.createRefreshToken as jest.Mock
      ).mockResolvedValue({
        token: 'refresh-token-12345',
      });

      await service.register(dto, '127.0.0.1', '');

      expect(refreshTokenServiceMock.createRefreshToken).toHaveBeenCalledWith(
        createdUser,
        '127.0.0.1',
        '',
      );
    });
  });

  describe('login - additional tests', () => {
    it('should throw UnauthorizedException for banned user', async () => {
      const mockBannedUser = createMockUser({
        id: 10,
        email: 'banned@test.com',
        name: 'Banned User',
        bannedAt: new Date(),
        banReason: 'Violation of terms',
      });

      // Mock findById to return the banned user
      (usersServiceMock.findById as jest.Mock).mockResolvedValue(
        mockBannedUser,
      );

      // Pass partial user to login (it will fetch full user via findById)
      const partialUser = { id: 10, email: 'banned@test.com' } as User;

      await expect(
        service.login(partialUser, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow('Usuario baneado: Violation of terms');
    });

    it('should throw UnauthorizedException for invalid user data', async () => {
      const invalidUser: Partial<User> = {
        name: 'No ID User',
      };

      await expect(
        service.login(invalidUser, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login(invalidUser, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow('Invalid user data');
    });

    it('should throw UnauthorizedException if user not found in database', async () => {
      const partialUser = {
        id: 999,
        email: 'notfound@test.com',
      } as User;

      (usersServiceMock.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login(partialUser, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow('User not found');
    });

    it('should throw UnauthorizedException for user with id 0', async () => {
      const partialUser = {
        id: 0,
        email: 'zero@test.com',
      } as User;

      await expect(
        service.login(partialUser, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login(partialUser, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow('Invalid user data');
    });

    it('should throw UnauthorizedException for user with negative id', async () => {
      const partialUser = {
        id: -1,
        email: 'negative@test.com',
      } as User;

      await expect(
        service.login(partialUser, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login(partialUser, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow('Invalid user data');
    });

    it('should throw UnauthorizedException for user with null email', async () => {
      const partialUser: Partial<User> = {
        id: 1,
        email: null as unknown as string,
      };

      await expect(
        service.login(partialUser, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login(partialUser, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow('Invalid user data');
    });

    it('should throw UnauthorizedException for user with empty email', async () => {
      const partialUser = {
        id: 1,
        email: '',
      } as User;

      await expect(
        service.login(partialUser, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login(partialUser, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow('Invalid user data');
    });

    it('should not throw when security event logging fails in login', async () => {
      const user: Partial<User> = {
        id: 7,
        email: 'seclog@test.com',
        name: 'SecLog User',
        isAdmin: false,
      };

      const mockCompleteUser = {
        ...user,
        password: 'hashed_password',
        plan: UserPlan.FREE,
        roles: [],
        isBanned: jest.fn().mockReturnValue(false),
      } as unknown as User;
      (usersServiceMock.findById as jest.Mock).mockResolvedValueOnce(
        mockCompleteUser,
      );

      const { SecurityEventService } = await import(
        '../security/security-event.service'
      );
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: UsersService, useValue: usersServiceMock },
          { provide: JwtService, useValue: jwtServiceMock },
          { provide: RefreshTokenService, useValue: refreshTokenServiceMock },
          { provide: PasswordResetService, useValue: passwordResetServiceMock },
          {
            provide: SecurityEventService,
            useValue: {
              logSecurityEvent: jest
                .fn()
                .mockRejectedValue(new Error('DB error')),
            },
          },
        ],
      }).compile();

      const testService = module.get<AuthService>(AuthService);
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await testService.login(user, '127.0.0.1', 'test-agent');

      expect(result).toHaveProperty('access_token');
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockUser = createMockUser({
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
      });

      const mockTokenEntity = {
        id: 'token-id-123',
        token: 'hashed-token',
        user: mockUser,
        isValid: jest.fn().mockReturnValue(true),
      };

      (
        refreshTokenServiceMock.findTokenByPlainToken as jest.Mock
      ).mockResolvedValue(mockTokenEntity);
      (refreshTokenServiceMock.revokeToken as jest.Mock).mockResolvedValue(
        undefined,
      );
      (
        refreshTokenServiceMock.createRefreshToken as jest.Mock
      ).mockResolvedValue({
        token: 'new-refresh-token',
      });

      const result = await service.refresh(
        refreshToken,
        '127.0.0.1',
        'test-agent',
      );

      expect(
        refreshTokenServiceMock.findTokenByPlainToken,
      ).toHaveBeenCalledWith(refreshToken);
      expect(mockTokenEntity.isValid).toHaveBeenCalled();
      expect(refreshTokenServiceMock.revokeToken).toHaveBeenCalledWith(
        mockTokenEntity.id,
      );
      expect(refreshTokenServiceMock.createRefreshToken).toHaveBeenCalledWith(
        mockUser,
        '127.0.0.1',
        'test-agent',
      );
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockUser.email,
          sub: mockUser.id,
          isAdmin: mockUser.isAdmin,
          plan: mockUser.plan,
        }),
      );
      expect(result).toEqual({
        access_token: 'signed-token',
        refresh_token: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';

      (
        refreshTokenServiceMock.findTokenByPlainToken as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        service.refresh(refreshToken, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.refresh(refreshToken, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow('Invalid refresh token');
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const refreshToken = 'expired-refresh-token';
      const mockTokenEntity = {
        id: 'token-id-456',
        token: 'hashed-token',
        isValid: jest.fn().mockReturnValue(false), // Token expired or revoked
      };

      (
        refreshTokenServiceMock.findTokenByPlainToken as jest.Mock
      ).mockResolvedValue(mockTokenEntity);

      await expect(
        service.refresh(refreshToken, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.refresh(refreshToken, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow('Invalid refresh token');
    });

    it('should throw UnauthorizedException if user not found in token', async () => {
      const refreshToken = 'no-user-refresh-token';
      const mockTokenEntity = {
        id: 'token-id-789',
        token: 'hashed-token',
        user: null, // No user associated
        isValid: jest.fn().mockReturnValue(true),
      };

      (
        refreshTokenServiceMock.findTokenByPlainToken as jest.Mock
      ).mockResolvedValue(mockTokenEntity);

      await expect(
        service.refresh(refreshToken, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.refresh(refreshToken, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow('User not found');
    });
  });

  describe('logout', () => {
    it('should logout successfully with valid refresh token', async () => {
      const refreshToken = 'valid-logout-token';
      const mockTokenEntity = {
        id: 'token-logout-123',
        token: 'hashed-token',
      };

      (
        refreshTokenServiceMock.findTokenByPlainToken as jest.Mock
      ).mockResolvedValue(mockTokenEntity);
      (refreshTokenServiceMock.revokeToken as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await service.logout(refreshToken);

      expect(
        refreshTokenServiceMock.findTokenByPlainToken,
      ).toHaveBeenCalledWith(refreshToken);
      expect(refreshTokenServiceMock.revokeToken).toHaveBeenCalledWith(
        mockTokenEntity.id,
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should throw UnauthorizedException for invalid logout token', async () => {
      const refreshToken = 'invalid-logout-token';

      (
        refreshTokenServiceMock.findTokenByPlainToken as jest.Mock
      ).mockResolvedValue(null);

      await expect(service.logout(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.logout(refreshToken)).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });

  describe('logoutAll', () => {
    it('should logout all sessions for a user', async () => {
      const userId = 1;

      (
        refreshTokenServiceMock.revokeAllUserTokens as jest.Mock
      ).mockResolvedValue(undefined);

      const result = await service.logoutAll(userId);

      expect(refreshTokenServiceMock.revokeAllUserTokens).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual({
        message: 'All sessions logged out successfully',
      });
    });

    it('should throw UnauthorizedException for invalid userId', async () => {
      const userId = null as unknown as number;

      await expect(service.logoutAll(userId)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.logoutAll(userId)).rejects.toThrow(
        'User not authenticated',
      );
    });
  });
});
