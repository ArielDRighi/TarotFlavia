import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UsageLimitsService } from '../../../usage-limits/usage-limits.service';
import { PlanConfigService } from '../../../plan-config/plan-config.service';
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
  ) {}

  /**
   * Obtiene las capabilities computadas para un usuario
   * @param userId - ID del usuario (null para anónimos)
   * @returns UserCapabilitiesDto con todos los límites y permisos
   */
  async getCapabilities(userId: number | null): Promise<UserCapabilitiesDto> {
    // Si no hay userId, retornar capabilities anónimas
    if (!userId) {
      return this.getAnonymousCapabilities();
    }

    // Obtener datos del usuario
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Obtener configuración del plan
    const planConfig = await this.planConfigService.findByPlanType(user.plan);

    // Obtener uso actual de cada feature
    const dailyCardUsage = await this.usageLimitsService.getUsage(
      userId,
      UsageFeature.DAILY_CARD,
    );
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
   */
  private getAnonymousCapabilities(): UserCapabilitiesDto {
    const resetAt = this.getNextMidnightUTC();

    return {
      dailyCard: {
        used: 0,
        limit: 1,
        canUse: true,
        resetAt,
      },
      tarotReadings: {
        used: 0,
        limit: 0,
        canUse: false,
        resetAt,
      },
      canCreateDailyReading: true,
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
