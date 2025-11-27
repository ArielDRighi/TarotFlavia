import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from '../../../../common/enums/user-role.enum';

interface RequestWithUser extends Request {
  user?: {
    roles?: UserRole[];
    isAdmin?: boolean;
  };
}

/**
 * AdminGuard - Guard for admin-only endpoints
 *
 * @deprecated Use @UseGuards(JwtAuthGuard, RolesGuard) with @Roles(UserRole.ADMIN) instead
 *
 * This guard supports both the new roles system and old isAdmin boolean for backward compatibility.
 * Priority: roles system > isAdmin boolean
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Nuevo: verificar roles array (priority)
    if (user.roles?.includes(UserRole.ADMIN)) {
      return true;
    }

    // Fallback: verificar isAdmin (deprecated pero funcional)
    if (user.isAdmin === true) {
      return true;
    }

    throw new ForbiddenException('Se requieren permisos de administrador');
  }
}
