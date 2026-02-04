import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, IsNull } from 'typeorm';
import { UsersService } from '../../users.service';
import { UsageLimitsService } from '../../../usage-limits/usage-limits.service';
import { AnonymousTrackingService } from '../../../usage-limits/services/anonymous-tracking.service';
import { PlanConfigService } from '../../../plan-config/plan-config.service';
import { DailyReading } from '../../../tarot/daily-reading/entities/daily-reading.entity';
import { TarotReading } from '../../../tarot/readings/entities/tarot-reading.entity';
import {
  UserCapabilitiesDto,
  UserPlanType,
} from '../dto/user-capabilities.dto';
import { UserPlan } from '../../entities/user.entity';
import {
  getTodayUTCDateString,
  getStartOfTodayUTC,
} from '../../../../common/utils/date.utils';
import { UsageFeature } from '../../../usage-limits/entities/usage-limit.entity';

@Injectable()
export class UserCapabilitiesService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usageLimitsService: UsageLimitsService,
    private readonly anonymousTrackingService: AnonymousTrackingService,
    private readonly planConfigService: PlanConfigService,
    @InjectRepository(DailyReading)
    private readonly dailyReadingRepository: Repository<DailyReading>,
    @InjectRepository(TarotReading)
    private readonly tarotReadingRepository: Repository<TarotReading>,
  ) {}

  /**
   * Obtiene las capabilities computadas para un usuario
   * @param userId - ID del usuario (null para anónimos)
   * @param fingerprint - Fingerprint del cliente (solo para anónimos, para verificar uso previo)
   * @returns UserCapabilitiesDto con todos los límites y permisos
   */
  async getCapabilities(
    userId: number | null,
    fingerprint?: string | null,
  ): Promise<UserCapabilitiesDto> {
    // Si no hay userId, retornar capabilities anónimas
    if (!userId) {
      return this.getAnonymousCapabilities(fingerprint || null);
    }

    // Obtener datos del usuario
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Obtener configuración del plan
    const planConfig = await this.planConfigService.findByPlanType(user.plan);

    // Obtener uso actual de carta del día consultando directamente daily_reading
    // Esto garantiza consistencia con la tabla real de lecturas
    // BUG-CAP-001 FIX: Use string comparison for DATE column (not MoreThanOrEqual with Date object)
    // The readingDate column is type DATE (YYYY-MM-DD), so we must use string equality
    const todayStr = getTodayUTCDateString();

    const existingDailyReading = await this.dailyReadingRepository
      .createQueryBuilder('daily_reading')
      .where('daily_reading.user_id = :userId', { userId })
      .andWhere('daily_reading.reading_date = :date', { date: todayStr })
      .getOne();

    const dailyCardUsage = existingDailyReading ? 1 : 0;

    // Obtener uso de tiradas de tarot consultando directamente la tabla tarot_reading
    // Esto garantiza consistencia con la tabla real de lecturas
    // For TIMESTAMP columns, MoreThanOrEqual with Date object works correctly
    const startOfToday = getStartOfTodayUTC();
    const tarotReadingsCount = await this.tarotReadingRepository.count({
      where: {
        user: { id: userId },
        createdAt: MoreThanOrEqual(startOfToday),
        deletedAt: IsNull(), // Solo contar lecturas no eliminadas
      },
    });

    const tarotUsage = tarotReadingsCount;

    // Calcular capabilities
    const dailyCardLimit =
      planConfig.dailyCardLimit === -1 ? 999999 : planConfig.dailyCardLimit;
    const tarotLimit =
      planConfig.tarotReadingsLimit === -1
        ? 999999
        : planConfig.tarotReadingsLimit;

    const resetAt = this.getNextMidnightUTC();

    // Obtener límites del péndulo según el plan del usuario
    const pendulumConfig = await this.planConfigService.getPendulumLimit(
      user.plan,
    );
    const pendulumUsage = await this.usageLimitsService.getUsage(
      userId,
      UsageFeature.PENDULUM_QUERY,
    );

    // Calcular resetAt del péndulo según el período
    let pendulumResetAt: string | null = null;
    if (pendulumConfig.period === 'daily') {
      pendulumResetAt = resetAt; // Usa el mismo resetAt (próxima medianoche UTC)
    } else if (pendulumConfig.period === 'monthly') {
      // Calcular primer día del próximo mes
      const nextMonth = new Date();
      nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
      nextMonth.setUTCDate(1);
      nextMonth.setUTCHours(0, 0, 0, 0);
      pendulumResetAt = nextMonth.toISOString();
    }
    // Si es 'lifetime', pendulumResetAt se queda en null

    return {
      dailyCard: {
        used: dailyCardUsage,
        limit: dailyCardLimit,
        canUse: dailyCardUsage < dailyCardLimit,
        resetAt,
      },
      tarotReadings: {
        used: tarotUsage,
        limit: tarotLimit,
        canUse: tarotUsage < tarotLimit,
        resetAt,
      },
      canCreateDailyReading: dailyCardUsage < dailyCardLimit,
      canCreateTarotReading: tarotUsage < tarotLimit,
      canUseAI: user.plan === UserPlan.PREMIUM,
      canUseCustomQuestions: user.plan === UserPlan.PREMIUM,
      canUseAdvancedSpreads: user.plan === UserPlan.PREMIUM,
      plan: this.mapUserPlanToType(user.plan),
      isAuthenticated: true,
      pendulum: {
        used: pendulumUsage,
        limit: pendulumConfig.limit,
        canUse: pendulumUsage < pendulumConfig.limit,
        resetAt: pendulumResetAt,
        period: pendulumConfig.period,
      },
    };
  }

  /**
   * Retorna capabilities para usuarios anónimos
   * Según MODELO_NEGOCIO_DEFINIDO.md:
   * - 1 carta del día
   * - 0 tiradas de tarot
   *
   * Consulta directamente la tabla daily_readings por anonymous_fingerprint
   * para verificar si el usuario anónimo ya usó su carta del día.
   *
   * @param fingerprint - Fingerprint del cliente (generado en frontend)
   */
  private async getAnonymousCapabilities(
    fingerprint: string | null,
  ): Promise<UserCapabilitiesDto> {
    const resetAt = this.getNextMidnightUTC();

    // Check actual usage for anonymous user via fingerprint
    let dailyCardUsed = 0;
    let canCreateDailyReading = true;
    let pendulumUsed = 0;
    let canUsePendulum = true;

    // Solo verificar si tenemos fingerprint válido
    if (fingerprint && fingerprint.length > 0) {
      // Query the daily_reading table directly for today's reading
      // BUG-CAP-001 FIX: Use string comparison for DATE column
      const todayStr = getTodayUTCDateString();

      const existingReading = await this.dailyReadingRepository
        .createQueryBuilder('daily_reading')
        .where('daily_reading.anonymous_fingerprint = :fingerprint', {
          fingerprint,
        })
        .andWhere('daily_reading.reading_date = :date', { date: todayStr })
        .getOne();

      if (existingReading) {
        dailyCardUsed = 1;
        canCreateDailyReading = false;
      }

      // Verificar si ya usó su consulta lifetime del péndulo
      const canAccessPendulum =
        await this.anonymousTrackingService.canAccessLifetime(
          fingerprint,
          UsageFeature.PENDULUM_QUERY,
        );
      if (!canAccessPendulum) {
        pendulumUsed = 1;
        canUsePendulum = false;
      }
    }

    return {
      dailyCard: {
        used: dailyCardUsed,
        limit: 1,
        canUse: canCreateDailyReading,
        resetAt,
      },
      tarotReadings: {
        used: 0,
        limit: 0,
        canUse: false,
        resetAt,
      },
      canCreateDailyReading,
      canCreateTarotReading: false,
      canUseAI: false,
      canUseCustomQuestions: false,
      canUseAdvancedSpreads: false,
      plan: UserPlanType.ANONYMOUS,
      isAuthenticated: false,
      pendulum: {
        used: pendulumUsed,
        limit: 1,
        canUse: canUsePendulum,
        resetAt: null,
        period: 'lifetime',
      },
    };
  }

  /**
   * Calcula la próxima medianoche UTC
   * @returns Fecha ISO 8601 de la próxima medianoche UTC
   */
  private getNextMidnightUTC(): string {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }

  /**
   * Mapea UserPlan (entity) a UserPlanType (DTO)
   */
  private mapUserPlanToType(plan: UserPlan): UserPlanType {
    switch (plan) {
      case UserPlan.FREE:
        return UserPlanType.FREE;
      case UserPlan.PREMIUM:
        return UserPlanType.PREMIUM;
      default:
        return UserPlanType.FREE;
    }
  }
}
