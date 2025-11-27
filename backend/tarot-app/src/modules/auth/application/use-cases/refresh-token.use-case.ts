import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token-repository.interface';
import { REFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/repository.tokens';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // Find the refresh token in database
    const tokenEntity =
      await this.refreshTokenRepository.findTokenByPlainToken(refreshToken);

    if (!tokenEntity) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is valid (not expired, not revoked)
    if (!tokenEntity.isValid()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user data from the token entity
    const user = tokenEntity.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke the old token (token rotation)
    await this.refreshTokenRepository.revokeToken(tokenEntity.id);

    // Generate new tokens
    const payload = {
      email: user.email,
      sub: user.id,
      isAdmin: user.isAdmin,
      roles: user.roles,
      plan: user.plan,
    };
    const accessToken = this.jwtService.sign(payload);

    // Create new refresh token
    const { token: newRefreshToken } =
      await this.refreshTokenRepository.createRefreshToken(
        user,
        ipAddress,
        userAgent,
      );

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }
}
