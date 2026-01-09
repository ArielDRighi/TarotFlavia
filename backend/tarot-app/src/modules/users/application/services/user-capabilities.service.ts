import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { UsersService } from '../../users.service';
import { UsageLimitsService } from '../../../usage-limits/usage-limits.service';
import { PlanConfigService } from '../../../plan-config/plan-config.service';
import { DailyReading } from '../../../tarot/daily-reading/entities/daily-reading.entity';
import {
  UserCapabilitiesDto,
  UserPlanType,
} from '../dto/user-capabilities.dto';
import { UsageFeature } from '../../../usage-limits/entities/usage-limit.entity';
import { UserPlan } from '../../entities/user.entity';

@Injectable()
export class UserCapabilitiesService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usageLimitsService: UsageLimitsService,
    private readonly planConfigService: PlanConfigService,
    @InjectRepository(DailyReading)
    private readonly dailyReadingRepository: Repository<DailyReading>,
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
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const existingDailyReading = await this.dailyReadingRepository.findOne({
      where: {
        userId,
        readingDate: MoreThanOrEqual(today),
      },
    });

    const dailyCardUsage = existingDailyReading ? 1 : 0;

    // Obtener uso de tiradas de tarot desde usage_limits
    const tarotUsage = await this.usageLimitsService.getUsage(
      userId,
      UsageFeature.TAROT_READING,
    );

    // Calcular capabilities
    const dailyCardLimit =
      planConfig.dailyCardLimit === -1 ? 999999 : planConfig.dailyCardLimit;
    const tarotLimit =
      planConfig.tarotReadingsLimit === -1
        ? 999999
        : planConfig.tarotReadingsLimit;

    const resetAt = this.getNextMidnightUTC();

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

    // Solo verificar si tenemos fingerprint válido
    if (fingerprint && fingerprint.length > 0) {
      // Query the daily_reading table directly for today's reading
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const existingReading = await this.dailyReadingRepository.findOne({
        where: {
          anonymousFingerprint: fingerprint,
          readingDate: MoreThanOrEqual(today),
        },
      });

      if (existingReading) {
        dailyCardUsed = 1;
        canCreateDailyReading = false;
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
