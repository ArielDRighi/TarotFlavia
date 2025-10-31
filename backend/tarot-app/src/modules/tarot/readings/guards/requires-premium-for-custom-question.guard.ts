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
    customQuestion?: string;
  };
}

/**
 * Guard que verifica si un usuario tiene plan premium cuando intenta usar una pregunta personalizada
 * Los usuarios free solo pueden usar preguntas predefinidas
 */
@Injectable()
export class RequiresPremiumForCustomQuestionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const body = request.body;

    // Si no hay pregunta personalizada, permitir acceso
    if (!body.customQuestion) {
      return true;
    }

    // Si hay pregunta personalizada, verificar que el usuario sea premium
    if (user.plan === UserPlan.FREE) {
      throw new ForbiddenException(
        'Las preguntas personalizadas requieren un plan premium. Por favor, elige una pregunta predefinida o actualiza tu plan.',
      );
    }

    // Usuario premium puede usar preguntas personalizadas
    return true;
  }
}
