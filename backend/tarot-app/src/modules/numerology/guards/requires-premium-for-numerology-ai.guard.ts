import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserPlan } from '../../users/entities/user.entity';

interface RequestWithUser {
  user: {
    userId: number;
    plan: UserPlan;
  };
}

/**
 * Guard que verifica si un usuario tiene plan premium para interpretaciones numerológicas con IA
 *
 * @remarks
 * Las interpretaciones numerológicas generadas por IA están disponibles solo para usuarios PREMIUM.
 * Los usuarios FREE pueden usar la calculadora básica pero no pueden generar interpretaciones personalizadas con IA.
 */
@Injectable()
export class RequiresPremiumForNumerologyAIGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Solo usuarios PREMIUM pueden generar interpretación IA
    if (user.plan !== UserPlan.PREMIUM) {
      throw new ForbiddenException(
        'Las interpretaciones numerológicas con IA están disponibles solo para usuarios Premium. ' +
          'Actualiza tu plan para desbloquear esta funcionalidad.',
      );
    }

    return true;
  }
}
