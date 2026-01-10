import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, IsNull } from 'typeorm';
import { Request } from 'express';
import { UsageLimitsService } from '../usage-limits.service';
import { AnonymousTrackingService } from '../services/anonymous-tracking.service';
import { UsageFeature } from '../entities/usage-limit.entity';
import { DailyReading } from '../../tarot/daily-reading/entities/daily-reading.entity';
import { TarotReading } from '../../tarot/readings/entities/tarot-reading.entity';
import { UsersService } from '../../users/users.service';
import { PlanConfigService } from '../../plan-config/plan-config.service';
import { USAGE_LIMIT_FEATURE_KEY } from '../decorators/check-usage-limit.decorator';
import { ALLOW_ANONYMOUS_KEY } from '../decorators/allow-anonymous.decorator';

@Injectable()
export class CheckUsageLimitGuard implements CanActivate {
  private readonly logger = new Logger(CheckUsageLimitGuard.name);

  constructor(
    private readonly usageLimitsService: UsageLimitsService,
    private readonly anonymousTrackingService: AnonymousTrackingService,
    private readonly usersService: UsersService,
    private readonly planConfigService: PlanConfigService,
    private readonly reflector: Reflector,
    @InjectRepository(DailyReading)
    private readonly dailyReadingRepository: Repository<DailyReading>,
    @InjectRepository(TarotReading)
    private readonly tarotReadingRepository: Repository<TarotReading>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug('Guard execution started');

    // Extract feature from decorator metadata
    const feature = this.reflector.getAllAndOverride<UsageFeature>(
      USAGE_LIMIT_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    this.logger.debug(`Feature extracted: ${feature}`);

    // If no feature is specified, skip the guard
    if (!feature) {
      this.logger.debug('No feature specified, skipping guard');
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

    this.logger.debug(`UserId: ${userId}`);

    // If user is authenticated, use normal usage limit checking
    if (userId) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // For DAILY_CARD, check the daily_reading table directly
      if (feature === UsageFeature.DAILY_CARD) {
        this.logger.debug(
          `Checking DAILY_CARD for userId=${userId}, today=${today.toISOString()}`,
        );

        const existingReading = await this.dailyReadingRepository.findOne({
          where: {
            userId,
            readingDate: MoreThanOrEqual(today),
          },
        });

        this.logger.debug(
          `DAILY_CARD check result: existingReading=${!!existingReading}`,
        );

        if (existingReading) {
          throw new ForbiddenException(
            `Has alcanzado tu límite diario para esta función. Tu cuota se restablecerá a medianoche (00:00 UTC). Intenta nuevamente mañana o actualiza tu plan para obtener más acceso.`,
          );
        }

        return true;
      }

      // For TAROT_READING, check the tarot_reading table directly
      if (feature === UsageFeature.TAROT_READING) {
        this.logger.debug('=== TAROT_READING GUARD CHECK START ===');
        this.logger.debug(`userId=${userId}, today=${today.toISOString()}`);

        // Get user's plan and limits
        const user = await this.usersService.findById(userId);
        if (!user) {
          this.logger.warn(
            `User not found for userId=${userId}. This may indicate stale JWT token or data integrity issue.`,
          );
          throw new UnauthorizedException(
            'Usuario no encontrado. Por favor, inicia sesión nuevamente.',
          );
        }
        this.logger.debug(`User found: plan=${user.plan}`);

        const planConfig = await this.planConfigService.findByPlanType(
          user.plan,
        );
        if (!planConfig) {
          throw new ForbiddenException('Configuración de plan no encontrada');
        }
        this.logger.debug(
          `Plan config: limit=${planConfig.tarotReadingsLimit}`,
        );

        // Check if user has unlimited access (-1)
        if (planConfig.tarotReadingsLimit === -1) {
          this.logger.debug('UNLIMITED ACCESS - ALLOWING');
          return true;
        }

        // Count readings created today (excluding soft-deleted ones)
        const readingsCount = await this.tarotReadingRepository.count({
          where: {
            user: { id: userId },
            createdAt: MoreThanOrEqual(today),
            deletedAt: IsNull(),
          },
        });

        this.logger.debug(
          `COUNT=${readingsCount}, LIMIT=${planConfig.tarotReadingsLimit}`,
        );

        if (readingsCount >= planConfig.tarotReadingsLimit) {
          this.logger.debug('BLOCKING - COUNT >= LIMIT');
          throw new ForbiddenException(
            `Has alcanzado tu límite diario para esta función. Tu cuota se restablecerá a medianoche (00:00 UTC). Intenta nuevamente mañana o actualiza tu plan para obtener más acceso.`,
          );
        }

        this.logger.debug('ALLOWING - COUNT < LIMIT');
        return true;
      }

      // For other features, use usage_limits table
      this.logger.debug(
        `Checking ${feature} using usage_limits table for userId=${userId}`,
      );
      const canUse = await this.usageLimitsService.checkLimit(userId, feature);
      this.logger.debug(`Result: canUse=${canUse}`);

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

      // Record usage after successful access check
      await this.anonymousTrackingService.recordUsage(request);

      return true;
    }

    // If user is not authenticated and anonymous access is not allowed
    throw new ForbiddenException('Usuario no autenticado');
  }
}
