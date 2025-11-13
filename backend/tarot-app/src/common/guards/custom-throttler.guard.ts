import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  Logger,
  Optional,
} from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerRequest,
  ThrottlerModuleOptions,
  ThrottlerStorage,
  ThrottlerException,
} from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IPBlockingService } from '../services/ip-blocking.service';
import { IPWhitelistService } from '../services/ip-whitelist.service';
import {
  RATE_LIMIT_OPTIONS_KEY,
  RateLimitOptions,
} from '../decorators/rate-limit.decorator';

interface RequestWithUser extends Request {
  user?: {
    userId: number;
    email: string;
    isAdmin: boolean;
    plan: string;
  };
}

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(CustomThrottlerGuard.name);
  private readonly customReflector: Reflector;

  constructor(
    @Optional() options: ThrottlerModuleOptions,
    @Optional() storageService: ThrottlerStorage,
    reflector: Reflector,
    @Optional() private readonly ipBlockingService?: IPBlockingService,
    @Optional() private readonly ipWhitelistService?: IPWhitelistService,
  ) {
    super(options, storageService, reflector);
    this.customReflector = reflector;

    // Warn if critical security services are not provided
    if (!this.ipBlockingService) {
      this.logger.warn(
        'IPBlockingService not provided. IP blocking and violation tracking disabled.',
      );
    }
    if (!this.ipWhitelistService) {
      this.logger.warn(
        'IPWhitelistService not provided. IP whitelisting disabled.',
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const ip = this.getIP(request);

    // Check if IP is whitelisted - skip all rate limiting if so
    if (this.ipWhitelistService?.isWhitelisted(ip)) {
      this.logger.debug(`Whitelisted IP bypassing rate limit: ${ip}`);
      return true;
    }

    // If IP blocking service is available, check if IP is blocked
    if (this.ipBlockingService) {
      if (this.ipBlockingService.isBlocked(ip)) {
        this.logger.warn(`Blocked request from IP: ${ip}`);
        throw new ForbiddenException(
          `IP ${ip} is temporarily blocked due to excessive rate limit violations`,
        );
      }

      try {
        // Check for custom rate limits from @RateLimit decorator
        let customRateLimit: RateLimitOptions | undefined;
        if (this.customReflector) {
          const handler = context.getHandler();
          customRateLimit = this.customReflector.get<RateLimitOptions>(
            RATE_LIMIT_OPTIONS_KEY,
            handler,
          );
        }

        // Note: Custom rate limits from @RateLimit decorator need to be enforced
        // by also adding @Throttle decorator with matching values to the endpoint.
        // The @RateLimit decorator stores metadata for documentation and admin stats.
        if (customRateLimit) {
          this.logger.debug(
            `Custom rate limit metadata detected for ${request.url}: ${customRateLimit.limit} req/${customRateLimit.ttl}s`,
          );
        }

        // Proceed with parent's default rate limiting logic (uses @Throttle decorator limits)
        return await super.canActivate(context);
      } catch (error) {
        // Record violation when rate limit is exceeded
        if (error instanceof ThrottlerException) {
          this.ipBlockingService.recordViolation(ip);
          const violations = this.ipBlockingService.getViolations(ip);
          this.logger.warn(
            `Rate limit violation from IP ${ip} - Violations: ${violations}`,
          );
        }
        throw error;
      }
    }

    // If no IP blocking service, just use parent's logic
    return await super.canActivate(context);
  }

  protected getTracker(req: Record<string, unknown>): Promise<string> {
    // Usar IP + user ID (si existe) como tracker para limitar por usuario
    const request = req as unknown as RequestWithUser;
    const userId = request.user?.userId;
    const ip = this.getIP(request as Request);

    return Promise.resolve(userId ? `user-${userId}-${ip}` : `ip-${ip}`);
  }

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const {
      context,
      limit,
      ttl,
      throttler,
      blockDuration,
      getTracker,
      generateKey,
    } = requestProps;

    // Obtener el request y verificar si el usuario es premium
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userPlan = request.user?.plan || 'free';

    // Los usuarios premium tienen el doble de límite
    const adjustedLimit = userPlan === 'premium' ? limit * 2 : limit;

    // Llamar a la implementación base con el límite ajustado
    return super.handleRequest({
      context,
      limit: adjustedLimit,
      ttl,
      throttler,
      blockDuration,
      getTracker,
      generateKey,
    });
  }

  private getIP(request: Request): string {
    // x-forwarded-for can contain multiple IPs (comma-separated)
    // Extract and sanitize the first IP (client's real IP)
    const forwarded = request.headers?.['x-forwarded-for'] as string;
    if (forwarded) {
      const ip = forwarded.split(',')[0].trim();
      return ip || request.ip || 'unknown';
    }
    return request.ip || 'unknown';
  }
}
