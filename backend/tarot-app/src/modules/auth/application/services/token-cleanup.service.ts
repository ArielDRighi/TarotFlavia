import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token-repository.interface';
import { IPasswordResetRepository } from '../../domain/interfaces/password-reset-repository.interface';
import {
  REFRESH_TOKEN_REPOSITORY,
  PASSWORD_RESET_REPOSITORY,
} from '../../domain/interfaces/repository.tokens';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: IPasswordResetRepository,
  ) {}

  /**
   * Limpieza automática de tokens expirados
   * Se ejecuta diariamente a las 3:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCleanup() {
    this.logger.log('Starting token cleanup task...');

    try {
      // Limpiar refresh tokens expirados
      const deletedRefreshTokens =
        await this.refreshTokenRepository.deleteExpiredTokens();
      this.logger.log(`Deleted ${deletedRefreshTokens} expired refresh tokens`);

      // Limpiar password reset tokens expirados
      const deletedPasswordResetTokens =
        await this.passwordResetRepository.deleteExpiredTokens();
      this.logger.log(
        `Deleted ${deletedPasswordResetTokens} expired password reset tokens`,
      );

      this.logger.log('Token cleanup completed successfully');
    } catch (error) {
      this.logger.error('Error during token cleanup:', error);
    }
  }

  /**
   * Método manual para ejecutar limpieza bajo demanda
   */
  async cleanupNow(): Promise<{
    deletedRefreshTokens: number;
    deletedPasswordResetTokens: number;
  }> {
    const deletedRefreshTokens =
      await this.refreshTokenRepository.deleteExpiredTokens();
    const deletedPasswordResetTokens =
      await this.passwordResetRepository.deleteExpiredTokens();

    return {
      deletedRefreshTokens,
      deletedPasswordResetTokens,
    };
  }
}
