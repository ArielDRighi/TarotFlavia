import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UsageLimitsService } from '../usage-limits.service';
import { AnonymousTrackingService } from '../services/anonymous-tracking.service';
import { UsageFeature } from '../entities/usage-limit.entity';
import { USAGE_LIMIT_FEATURE_KEY } from '../decorators/check-usage-limit.decorator';
import { ALLOW_ANONYMOUS_KEY } from '../decorators/allow-anonymous.decorator';

@Injectable()
export class CheckUsageLimitGuard implements CanActivate {
  constructor(
    private readonly usageLimitsService: UsageLimitsService,
    private readonly anonymousTrackingService: AnonymousTrackingService,
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

    // Check if anonymous access is allowed
    const allowAnonymous = this.reflector.getAllAndOverride<boolean>(
      ALLOW_ANONYMOUS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Extract request and user info
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { userId: number } }>();
    const userId = request.user?.userId;

    // If user is authenticated, use normal usage limit checking
    if (userId) {
      const canUse = await this.usageLimitsService.checkLimit(userId, feature);

      if (!canUse) {
        throw new ForbiddenException(
          `Has alcanzado tu límite diario para esta función. Tu cuota se restablecerá a medianoche (00:00 UTC). Intenta nuevamente mañana o actualiza tu plan para obtener más acceso.`,
        );
      }

      return true;
    }

    // If user is not authenticated and anonymous access is allowed
    if (allowAnonymous) {
      const canAccess = await this.anonymousTrackingService.canAccess(request);

      if (!canAccess) {
        throw new ForbiddenException(
          'Ya viste tu carta del día. Regístrate para más lecturas.',
        );
      }

      return true;
    }

    // If user is not authenticated and anonymous access is not allowed
    throw new ForbiddenException('Usuario no autenticado');
  }
}
