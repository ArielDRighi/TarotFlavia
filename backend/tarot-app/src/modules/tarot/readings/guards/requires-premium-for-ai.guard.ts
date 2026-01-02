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
 *
 * @remarks
 * Prioridad de validación:
 * 1. Si `useAI === true` → Validar plan PREMIUM (rechazar FREE/ANONYMOUS)
 * 2. Si `useAI === false` → Permitir para todos (ignora generateInterpretation)
 * 3. Si `useAI === undefined` → Validar `generateInterpretation` (legacy, backward compatibility)
 */
@Injectable()
export class RequiresPremiumForAIGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const body = request.body;

    // Prioridad 1: Si useAI está definido, tiene precedencia sobre generateInterpretation
    if (body.useAI !== undefined) {
      // useAI: true requiere plan PREMIUM
      if (body.useAI === true) {
        if (user.plan !== UserPlan.PREMIUM) {
          throw new ForbiddenException(
            'Las funciones con IA están disponibles solo para usuarios Premium. Actualiza tu plan para desbloquear esta funcionalidad.',
          );
        }
        return true;
      }

      // useAI: false permite acceso para todos (incluso si generateInterpretation: true)
      // Esto es intencional: useAI: false tiene prioridad para desactivar funciones IA
      return true;
    }

    // Prioridad 2: Compatibilidad con el campo legacy generateInterpretation
    // Solo aplicar si useAI no está definido (backward compatibility)
    if (body.generateInterpretation === true) {
      if (user.plan !== UserPlan.PREMIUM) {
        throw new ForbiddenException(
          'Las interpretaciones con IA están disponibles solo para usuarios Premium. Actualiza tu plan para desbloquear esta funcionalidad.',
        );
      }
      return true;
    }

    // Por defecto, permitir acceso (sin IA)
    return true;
  }
}
