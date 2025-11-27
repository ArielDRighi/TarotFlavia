import { Injectable, Inject } from '@nestjs/common';
import { IPasswordResetRepository } from '../../domain/interfaces/password-reset-repository.interface';
import { PASSWORD_RESET_REPOSITORY } from '../../domain/interfaces/repository.tokens';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: IPasswordResetRepository,
  ) {}

  async execute(email: string): Promise<{ message: string; token?: string }> {
    const { token } =
      await this.passwordResetRepository.generateResetToken(email);

    // TODO: For now, log the link to console (until real email integration is implemented)
    console.log('========================================');
    console.log('Password reset link:');
    console.log(`/reset-password?token=${token}`);
    console.log('========================================');

    // INTEGRATION TESTS: Return token for testing purposes
    // In production with real email, this should NOT be returned
    return {
      message: 'Password reset email sent',
      token: process.env.NODE_ENV !== 'production' ? token : undefined,
    };
  }
}
