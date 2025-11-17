import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AIQuotaService } from './ai-quota.service';
import { SKIP_QUOTA_CHECK_KEY } from './skip-quota-check.decorator';
import { format } from 'date-fns/format';
import { es } from 'date-fns/locale/es';

interface RequestWithUser {
  user?: {
    id?: number;
  };
}

@Injectable()
export class AIQuotaGuard implements CanActivate {
  constructor(
    private readonly aiQuotaService: AIQuotaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route has @SkipQuotaCheck decorator
    const skipQuotaCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_QUOTA_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipQuotaCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException(
        'Usuario no autenticado. Por favor, inicia sesión.',
      );
    }

    const hasQuota = await this.aiQuotaService.checkMonthlyQuota(user.id);

    if (!hasQuota) {
      const quotaInfo = await this.aiQuotaService.getRemainingQuota(user.id);
      const resetDateFormatted = format(quotaInfo.resetDate, 'd/M/yyyy', {
        locale: es,
      });

      throw new ForbiddenException(
        `Has alcanzado tu límite mensual de ${quotaInfo.quotaLimit} interpretaciones de IA. ` +
          `Tu cuota se renovará el ${resetDateFormatted}. ` +
          `Actualiza a Premium para interpretaciones ilimitadas.`,
      );
    }

    return true;
  }
}
