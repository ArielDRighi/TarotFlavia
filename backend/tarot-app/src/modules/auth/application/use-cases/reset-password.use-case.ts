import { Injectable, Inject } from '@nestjs/common';
import { UsersService } from '../../../users/users.service';
import { IPasswordResetRepository } from '../../domain/interfaces/password-reset-repository.interface';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token-repository.interface';
import {
  PASSWORD_RESET_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
} from '../../domain/interfaces/repository.tokens';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: IPasswordResetRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly usersService: UsersService,
  ) {}

  async execute(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Validate token
    const resetToken = await this.passwordResetRepository.validateToken(token);

    // Update user password (usersService.update will handle hashing)
    await this.usersService.update(resetToken.userId, {
      password: newPassword,
    });

    // Invalidate all user refresh tokens for security
    await this.refreshTokenRepository.revokeAllUserTokens(resetToken.userId);

    // Mark token as used
    await this.passwordResetRepository.markTokenAsUsed(resetToken);

    return { message: 'Password reset successful' };
  }
}
