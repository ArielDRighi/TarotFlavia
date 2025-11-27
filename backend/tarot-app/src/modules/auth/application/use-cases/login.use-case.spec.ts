import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginUseCase } from './login.use-case';
import { UsersService } from '../../../users/users.service';
import { SecurityEventService } from '../../../security/security-event.service';
import { REFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { User } from '../../../users/entities/user.entity';

jest.mock('bcryptjs');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenRepository: any;
  let securityEventService: jest.Mocked<SecurityEventService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    isAdmin: false,
    plan: 'free',
    roles: ['user'],
    lastLogin: new Date(),
    isBanned: jest.fn().mockReturnValue(false),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('access_token'),
          },
        },
        {
          provide: REFRESH_TOKEN_REPOSITORY,
          useValue: {
            createRefreshToken: jest.fn().mockResolvedValue({
              token: 'refresh_token',
            }),
          },
        },
        {
          provide: SecurityEventService,
          useValue: {
            logSecurityEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    refreshTokenRepository = module.get(REFRESH_TOKEN_REPOSITORY);
    securityEventService = module.get(
      SecurityEventService,
    ) as jest.Mocked<SecurityEventService>;
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await useCase.validateUser(
        'test@example.com',
        'password',
        '127.0.0.1',
        'Mozilla',
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result).not.toHaveProperty('password');
    });

    it('should return null when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await useCase.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
      expect(securityEventService.logSecurityEvent).toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await useCase.validateUser(
        'notfound@example.com',
        'password',
      );

      expect(result).toBeNull();
      expect(securityEventService.logSecurityEvent).toHaveBeenCalled();
    });

    it('should return null when password is invalid type', async () => {
      const result = await useCase.validateUser(
        'test@example.com',
        null as any,
      );

      expect(result).toBeNull();
    });
  });

  describe('execute', () => {
    it('should successfully login user and return tokens', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      usersService.update.mockResolvedValue(mockUser);

      const result = await useCase.execute(
        1,
        'test@example.com',
        '127.0.0.1',
        'Mozilla',
      );

      expect(result).toBeDefined();
      expect(result.access_token).toBe('access_token');
      expect(result.refresh_token).toBe('refresh_token');
      expect(result.user.email).toBe('test@example.com');
      expect(usersService.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ lastLogin: expect.any(Date) }),
      );
    });

    it('should throw UnauthorizedException when userId is invalid', async () => {
      await expect(
        useCase.execute(0, 'test@example.com', '127.0.0.1', 'Mozilla'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when email is empty', async () => {
      await expect(
        useCase.execute(1, '', '127.0.0.1', 'Mozilla'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(999, 'test@example.com', '127.0.0.1', 'Mozilla'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is banned', async () => {
      const bannedUser = {
        ...mockUser,
        isBanned: jest.fn().mockReturnValue(true),
        banReason: 'Violation of terms',
      };
      usersService.findById.mockResolvedValue(bannedUser);

      await expect(
        useCase.execute(1, 'test@example.com', '127.0.0.1', 'Mozilla'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should log successful login event', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      usersService.update.mockResolvedValue(mockUser);

      await useCase.execute(1, 'test@example.com', '127.0.0.1', 'Mozilla');

      expect(securityEventService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'successful_login',
          userId: 1,
        }),
      );
    });

    it('should handle security event logging errors gracefully', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      usersService.update.mockResolvedValue(mockUser);
      securityEventService.logSecurityEvent.mockRejectedValue(
        new Error('Logging error'),
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await useCase.execute(1, 'test@example.com', '127.0.0.1', 'Mozilla');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
