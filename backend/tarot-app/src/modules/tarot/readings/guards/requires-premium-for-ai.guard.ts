import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserPlan } from '../../../users/entities/user.entity';

interface RequestWithUser {
  user: {
    userId: number;
    plan: UserPlan;
  };
  body: {
    generateInterpretation?: boolean;
  };
}

/**
 * Guard que verifica si un usuario tiene plan premium cuando intenta generar interpretación con IA
 * Los usuarios free y anonymous solo pueden crear lecturas sin interpretación IA
 */
@Injectable()
export class RequiresPremiumForAIGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const body = request.body;

    // Si no solicita generación de interpretación o es false, permitir acceso
    if (!body.generateInterpretation) {
      return true;
    }

    // Si solicita interpretación IA, verificar que el usuario sea premium
    if (user.plan !== UserPlan.PREMIUM) {
      throw new ForbiddenException(
        'Las interpretaciones con IA están disponibles solo para usuarios Premium. Actualiza tu plan para desbloquear esta funcionalidad.',
      );
    }

    // Usuario premium puede usar interpretaciones IA
    return true;
  }
}
