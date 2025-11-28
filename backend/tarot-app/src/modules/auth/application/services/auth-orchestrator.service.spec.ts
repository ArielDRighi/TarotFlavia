import { Test, TestingModule } from '@nestjs/testing';
import { AuthOrchestratorService } from './auth-orchestrator.service';
import { LoginUseCase } from '../use-cases/login.use-case';
import { RegisterUseCase } from '../use-cases/register.use-case';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../use-cases/logout.use-case';
import { ForgotPasswordUseCase } from '../use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../use-cases/reset-password.use-case';
import { CreateUserDto } from '../../../users/application/dto/create-user.dto';

describe('AuthOrchestratorService', () => {
  let service: AuthOrchestratorService;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let registerUseCase: jest.Mocked<RegisterUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;
  let logoutUseCase: jest.Mocked<LogoutUseCase>;
  let forgotPasswordUseCase: jest.Mocked<ForgotPasswordUseCase>;
  let resetPasswordUseCase: jest.Mocked<ResetPasswordUseCase>;

  const mockAuthResponse = {
    user: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      isAdmin: false,
      plan: 'free',
    },
    access_token: 'access_token',
    refresh_token: 'refresh_token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthOrchestratorService,
        {
          provide: LoginUseCase,
          useValue: {
            validateUser: jest.fn(),
            execute: jest.fn(),
          },
        },
        {
          provide: RegisterUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: RefreshTokenUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: LogoutUseCase,
          useValue: {
            execute: jest.fn(),
            executeAll: jest.fn(),
          },
        },
        {
          provide: ForgotPasswordUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ResetPasswordUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthOrchestratorService>(AuthOrchestratorService);
    loginUseCase = module.get(LoginUseCase);
    registerUseCase = module.get(RegisterUseCase);
    refreshTokenUseCase = module.get(RefreshTokenUseCase);
    logoutUseCase = module.get(LogoutUseCase);
    forgotPasswordUseCase = module.get(ForgotPasswordUseCase);
    resetPasswordUseCase = module.get(ResetPasswordUseCase);
  });

  describe('validateUser', () => {
    it('should delegate to LoginUseCase.validateUser', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      loginUseCase.validateUser.mockResolvedValue(mockUser as any);

      const result = await service.validateUser(
        'test@example.com',
        'password',
        '127.0.0.1',
        'Mozilla',
      );

      expect(result).toEqual(mockUser);
      expect(loginUseCase.validateUser).toHaveBeenCalledWith(
        'test@example.com',
        'password',
        '127.0.0.1',
        'Mozilla',
      );
    });
  });

  describe('login', () => {
    it('should delegate to LoginUseCase.execute', async () => {
      loginUseCase.execute.mockResolvedValue(mockAuthResponse);

      const result = await service.login(
        1,
        'test@example.com',
        '127.0.0.1',
        'Mozilla',
      );

      expect(result).toEqual(mockAuthResponse);
      expect(loginUseCase.execute).toHaveBeenCalledWith(
        1,
        'test@example.com',
        '127.0.0.1',
        'Mozilla',
      );
    });
  });

  describe('register', () => {
    it('should delegate to RegisterUseCase.execute', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        password: 'SecurePass123!',
        name: 'New User',
      };
      registerUseCase.execute.mockResolvedValue(mockAuthResponse);

      const result = await service.register(
        createUserDto,
        '127.0.0.1',
        'Mozilla',
      );

      expect(result).toEqual(mockAuthResponse);
      expect(registerUseCase.execute).toHaveBeenCalledWith(
        createUserDto,
        '127.0.0.1',
        'Mozilla',
      );
    });
  });

  describe('refresh', () => {
    it('should delegate to RefreshTokenUseCase.execute', async () => {
      const mockTokens = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      };
      refreshTokenUseCase.execute.mockResolvedValue(mockTokens);

      const result = await service.refresh(
        'old_refresh_token',
        '127.0.0.1',
        'Mozilla',
      );

      expect(result).toEqual(mockTokens);
      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(
        'old_refresh_token',
        '127.0.0.1',
        'Mozilla',
      );
    });
  });

  describe('logout', () => {
    it('should delegate to LogoutUseCase.execute', async () => {
      logoutUseCase.execute.mockResolvedValue({
        message: 'Logged out successfully',
      });

      const result = await service.logout('refresh_token');

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(logoutUseCase.execute).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('logoutAll', () => {
    it('should delegate to LogoutUseCase.executeAll', async () => {
      logoutUseCase.executeAll.mockResolvedValue({
        message: 'All sessions logged out successfully',
      });

      const result = await service.logoutAll(1);

      expect(result).toEqual({
        message: 'All sessions logged out successfully',
      });
      expect(logoutUseCase.executeAll).toHaveBeenCalledWith(1);
    });
  });

  describe('forgotPassword', () => {
    it('should delegate to ForgotPasswordUseCase.execute', async () => {
      forgotPasswordUseCase.execute.mockResolvedValue({
        message: 'Password reset email sent',
        token: 'reset_token',
      });

      const result = await service.forgotPassword('test@example.com');

      expect(result).toEqual({
        message: 'Password reset email sent',
        token: 'reset_token',
      });
      expect(forgotPasswordUseCase.execute).toHaveBeenCalledWith(
        'test@example.com',
      );
    });
  });

  describe('resetPassword', () => {
    it('should delegate to ResetPasswordUseCase.execute', async () => {
      resetPasswordUseCase.execute.mockResolvedValue({
        message: 'Password reset successful',
      });

      const result = await service.resetPassword(
        'reset_token',
        'NewSecurePass123!',
      );

      expect(result).toEqual({ message: 'Password reset successful' });
      expect(resetPasswordUseCase.execute).toHaveBeenCalledWith(
        'reset_token',
        'NewSecurePass123!',
      );
    });
  });
});
