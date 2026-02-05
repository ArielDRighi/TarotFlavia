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
import { Repository } from 'typeorm';
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
import {
  getTodayUTCDateString,
  getStartOfTodayUTC,
} from '../../../common/utils/date.utils';

/** Standard error message for daily limit reached */
const DAILY_LIMIT_ERROR_MESSAGE =
  'Has alcanzado tu límite diario para esta función. Tu cuota se restablecerá a medianoche (00:00 UTC). Intenta nuevamente mañana o actualiza tu plan para obtener más acceso.';

/**
 * Guard that checks usage limits for various features.
 *
 * This guard supports three types of limit checking:
 * 1. DAILY_CARD: Checks daily_readings table (1 per day, uses DATE column)
 * 2. TAROT_READING: Checks tarot_reading table (variable limit by plan, uses TIMESTAMP)
 * 3. Other features: Uses usage_limits table
 *
 * All date comparisons use UTC to ensure consistent 24-hour reset cycles.
 */
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

    const feature = this.extractFeature(context);
    if (!feature) {
      this.logger.debug('No feature specified, skipping guard');
      return true;
    }

    const allowAnonymous = this.reflector.getAllAndOverride<boolean>(
      ALLOW_ANONYMOUS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { userId: number } }>();
    const userId = request.user?.userId;

    this.logger.debug(`Feature: ${feature}, UserId: ${userId}`);

    // Authenticated user flow
    if (userId) {
      return this.checkAuthenticatedUserLimit(userId, feature);
    }

    // Anonymous user flow
    if (allowAnonymous) {
      return this.checkAnonymousUserLimit(request, feature);
    }

    throw new ForbiddenException('Usuario no autenticado');
  }

  /**
   * Extracts the usage feature from decorator metadata.
   */
  private extractFeature(context: ExecutionContext): UsageFeature | undefined {
    return this.reflector.getAllAndOverride<UsageFeature>(
      USAGE_LIMIT_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );
  }

  /**
   * Checks usage limits for authenticated users.
   * Routes to appropriate checker based on feature type.
   */
  private async checkAuthenticatedUserLimit(
    userId: number,
    feature: UsageFeature,
  ): Promise<boolean> {
    switch (feature) {
      case UsageFeature.DAILY_CARD:
        return this.checkDailyCardLimit(userId);
      case UsageFeature.TAROT_READING:
        return this.checkTarotReadingLimit(userId);
      default:
        return this.checkGenericFeatureLimit(userId, feature);
    }
  }

  /**
   * Checks if user has already generated their daily card today.
   *
   * Uses string date comparison ('YYYY-MM-DD') for PostgreSQL DATE columns
   * to ensure consistent behavior across timezones.
   */
  private async checkDailyCardLimit(userId: number): Promise<boolean> {
    const todayStr = getTodayUTCDateString();
    this.logger.debug(
      `Checking DAILY_CARD for userId=${userId}, date=${todayStr}`,
    );

    const existingReading = await this.dailyReadingRepository
      .createQueryBuilder('daily_reading')
      .where('daily_reading.user_id = :userId', { userId })
      .andWhere('daily_reading.reading_date = :date', { date: todayStr })
      .getOne();

    this.logger.debug(`DAILY_CARD exists: ${!!existingReading}`);

    if (existingReading) {
      throw new ForbiddenException(DAILY_LIMIT_ERROR_MESSAGE);
    }

    return true;
  }

  /**
   * Checks if user has reached their tarot reading limit for today.
   *
   * Uses TIMESTAMP comparison with start of day UTC for accurate counting.
   */
  private async checkTarotReadingLimit(userId: number): Promise<boolean> {
    this.logger.debug(`Checking TAROT_READING for userId=${userId}`);

    // Get user and plan configuration
    const user = await this.usersService.findById(userId);
    if (!user) {
      this.logger.warn(`User not found for userId=${userId}`);
      throw new UnauthorizedException(
        'Usuario no encontrado. Por favor, inicia sesión nuevamente.',
      );
    }

    const planConfig = await this.planConfigService.findByPlanType(user.plan);
    if (!planConfig) {
      throw new ForbiddenException('Configuración de plan no encontrada');
    }

    this.logger.debug(
      `User plan: ${user.plan}, limit: ${planConfig.tarotReadingsLimit}`,
    );

    // Unlimited access
    if (planConfig.tarotReadingsLimit === -1) {
      this.logger.debug('UNLIMITED ACCESS - ALLOWING');
      return true;
    }

    // Count today's readings using start of day UTC
    const startOfToday = getStartOfTodayUTC();
    const todayStr = getTodayUTCDateString();

    const readingsCount = await this.tarotReadingRepository
      .createQueryBuilder('tarot_reading')
      .where('tarot_reading.userId = :userId', { userId })
      .andWhere('tarot_reading.createdAt >= :startOfToday', { startOfToday })
      .andWhere('tarot_reading.deletedAt IS NULL')
      .getCount();

    this.logger.debug(
      `TAROT_READING count for ${todayStr}: ${readingsCount}/${planConfig.tarotReadingsLimit}`,
    );

    if (readingsCount >= planConfig.tarotReadingsLimit) {
      this.logger.debug('BLOCKING - limit reached');
      throw new ForbiddenException(DAILY_LIMIT_ERROR_MESSAGE);
    }

    this.logger.debug('ALLOWING - under limit');
    return true;
  }

  /**
   * Checks generic feature limits using the usage_limits table.
   */
  private async checkGenericFeatureLimit(
    userId: number,
    feature: UsageFeature,
  ): Promise<boolean> {
    this.logger.debug(
      `Checking ${feature} via usage_limits for userId=${userId}`,
    );

    const canUse = await this.usageLimitsService.checkLimit(userId, feature);
    this.logger.debug(`${feature} check result: ${canUse}`);

    if (!canUse) {
      throw new ForbiddenException(DAILY_LIMIT_ERROR_MESSAGE);
    }

    return true;
  }

  /**
   * Checks usage limits for anonymous users.
   * Supports both daily limits (default) and lifetime limits (for PENDULUM_QUERY).
   */
  private async checkAnonymousUserLimit(
    request: Request,
    feature: UsageFeature,
  ): Promise<boolean> {
    // PENDULUM_QUERY has a special lifetime limit (1 total, not daily)
    if (feature === UsageFeature.PENDULUM_QUERY) {
      return this.checkPendulumLifetimeLimit(request);
    }

    // Default: daily limit (for DAILY_CARD, TAROT_READING, etc.)
    const canAccess = await this.anonymousTrackingService.canAccess(request);

    if (!canAccess) {
      throw new ForbiddenException(
        'Ya viste tu carta del día. Regístrate para más lecturas.',
      );
    }

    await this.anonymousTrackingService.recordUsage(request);
    return true;
  }

  /**
   * Checks lifetime limit for anonymous pendulum queries (1 total, forever).
   */
  private async checkPendulumLifetimeLimit(request: Request): Promise<boolean> {
    const ip = request.ip || '';
    const userAgent = request.headers['user-agent'] || '';
    const fingerprint = this.anonymousTrackingService.generateFingerprint(
      ip,
      userAgent,
    );

    const canAccess = await this.anonymousTrackingService.canAccessLifetime(
      fingerprint,
      UsageFeature.PENDULUM_QUERY,
    );

    if (!canAccess) {
      throw new ForbiddenException(
        'Ya has usado tu consulta gratuita del Péndulo. Regístrate para obtener más consultas.',
      );
    }

    await this.anonymousTrackingService.recordLifetimeUsage(
      fingerprint,
      ip,
      UsageFeature.PENDULUM_QUERY,
    );
    return true;
  }
}
