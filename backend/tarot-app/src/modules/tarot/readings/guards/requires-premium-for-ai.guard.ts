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
    useAI?: boolean;
    generateInterpretation?: boolean;
  };
}

/**
 * Guard que verifica si un usuario tiene plan premium cuando intenta usar funciones con IA
 * Los usuarios free y anonymous solo pueden crear lecturas sin IA (useAI: false o undefined)
 */
@Injectable()
export class RequiresPremiumForAIGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const body = request.body;

    // Si solicita usar IA explícitamente (useAI: true), verificar plan premium
    if (body.useAI === true) {
      if (user.plan !== UserPlan.PREMIUM) {
        throw new ForbiddenException(
          'Las funciones con IA están disponibles solo para usuarios Premium. Actualiza tu plan para desbloquear esta funcionalidad.',
        );
      }
      return true;
    }

    // Compatibilidad con el campo legacy generateInterpretation
    // Solo aplicar si useAI no está definido (para no duplicar validación)
    if (body.useAI === undefined && body.generateInterpretation === true) {
      if (user.plan !== UserPlan.PREMIUM) {
        throw new ForbiddenException(
          'Las interpretaciones con IA están disponibles solo para usuarios Premium. Actualiza tu plan para desbloquear esta funcionalidad.',
        );
      }
      return true;
    }

    // Si useAI es false o undefined (y generateInterpretation también), permitir acceso
    return true;
  }
}
