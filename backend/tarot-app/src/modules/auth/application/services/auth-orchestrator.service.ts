import { Injectable } from '@nestjs/common';
import { LoginUseCase } from '../use-cases/login.use-case';
import { RegisterUseCase } from '../use-cases/register.use-case';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../use-cases/logout.use-case';
import { ForgotPasswordUseCase } from '../use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../use-cases/reset-password.use-case';
import { CreateUserDto } from '../../../users/dto/create-user.dto';
import { UserWithoutPassword } from '../../../users/entities/user.entity';

@Injectable()
export class AuthOrchestratorService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  async validateUser(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<UserWithoutPassword | null> {
    return this.loginUseCase.validateUser(
      email,
      password,
      ipAddress,
      userAgent,
    );
  }

  async login(
    userId: number,
    email: string,
    ipAddress: string,
    userAgent: string,
  ) {
    return this.loginUseCase.execute(userId, email, ipAddress, userAgent);
  }

  async register(
    createUserDto: CreateUserDto,
    ipAddress: string,
    userAgent: string,
  ) {
    return this.registerUseCase.execute(createUserDto, ipAddress, userAgent);
  }

  async refresh(
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.refreshTokenUseCase.execute(refreshToken, ipAddress, userAgent);
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    return this.logoutUseCase.execute(refreshToken);
  }

  async logoutAll(userId: number): Promise<{ message: string }> {
    return this.logoutUseCase.executeAll(userId);
  }

  async forgotPassword(
    email: string,
  ): Promise<{ message: string; token?: string }> {
    return this.forgotPasswordUseCase.execute(email);
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    return this.resetPasswordUseCase.execute(token, newPassword);
  }
}
