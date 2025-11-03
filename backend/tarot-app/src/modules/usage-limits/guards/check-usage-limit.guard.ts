import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsageLimitsService } from '../usage-limits.service';
import { UsageFeature } from '../entities/usage-limit.entity';
import { USAGE_LIMIT_FEATURE_KEY } from '../decorators/check-usage-limit.decorator';

@Injectable()
export class CheckUsageLimitGuard implements CanActivate {
  constructor(
    private readonly usageLimitsService: UsageLimitsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract feature from decorator metadata
    const feature = this.reflector.getAllAndOverride<UsageFeature>(
      USAGE_LIMIT_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no feature is specified, skip the guard
    if (!feature) {
      return true;
    }

    // Extract user from request
    const request = context.switchToHttp().getRequest<{
      user?: { userId: number };
    }>();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Check if user can use this feature
    const canUse = await this.usageLimitsService.checkLimit(userId, feature);

    if (!canUse) {
      throw new ForbiddenException(
        'Has alcanzado el límite diario para esta función. Por favor, actualiza tu plan o intenta mañana.',
      );
    }

    return true;
  }
}
