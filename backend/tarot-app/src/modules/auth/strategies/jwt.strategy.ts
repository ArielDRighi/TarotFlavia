import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../../common/enums/user-role.enum';

interface JwtPayload {
  sub: number;
  email: string;
  isAdmin?: boolean;
  roles?: UserRole[];
  plan?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your_jwt_secret', // Valor por defecto
    });
  }

  async validate(payload: JwtPayload) {
    // Check if user is banned
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.isBanned()) {
      throw new UnauthorizedException(
        `Usuario baneado${user.banReason ? `: ${user.banReason}` : ''}`,
      );
    }

    return {
      userId: payload.sub,
      email: payload.email,
      isAdmin: payload.isAdmin || false,
      roles: payload.roles || [],
      plan: payload.plan || 'free',
    };
  }
}
