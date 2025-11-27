import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token-repository.interface';
import { REFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/repository.tokens';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(refreshToken: string): Promise<{ message: string }> {
    const tokenEntity =
      await this.refreshTokenRepository.findTokenByPlainToken(refreshToken);

    if (!tokenEntity) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepository.revokeToken(tokenEntity.id);

    return { message: 'Logged out successfully' };
  }

  async executeAll(userId: number): Promise<{ message: string }> {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    await this.refreshTokenRepository.revokeAllUserTokens(userId);

    return { message: 'All sessions logged out successfully' };
  }
}
