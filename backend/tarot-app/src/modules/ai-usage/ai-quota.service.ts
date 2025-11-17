import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User, UserPlan } from '../users/entities/user.entity';
import { AI_MONTHLY_QUOTAS } from './constants/ai-usage.constants';
import { startOfMonth } from 'date-fns/startOfMonth';
import { addMonths } from 'date-fns/addMonths';

export interface QuotaInfo {
  quotaLimit: number;
  requestsUsed: number;
  requestsRemaining: number;
  percentageUsed: number;
  resetDate: Date;
  warningTriggered: boolean;
  plan: UserPlan;
  tokensUsed: number;
  costEstimated: number;
  providerPrimarilyUsed: string | null;
}

@Injectable()
export class AIQuotaService {
  private readonly logger = new Logger(AIQuotaService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Verifica si el usuario tiene cuota mensual disponible
   * @param userId - ID del usuario
   * @returns true si el usuario NO ha excedido su cuota mensual
   */
  async checkMonthlyQuota(userId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // PREMIUM users tienen cuota ilimitada
    if (user.plan === UserPlan.PREMIUM) {
      return true;
    }

    const quota = AI_MONTHLY_QUOTAS[user.plan];
    const hasQuotaAvailable = user.aiRequestsUsedMonth < quota.hardLimit;

    if (!hasQuotaAvailable) {
      this.logger.warn(
        `User ${userId} has exceeded monthly quota: ${user.aiRequestsUsedMonth}/${quota.hardLimit}`,
      );
    }

    return hasQuotaAvailable;
  }

  /**
   * Obtiene información detallada de la cuota del usuario
   * @param userId - ID del usuario
   * @returns Información completa de la cuota
   */
  async getRemainingQuota(userId: number): Promise<QuotaInfo> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const quota = AI_MONTHLY_QUOTAS[user.plan];
    const isPremium = user.plan === UserPlan.PREMIUM;

    const quotaLimit = quota.maxRequests;
    const requestsUsed = user.aiRequestsUsedMonth;
    const requestsRemaining = isPremium
      ? -1
      : Math.max(0, quota.maxRequests - requestsUsed);

    const percentageUsed =
      isPremium || quota.maxRequests === 0
        ? 0
        : Math.round((requestsUsed / quota.maxRequests) * 100);

    const resetDate = this.getNextResetDate();

    return {
      quotaLimit,
      requestsUsed,
      requestsRemaining,
      percentageUsed,
      resetDate,
      warningTriggered: user.quotaWarningSent,
      plan: user.plan,
      tokensUsed: user.aiTokensUsedMonth,
      costEstimated: user.aiCostUsdMonth,
      providerPrimarilyUsed: user.aiProviderUsed,
    };
  }

  /**
   * Registra el uso mensual de IA de un usuario
   * @param userId - ID del usuario
   * @param requests - Número de requests (normalmente 1)
   * @param tokens - Tokens usados
   * @param cost - Costo en USD
   * @param provider - Proveedor de IA usado
   */
  async trackMonthlyUsage(
    userId: number,
    requests: number,
    tokens: number,
    cost: number,
    provider: string,
  ): Promise<void> {
    // Validate provider to prevent invalid data
    const validProviders = ['openai', 'groq', 'deepseek', 'anthropic'];
    if (provider && !validProviders.includes(provider.toLowerCase())) {
      this.logger.warn(
        `Invalid AI provider "${provider}" for user ${userId}, using anyway`,
      );
    }

    // Incrementar contadores de forma atómica
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        aiRequestsUsedMonth: () => 'ai_requests_used_month + :requests',
        aiTokensUsedMonth: () => 'ai_tokens_used_month + :tokens',
        aiCostUsdMonth: () => 'ai_cost_usd_month + :cost',
        aiProviderUsed: provider,
      })
      .setParameters({ requests, tokens, cost })
      .where('id = :id', { id: userId })
      .execute();

    // Verificar si se deben enviar notificaciones
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.plan === UserPlan.PREMIUM) {
      return;
    }

    const quota = AI_MONTHLY_QUOTAS[user.plan];
    // user.aiRequestsUsedMonth already includes the atomic increment above
    const usageAfterUpdate = user.aiRequestsUsedMonth;
    const percentageUsed = (usageAfterUpdate / quota.maxRequests) * 100;

    // Soft limit: 80% - enviar warning (solo una vez)
    if (percentageUsed >= 80 && !user.quotaWarningSent) {
      this.sendQuotaWarning(user, percentageUsed);
      user.quotaWarningSent = true;
      await this.userRepository.save(user);
    }

    // Hard limit: 100% - loggear bloqueo
    if (usageAfterUpdate >= quota.hardLimit) {
      this.logger.warn(
        `User ${userId} has reached hard limit: ${usageAfterUpdate}/${quota.hardLimit}`,
      );
    }
  }

  /**
   * Cron job que resetea las cuotas mensuales el día 1 de cada mes a las 00:00
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async resetMonthlyQuotas(): Promise<void> {
    this.logger.log('Starting monthly AI quota reset...');

    const resetDate = startOfMonth(new Date());

    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        aiRequestsUsedMonth: 0,
        aiCostUsdMonth: 0,
        aiTokensUsedMonth: 0,
        quotaWarningSent: false,
        aiUsageResetAt: resetDate,
      })
      .execute();

    this.logger.log(
      `Monthly AI quota reset completed. ${result.affected} users reset.`,
    );
  }

  /**
   * Obtiene la fecha del próximo reset (primer día del siguiente mes)
   */
  private getNextResetDate(): Date {
    const now = new Date();
    const nextMonth = addMonths(now, 1);
    return startOfMonth(nextMonth);
  }

  /**
   * Envía advertencia de cuota al usuario (placeholder para integración con EmailService)
   */
  private sendQuotaWarning(user: User, percentageUsed: number): void {
    // TODO: Integrar con EmailService cuando esté disponible (TASK-040)
    this.logger.warn(
      `User ${user.id} (${user.email}) has reached ${Math.round(percentageUsed)}% of monthly AI quota`,
    );

    // Futura integración:
    // await this.emailService.sendQuotaWarning(user.email, {
    //   percentageUsed: Math.round(percentageUsed),
    //   quotaLimit: AI_MONTHLY_QUOTAS[user.plan].maxRequests,
    //   resetDate: this.getNextResetDate(),
    // });
  }
}
