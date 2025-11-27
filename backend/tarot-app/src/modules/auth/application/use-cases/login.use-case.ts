import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../../users/users.service';
import { UserWithoutPassword } from '../../../users/entities/user.entity';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token-repository.interface';
import { REFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { SecurityEventService } from '../../../security/security-event.service';
import { SecurityEventType } from '../../../security/enums/security-event-type.enum';
import { SecurityEventSeverity } from '../../../security/enums/security-event-severity.enum';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly securityEventService: SecurityEventService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.usersService.findByEmail(email);

    // Validate password before bcrypt.compare
    if (!pass || typeof pass !== 'string') {
      return null;
    }

    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result as UserWithoutPassword;
    }

    // Log failed login attempt
    if (user) {
      try {
        await this.securityEventService.logSecurityEvent({
          eventType: SecurityEventType.FAILED_LOGIN,
          userId: user.id,
          ipAddress: ipAddress ?? null,
          userAgent: userAgent ?? null,
          severity: SecurityEventSeverity.MEDIUM,
          details: { email, reason: 'Invalid password' },
        });
      } catch (error) {
        console.error('Failed to log security event:', error);
      }
    } else {
      try {
        await this.securityEventService.logSecurityEvent({
          eventType: SecurityEventType.FAILED_LOGIN,
          userId: null,
          ipAddress: ipAddress ?? null,
          userAgent: userAgent ?? null,
          severity: SecurityEventSeverity.LOW,
          details: { email, reason: 'User not found' },
        });
      } catch (error) {
        console.error('Failed to log security event:', error);
      }
    }

    return null;
  }

  async execute(
    userId: number,
    email: string,
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
    // Validate inputs
    if (!userId || !email || userId <= 0 || email === '') {
      throw new UnauthorizedException('Invalid user data');
    }

    // Fetch complete user data
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user is banned
    if (user.isBanned()) {
      throw new UnauthorizedException(
        `Usuario baneado${user.banReason ? `: ${user.banReason}` : ''}`,
      );
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await this.usersService.update(user.id, { lastLogin: user.lastLogin });

    // Log successful login
    try {
      await this.securityEventService.logSecurityEvent({
        eventType: SecurityEventType.SUCCESSFUL_LOGIN,
        userId: user.id,
        ipAddress,
        userAgent,
        severity: SecurityEventSeverity.LOW,
        details: { email: user.email },
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }

    // Generate tokens
    const payload = {
      email: user.email,
      sub: user.id,
      isAdmin: user.isAdmin,
      roles: user.roles,
      plan: user.plan,
    };

    const { token: refreshToken } =
      await this.refreshTokenRepository.createRefreshToken(
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
