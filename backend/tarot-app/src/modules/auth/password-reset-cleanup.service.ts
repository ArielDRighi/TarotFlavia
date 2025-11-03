import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PasswordResetService } from './password-reset.service';

@Injectable()
export class PasswordResetCleanupService {
  private readonly logger = new Logger(PasswordResetCleanupService.name);

  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredTokens() {
    this.logger.log('Starting password reset tokens cleanup...');

    try {
      const deletedCount =
        await this.passwordResetService.deleteExpiredTokens();

      this.logger.log(
        `Password reset tokens cleanup completed. Deleted ${deletedCount} expired tokens.`,
      );
    } catch (error) {
      this.logger.error(
        'Error during password reset tokens cleanup',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
