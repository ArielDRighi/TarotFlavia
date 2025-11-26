import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthOrchestratorService } from './application/services/auth-orchestrator.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './application/dto/login.dto';
import { RefreshTokenDto } from './application/dto/refresh-token.dto';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: Partial<AuthOrchestratorService>;

  beforeEach(async () => {
    authServiceMock = {
      register: jest.fn().mockImplementation(
        (
          dto: CreateUserDto,
        ): Promise<{
          user: { id: number; email: string };
          access_token: string;
          refresh_token: string;
        }> => {
          return Promise.resolve({
            user: { id: 1, email: dto.email },
            access_token: 't',
            refresh_token: 'refresh_t',
          });
        },
      ),
      validateUser: jest.fn().mockResolvedValue({ id: 2, email: 'a@a.com' }),
      login: jest.fn().mockImplementation(
        (): Promise<{
          user: { id: number; email: string };
          access_token: string;
          refresh_token: string;
        }> => {
          return Promise.resolve({
            user: { id: 2, email: 'a@a.com' },
            access_token: 'tok',
            refresh_token: 'refresh_tok',
          });
        },
      ),
      refresh: jest
        .fn()
        .mockImplementation(
          (
            refreshToken: string,
          ): Promise<{ access_token: string; refresh_token: string }> => {
            if (
              refreshToken === 'invalid_token_12345' ||
              refreshToken === 'expired_token_67890' ||
              refreshToken === 'revoked_token_abcde'
            ) {
              return Promise.reject(
                new UnauthorizedException('Invalid refresh token'),
              );
            }
            return Promise.resolve({
              access_token: 'new_access_token_123',
              refresh_token: 'new_refresh_token_456',
            });
          },
        ),
      logout: jest.fn().mockImplementation((refreshToken: string) => {
        if (refreshToken === 'invalid_token') {
          return Promise.reject(
            new UnauthorizedException('Invalid refresh token'),
          );
        }
        return Promise.resolve({ message: 'Logged out successfully' });
      }),
      logoutAll: jest.fn().mockImplementation((userId: number) => {
        if (!userId) {
          return Promise.reject(
            new UnauthorizedException('User not authenticated'),
          );
        }
        return Promise.resolve({
          message: 'All sessions logged out successfully',
        });
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthOrchestratorService, useValue: authServiceMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const dto: CreateUserDto = {
        email: 'new@e.com',
        name: 'New',
        password: 'pass',
      };
      const mockReq = {
        ip: '127.0.0.1',
        get: jest.fn((name: string) => {
          if (name === 'user-agent') {
            return 'test-user-agent';
          }
          return undefined;
        }) as Request['get'],
      } as Request;

      const res = await controller.register(dto, mockReq);
      expect(authServiceMock.register).toHaveBeenCalledWith(
        dto,
        '127.0.0.1',
        'test-user-agent',
      );
      expect(res).toHaveProperty('access_token');
      expect(res).toHaveProperty('refresh_token');
      if (res.user && 'email' in res.user) {
        expect(res.user.email).toEqual(dto.email);
      }
    });
  });

  describe('login', () => {
    const mockReq = {
      ip: '192.168.1.1',
      get: jest.fn((name: string) => {
        if (name === 'user-agent') {
          return 'login-user-agent';
        }
        return undefined;
      }) as Request['get'],
    } as Request;

    it('should return 401 when credentials are invalid', async () => {
      (authServiceMock.validateUser as jest.Mock).mockResolvedValue(null);
      const dto: LoginDto = { email: 'b@b.com', password: 'p' };
      await expect(controller.login(dto, mockReq)).rejects.toThrow();
    });

    it('should return token when credentials are valid', async () => {
      (authServiceMock.validateUser as jest.Mock).mockResolvedValue({
        id: 2,
        email: 'b@b.com',
      });
      (authServiceMock.login as jest.Mock).mockResolvedValue({
        user: { id: 2, email: 'b@b.com' },
        access_token: 'tok',
        refresh_token: 'refresh_tok',
      });

      const dto: LoginDto = { email: 'b@b.com', password: 'p' };
      const res = await controller.login(dto, mockReq);
      expect(authServiceMock.validateUser).toHaveBeenCalledWith(
        dto.email,
        dto.password,
        mockReq.ip,
        mockReq.get('user-agent'),
      );
      expect(authServiceMock.login).toHaveBeenCalled();
      expect(res).toHaveProperty('access_token', 'tok');
      expect(res).toHaveProperty('refresh_token', 'refresh_tok');
    });
  });

  describe('refresh', () => {
    let mockRequest: Request;

    beforeEach(() => {
      mockRequest = {
        ip: '127.0.0.1',
        get: jest.fn((name: string) => {
          if (name === 'user-agent') {
            return 'test-user-agent';
          }
          return undefined;
        }) as Request['get'],
      } as Request;
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const dto: RefreshTokenDto = {
        refreshToken: 'invalid_token_12345',
      };
      await expect(controller.refresh(dto, mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when refresh token is expired', async () => {
      const dto: RefreshTokenDto = {
        refreshToken: 'expired_token_67890',
      };
      await expect(controller.refresh(dto, mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when refresh token is revoked', async () => {
      const dto: RefreshTokenDto = {
        refreshToken: 'revoked_token_abcde',
      };
      await expect(controller.refresh(dto, mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return new access and refresh tokens when refresh token is valid', async () => {
      const dto: RefreshTokenDto = {
        refreshToken: 'valid_token_xyz123',
      };
      const result = await controller.refresh(dto, mockRequest);
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(typeof result.access_token).toBe('string');
      expect(typeof result.refresh_token).toBe('string');
    });
  });

  describe('logout', () => {
    it('should revoke refresh token and return success', async () => {
      const dto: RefreshTokenDto = {
        refreshToken: 'valid_token_to_revoke',
      };
      const result = await controller.logout(dto);
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Logged out successfully');
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const dto: RefreshTokenDto = {
        refreshToken: 'invalid_token',
      };
      await expect(controller.logout(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logoutAll', () => {
    const mockUser = {
      userId: 1,
      email: 'test@example.com',
    };

    it('should revoke all refresh tokens for authenticated user', async () => {
      const mockReq = {
        user: mockUser,
      } as unknown as Request;

      const result = await controller.logoutAll(mockReq);
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('All sessions logged out successfully');
    });

    it('should throw UnauthorizedException when user is not authenticated', async () => {
      const mockReq = {} as unknown as Request;

      await expect(controller.logoutAll(mockReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword and return success message', async () => {
      const dto = { email: 'test@example.com' };
      authServiceMock.forgotPassword = jest.fn().mockResolvedValue({
        message: 'Password reset email sent',
      });

      const result = await controller.forgotPassword(dto);

      expect(authServiceMock.forgotPassword).toHaveBeenCalledWith(dto.email);
      expect(result).toEqual({ message: 'Password reset email sent' });
    });

    it('should handle errors from authService.forgotPassword', async () => {
      const dto = { email: 'nonexistent@example.com' };
      authServiceMock.forgotPassword = jest
        .fn()
        .mockRejectedValue(new Error('User not found'));

      await expect(controller.forgotPassword(dto)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword and return success message', async () => {
      const dto = {
        token: 'valid-token-123',
        newPassword: 'NewStrongP@ss1',
      };
      authServiceMock.resetPassword = jest.fn().mockResolvedValue({
        message: 'Password reset successful',
      });

      const result = await controller.resetPassword(dto);

      expect(authServiceMock.resetPassword).toHaveBeenCalledWith(
        dto.token,
        dto.newPassword,
      );
      expect(result).toEqual({ message: 'Password reset successful' });
    });

    it('should handle errors from authService.resetPassword', async () => {
      const dto = {
        token: 'invalid-token',
        newPassword: 'NewStrongP@ss1',
      };
      authServiceMock.resetPassword = jest
        .fn()
        .mockRejectedValue(new Error('Invalid token'));

      await expect(controller.resetPassword(dto)).rejects.toThrow(
        'Invalid token',
      );
    });
  });
});
