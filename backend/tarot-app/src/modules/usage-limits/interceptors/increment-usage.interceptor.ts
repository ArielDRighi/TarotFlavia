import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UsageLimitsService } from '../usage-limits.service';
import { UsageFeature } from '../entities/usage-limit.entity';
import { USAGE_LIMIT_FEATURE_KEY } from '../decorators/check-usage-limit.decorator';

@Injectable()
export class IncrementUsageInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IncrementUsageInterceptor.name);

  constructor(
    private readonly usageLimitsService: UsageLimitsService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Extract feature from decorator metadata
    const feature = this.reflector.getAllAndOverride<UsageFeature>(
      USAGE_LIMIT_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no feature is specified, skip increment
    if (!feature) {
      return next.handle();
    }

    // Extract user from request
    const request = context.switchToHttp().getRequest<{
      user?: { userId: number };
    }>();
    const userId = request.user?.userId;

    if (!userId) {
      // If no user, just continue without incrementing
      return next.handle();
    }

    // Execute the handler and increment usage after successful response
    return next.handle().pipe(
      tap({
        next: () => {
          // Increment usage asynchronously without blocking the response
          this.usageLimitsService
            .incrementUsage(userId, feature)
            .catch((error) => {
              // Log error but don't block the response
              this.logger.error(
                `Failed to increment usage for user ${userId}, feature ${feature}`,
                error instanceof Error ? error.stack : String(error),
              );
            });
        },
      }),
    );
  }
}
