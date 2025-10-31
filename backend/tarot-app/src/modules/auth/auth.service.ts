import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserWithoutPassword } from '../users/entities/user.entity';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
    ipAddress: string,
    userAgent: string,
  ) {
    const createdUser = await this.usersService.create(createUserDto);

    // Fetch complete user data including password for refresh token generation
    const user = await this.usersService.findById(createdUser.id);
    if (!user) {
      throw new UnauthorizedException('User creation failed');
    }

    return this.generateAuthResponse(user, ipAddress, userAgent);
  }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result as UserWithoutPassword;
    }
    return null;
  }

  async login(
    userPartial: Partial<User>,
    ipAddress: string,
    userAgent: string,
  ) {
    // Ensure we have a complete User object with required fields
    if (!userPartial.id || !userPartial.email) {
      throw new UnauthorizedException('Invalid user data');
    }

    // Fetch complete user data from database
    const user = await this.usersService.findById(userPartial.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateAuthResponse(user, ipAddress, userAgent);
  }

  async refresh(
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // Find the refresh token in database
    const tokenEntity =
      await this.refreshTokenService.findTokenByPlainToken(refreshToken);

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
    await this.refreshTokenService.revokeToken(tokenEntity.id);

    // Generate new tokens
    const payload = {
      email: user.email,
      sub: user.id,
      isAdmin: user.isAdmin,
      plan: user.plan,
    };
    const accessToken = this.jwtService.sign(payload);

    // Create new refresh token
    const { token: newRefreshToken } =
      await this.refreshTokenService.createRefreshToken(
        user,
        ipAddress,
        userAgent,
      );

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    const tokenEntity =
      await this.refreshTokenService.findTokenByPlainToken(refreshToken);

    if (!tokenEntity) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenService.revokeToken(tokenEntity.id);

    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: number): Promise<{ message: string }> {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    await this.refreshTokenService.revokeAllUserTokens(userId);

    return { message: 'All sessions logged out successfully' };
  }

  private async generateAuthResponse(
    user: User,
    ipAddress: string,
    userAgent: string,
  ): Promise<{
    user: {
      id: number;
      email: string;
      name: string;
      isAdmin: boolean;
      plan: string;
    };
    access_token: string;
    refresh_token: string;
  }> {
    const payload = {
      email: user.email,
      sub: user.id,
      isAdmin: user.isAdmin,
      plan: user.plan,
    };

    // Crear refresh token
    const { token: refreshToken } =
      await this.refreshTokenService.createRefreshToken(
        user,
        ipAddress,
        userAgent,
      );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        plan: user.plan,
      },
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
    };
  }
}
