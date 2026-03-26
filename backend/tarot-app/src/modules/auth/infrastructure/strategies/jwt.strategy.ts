import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../../users/users.service';
import { UserRole } from '../../../../common/enums/user-role.enum';
import { UserPlan } from '../../../users/entities/user.entity';

interface JwtPayload {
  sub: number;
  email: string;
  isAdmin?: boolean;
  roles?: UserRole[];
  plan?: UserPlan;
  tarotistaId?: number;
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

    const result: {
      userId: number;
      email: string;
      isAdmin: boolean;
      roles: UserRole[];
      plan: UserPlan;
      tarotistaId?: number;
    } = {
      userId: payload.sub,
      email: user.email,
      isAdmin: user.isAdmin,
      roles: user.roles,
      plan: user.plan,
    };

    if (payload.tarotistaId !== undefined) {
      result.tarotistaId = payload.tarotistaId;
    }

    return result;
  }
}
