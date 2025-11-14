import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, IsNull } from 'typeorm';
import { User, UserPlan } from '../users/entities/user.entity';
import { TarotReading } from '../tarot/readings/entities/tarot-reading.entity';
import {
  AIUsageLog,
  AIUsageStatus,
} from '../ai-usage/entities/ai-usage-log.entity';
import { TarotCard } from '../tarot/cards/entities/tarot-card.entity';
import { PredefinedQuestion } from '../predefined-questions/entities/predefined-question.entity';
import {
  DashboardMetricsDto,
  PlanDistributionDto,
  AIMetricsDto,
} from './dto/dashboard-metrics.dto';
import { RecentReadingDto } from './dto/recent-reading.dto';
import { RecentUserDto } from './dto/recent-user.dto';
import {
  StatsResponseDto,
  ChartsResponseDto,
  UserStatsDto,
  ReadingStatsDto,
  CardStatsDto,
  OpenAIStatsDto,
  QuestionStatsDto,
  NewRegistrationDto,
  CategoryDistributionDto,
  SpreadDistributionDto,
  ReadingsPerDayDto,
  TopCardDto,
  CardCategoryDistributionDto,
  ProviderUsageDto,
  AICostPerDayDto,
  TopQuestionDto,
} from './dto/stats-response.dto';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TarotReading)
    private readonly readingRepository: Repository<TarotReading>,
    @InjectRepository(AIUsageLog)
    private readonly aiUsageRepository: Repository<AIUsageLog>,
    @InjectRepository(TarotCard)
    private readonly cardRepository: Repository<TarotCard>,
    @InjectRepository(PredefinedQuestion)
    private readonly predefinedQuestionRepository: Repository<PredefinedQuestion>,
  ) {}

  async getMetrics(): Promise<DashboardMetricsDto> {
    const [
      userMetrics,
      readingMetrics,
      planDistribution,
      recentReadings,
      recentUsers,
      aiMetrics,
    ] = await Promise.all([
      this.getUserMetrics(),
      this.getReadingMetrics(),
      this.getPlanDistribution(),
      this.getRecentReadings(10),
      this.getRecentUsers(10),
      this.getAIMetrics(),
    ]);

    return {
      userMetrics,
      readingMetrics,
      planDistribution,
      recentReadings,
      recentUsers,
      aiMetrics,
    };
  }

  private async getUserMetrics() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalUsers = await this.userRepository.count();

    // Usuarios activos = usuarios que han hecho lecturas en el periodo (excluyendo soft-deleted)
    const activeUsersLast7Days = await this.readingRepository
      .createQueryBuilder('reading')
      .select('COUNT(DISTINCT reading.userId)', 'count')
      .where('reading.createdAt >= :date', { date: sevenDaysAgo })
      .andWhere('reading.deletedAt IS NULL')
      .getRawOne()
      .then((result: { count: string } | undefined) =>
        parseInt(result?.count || '0', 10),
      );

    const activeUsersLast30Days = await this.readingRepository
      .createQueryBuilder('reading')
      .select('COUNT(DISTINCT reading.userId)', 'count')
      .where('reading.createdAt >= :date', { date: thirtyDaysAgo })
      .andWhere('reading.deletedAt IS NULL')
      .getRawOne()
      .then((result: { count: string } | undefined) =>
        parseInt(result?.count || '0', 10),
      );

    return {
      totalUsers,
      activeUsersLast7Days,
      activeUsersLast30Days,
    };
  }

  private async getReadingMetrics() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalReadings = await this.readingRepository.count({
      where: { deletedAt: IsNull() },
    });

    const readingsLast7Days = await this.readingRepository.count({
      where: {
        createdAt: MoreThanOrEqual(sevenDaysAgo),
        deletedAt: IsNull(),
      },
    });

    const readingsLast30Days = await this.readingRepository.count({
      where: {
        createdAt: MoreThanOrEqual(thirtyDaysAgo),
        deletedAt: IsNull(),
      },
    });

    return {
      totalReadings,
      readingsLast7Days,
      readingsLast30Days,
    };
  }

  async getPlanDistribution(): Promise<PlanDistributionDto> {
    const freeUsers = await this.userRepository.count({
      where: { plan: UserPlan.FREE },
    });

    const premiumUsers = await this.userRepository.count({
      where: { plan: UserPlan.PREMIUM },
    });

    const totalUsers = freeUsers + premiumUsers;

    const freePercentage = totalUsers > 0 ? (freeUsers / totalUsers) * 100 : 0;
    const premiumPercentage =
      totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

    // Tasa de conversión: premium / (free + premium) * 100
    const conversionRate =
      totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

    return {
      freeUsers,
      premiumUsers,
      freePercentage: parseFloat(freePercentage.toFixed(2)),
      premiumPercentage: parseFloat(premiumPercentage.toFixed(2)),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
  }

  async getRecentReadings(limit = 10): Promise<RecentReadingDto[]> {
    const readings = await this.readingRepository
      .createQueryBuilder('reading')
      .leftJoinAndSelect('reading.user', 'user')
      .leftJoinAndSelect('reading.category', 'category')
      .where('reading.deletedAt IS NULL')
      .orderBy('reading.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return readings.map((reading) => {
      const user = reading.user as unknown as User;
      const category = reading.category as unknown as {
        id: number;
        name: string;
      } | null;

      return {
        id: reading.id,
        userEmail: user.email,
        userName: user.name,
        spreadType: null, // TODO: Implement spread relation when available
        category: category?.name || null,
        question:
          reading.questionType === 'custom'
            ? reading.customQuestion
            : reading.predefinedQuestionId
              ? `Pregunta #${reading.predefinedQuestionId}`
              : null,
        status: reading.interpretation ? 'completed' : 'pending',
        createdAt: reading.createdAt,
      };
    });
  }

  async getRecentUsers(limit = 10): Promise<RecentUserDto[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      createdAt: user.createdAt,
    }));
  }

  private async getAIMetrics(): Promise<AIMetricsDto> {
    const totalInterpretations = await this.aiUsageRepository.count();

    const usageByProviderRaw = await this.aiUsageRepository
      .createQueryBuilder('log')
      .select('log.provider', 'provider')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.provider')
      .getRawMany<{ provider: string; count: string }>();

    const usageByProvider = usageByProviderRaw.map((item) => ({
      provider: item.provider,
      count: parseInt(item.count, 10),
    }));

    return {
      totalInterpretations,
      usageByProvider,
    };
  }

  // ========== NEW METHODS FOR TASK-029 ==========

  /**
   * Get comprehensive statistics for admin dashboard
   * Returns detailed metrics for users, readings, cards, AI usage, and questions
   */
  async getStats(): Promise<StatsResponseDto> {
    const [users, readings, cards, openai, questions] = await Promise.all([
      this.getUserStats(),
      this.getReadingStats(),
      this.getCardStats(),
      this.getOpenAIStats(),
      this.getQuestionStats(),
    ]);

    return {
      users,
      readings,
      cards,
      openai,
      questions,
    };
  }

  /**
   * Get chart data for last 30 days
   * Returns data for user registrations, readings, and AI costs
   */
  async getCharts(): Promise<ChartsResponseDto> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [userRegistrations, readingsPerDay, aiCostsPerDay] =
      await Promise.all([
        this.getUserRegistrationsPerDay(thirtyDaysAgo),
        this.getReadingsPerDay(thirtyDaysAgo),
        this.getAICostsPerDay(thirtyDaysAgo),
      ]);

    return {
      userRegistrations,
      readingsPerDay,
      aiCostsPerDay,
    };
  }

  /**
   * Get detailed user statistics
   */
  async getUserStats(): Promise<UserStatsDto> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsersLast7Days,
      activeUsersLast30Days,
      planDistribution,
      newRegistrationsPerDay,
    ] = await Promise.all([
      this.userRepository.count(),
      this.getActiveUsersCount(sevenDaysAgo),
      this.getActiveUsersCount(thirtyDaysAgo),
      this.getPlanDistribution(),
      this.getUserRegistrationsPerDay(thirtyDaysAgo),
    ]);

    return {
      totalUsers,
      activeUsersLast7Days,
      activeUsersLast30Days,
      newRegistrationsPerDay,
      planDistribution: {
        freeUsers: planDistribution.freeUsers,
        premiumUsers: planDistribution.premiumUsers,
        freePercentage: planDistribution.freePercentage,
        premiumPercentage: planDistribution.premiumPercentage,
        conversionRate: planDistribution.conversionRate,
      },
    };
  }

  /**
   * Get detailed reading statistics
   */
  async getReadingStats(): Promise<ReadingStatsDto> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalReadings,
      readingsLast7Days,
      readingsLast30Days,
      averageReadingsPerUser,
      categoryDistribution,
      spreadDistribution,
      readingsPerDay,
    ] = await Promise.all([
      this.readingRepository.count({ where: { deletedAt: IsNull() } }),
      this.readingRepository.count({
        where: {
          createdAt: MoreThanOrEqual(sevenDaysAgo),
          deletedAt: IsNull(),
        },
      }),
      this.readingRepository.count({
        where: {
          createdAt: MoreThanOrEqual(thirtyDaysAgo),
          deletedAt: IsNull(),
        },
      }),
      this.getAverageReadingsPerUser(),
      this.getCategoryDistribution(),
      this.getSpreadDistribution(),
      this.getReadingsPerDay(thirtyDaysAgo),
    ]);

    return {
      totalReadings,
      readingsLast7Days,
      readingsLast30Days,
      averageReadingsPerUser,
      categoryDistribution,
      spreadDistribution,
      readingsPerDay,
    };
  }

  /**
   * Get detailed card statistics
   */
  async getCardStats(): Promise<CardStatsDto> {
    const [topCards, categoryDistribution, orientationRatio] =
      await Promise.all([
        this.getTopCards(),
        this.getCardCategoryDistribution(),
        this.getCardOrientationRatio(),
      ]);

    return {
      topCards,
      categoryDistribution,
      orientationRatio,
    };
  }

  /**
   * Get detailed OpenAI statistics
   */
  async getOpenAIStats(): Promise<OpenAIStatsDto> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalInterpretations,
      tokenStats,
      totalCostUsd,
      averageDurationMs,
      errorCount,
      cachedCount,
      usageByProvider,
      costsPerDay,
    ] = await Promise.all([
      this.aiUsageRepository.count(),
      this.getTokenStats(),
      this.getTotalCost(),
      this.getAverageDuration(),
      this.aiUsageRepository.count({
        where: { status: AIUsageStatus.ERROR },
      }),
      this.aiUsageRepository.count({
        where: { status: AIUsageStatus.CACHED },
      }),
      this.getProviderUsage(),
      this.getAICostsPerDay(thirtyDaysAgo),
    ]);

    const errorRate =
      totalInterpretations > 0 ? (errorCount / totalInterpretations) * 100 : 0;
    const cacheHitRate =
      totalInterpretations > 0 ? (cachedCount / totalInterpretations) * 100 : 0;

    return {
      totalInterpretations,
      totalTokens: tokenStats.totalTokens,
      averageTokens: tokenStats.averageTokens,
      totalCostUsd,
      averageDurationMs,
      errorRate: parseFloat(errorRate.toFixed(2)),
      cacheHitRate: parseFloat(cacheHitRate.toFixed(2)),
      usageByProvider,
      costsPerDay,
    };
  }

  /**
   * Get detailed question statistics
   */
  async getQuestionStats(): Promise<QuestionStatsDto> {
    const [topPredefinedQuestions, predefinedVsCustom] = await Promise.all([
      this.getTopPredefinedQuestions(),
      this.getPredefinedVsCustom(),
    ]);

    return {
      topPredefinedQuestions,
      predefinedVsCustom,
    };
  }

  // ========== HELPER METHODS ==========

  private async getActiveUsersCount(since: Date): Promise<number> {
    const result = await this.readingRepository
      .createQueryBuilder('reading')
      .select('COUNT(DISTINCT reading.userId)', 'count')
      .where('reading.createdAt >= :date', { date: since })
      .andWhere('reading.deletedAt IS NULL')
      .getRawOne<{ count: string }>();

    return parseInt(result?.count || '0', 10);
  }

  private async getUserRegistrationsPerDay(
    since: Date,
  ): Promise<NewRegistrationDto[]> {
    const rawData = await this.userRepository
      .createQueryBuilder('user')
      .select('DATE(user.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt >= :since', { since })
      .groupBy('DATE(user.createdAt)')
      .orderBy('DATE(user.createdAt)', 'ASC')
      .getRawMany<{ date: string; count: string }>();

    return rawData.map((item) => ({
      date: item.date,
      count: parseInt(item.count, 10),
    }));
  }

  private async getAverageReadingsPerUser(): Promise<number> {
    const result = await this.readingRepository
      .createQueryBuilder('reading')
      .select('COUNT(*)', 'totalReadings')
      .addSelect('COUNT(DISTINCT reading.userId)', 'totalUsers')
      .where('reading.deletedAt IS NULL')
      .getRawOne<{ totalReadings: string; totalUsers: string }>();

    const totalReadings = parseInt(result?.totalReadings || '0', 10);
    const totalUsers = parseInt(result?.totalUsers || '0', 10);

    return totalUsers > 0 ? totalReadings / totalUsers : 0;
  }

  private async getCategoryDistribution(): Promise<CategoryDistributionDto[]> {
    const rawData = await this.readingRepository
      .createQueryBuilder('reading')
      .leftJoin('reading.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('COUNT(*)', 'count')
      .where('reading.deletedAt IS NULL')
      .andWhere('category.id IS NOT NULL')
      .groupBy('category.id')
      .addGroupBy('category.name')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany<{
        categoryId: number;
        categoryName: string;
        count: string;
      }>();

    return rawData.map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      count: parseInt(item.count, 10),
    }));
  }

  private async getSpreadDistribution(): Promise<SpreadDistributionDto[]> {
    // Inferir el spread basándose en el número de cartas usadas
    // Esto es una implementación temporal hasta que se agregue la relación con Spread
    const rawData = await this.readingRepository
      .createQueryBuilder('reading')
      .select('jsonb_array_length(reading.cardPositions)', 'cardCount')
      .addSelect('COUNT(*)', 'count')
      .where('reading.deletedAt IS NULL')
      .groupBy('jsonb_array_length(reading.cardPositions)')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany<{ cardCount: number; count: string }>();

    // Map card count to spread names (temporary solution)
    const spreadNameMap: Record<number, string> = {
      1: 'Carta Única',
      3: 'Tres Cartas',
      5: 'Cruz Simple',
      10: 'Cruz Celta',
    };

    return rawData.map((item) => ({
      spreadName: spreadNameMap[item.cardCount] || `${item.cardCount} Cartas`,
      count: parseInt(item.count, 10),
    }));
  }

  private async getReadingsPerDay(since: Date): Promise<ReadingsPerDayDto[]> {
    const rawData = await this.readingRepository
      .createQueryBuilder('reading')
      .select('DATE(reading.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('reading.createdAt >= :since', { since })
      .andWhere('reading.deletedAt IS NULL')
      .groupBy('DATE(reading.createdAt)')
      .orderBy('DATE(reading.createdAt)', 'ASC')
      .getRawMany<{ date: string; count: string }>();

    return rawData.map((item) => ({
      date: item.date,
      count: parseInt(item.count, 10),
    }));
  }

  private async getTopCards(): Promise<TopCardDto[]> {
    const rawData = await this.readingRepository
      .createQueryBuilder('reading')
      .leftJoin('reading.cards', 'card')
      .select('card.id', 'cardId')
      .addSelect('card.name', 'name')
      .addSelect('COUNT(*)', 'count')
      .where('reading.deletedAt IS NULL')
      .andWhere('card.id IS NOT NULL')
      .groupBy('card.id')
      .addGroupBy('card.name')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany<{ cardId: number; name: string; count: string }>();

    return rawData.map((item) => ({
      cardId: item.cardId,
      name: item.name,
      count: parseInt(item.count, 10),
    }));
  }

  private async getCardCategoryDistribution(): Promise<
    CardCategoryDistributionDto[]
  > {
    const rawData = await this.readingRepository
      .createQueryBuilder('reading')
      .leftJoin('reading.cards', 'card')
      .select('card.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('reading.deletedAt IS NULL')
      .andWhere('card.category IS NOT NULL')
      .groupBy('card.category')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany<{ category: string; count: string }>();

    return rawData.map((item) => ({
      category: item.category,
      count: parseInt(item.count, 10),
    }));
  }

  private async getCardOrientationRatio(): Promise<{
    upright: number;
    reversed: number;
    uprightPercentage: number;
    reversedPercentage: number;
  }> {
    // Contar cartas derechas e invertidas usando PostgreSQL JSONB
    const result = await this.readingRepository
      .createQueryBuilder('reading')
      .select(
        `
        SUM((
          SELECT COUNT(*)
          FROM jsonb_array_elements(reading.cardPositions) AS position
          WHERE (position->>'isReversed')::boolean = false
        ))`,
        'upright',
      )
      .addSelect(
        `
        SUM((
          SELECT COUNT(*)
          FROM jsonb_array_elements(reading.cardPositions) AS position
          WHERE (position->>'isReversed')::boolean = true
        ))`,
        'reversed',
      )
      .where('reading.deletedAt IS NULL')
      .getRawOne<{ upright: string; reversed: string }>();

    const upright = parseInt(result?.upright || '0', 10);
    const reversed = parseInt(result?.reversed || '0', 10);
    const total = upright + reversed;

    const uprightPercentage = total > 0 ? (upright / total) * 100 : 0;
    const reversedPercentage = total > 0 ? (reversed / total) * 100 : 0;

    return {
      upright,
      reversed,
      uprightPercentage: parseFloat(uprightPercentage.toFixed(2)),
      reversedPercentage: parseFloat(reversedPercentage.toFixed(2)),
    };
  }

  private async getTokenStats(): Promise<{
    totalTokens: number;
    averageTokens: number;
  }> {
    const result = await this.aiUsageRepository
      .createQueryBuilder('log')
      .select('SUM(log.totalTokens)', 'totalTokens')
      .addSelect('AVG(log.totalTokens)', 'avgTokens')
      .getRawOne<{ totalTokens: string; avgTokens: string }>();

    const totalTokens = parseInt(result?.totalTokens || '0', 10);
    const averageTokens = parseFloat(result?.avgTokens || '0');

    return {
      totalTokens,
      averageTokens: Math.round(averageTokens),
    };
  }

  private async getTotalCost(): Promise<number> {
    const result = await this.aiUsageRepository
      .createQueryBuilder('log')
      .select('SUM(log.costUsd)', 'totalCost')
      .getRawOne<{ totalCost: string }>();

    return parseFloat(result?.totalCost || '0');
  }

  private async getAverageDuration(): Promise<number> {
    const result = await this.aiUsageRepository
      .createQueryBuilder('log')
      .select('AVG(log.durationMs)', 'avgDuration')
      .getRawOne<{ avgDuration: string }>();

    return Math.round(parseFloat(result?.avgDuration || '0'));
  }

  private async getProviderUsage(): Promise<ProviderUsageDto[]> {
    const rawData = await this.aiUsageRepository
      .createQueryBuilder('log')
      .select('log.provider', 'provider')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.provider')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany<{ provider: string; count: string }>();

    return rawData.map((item) => ({
      provider: item.provider,
      count: parseInt(item.count, 10),
    }));
  }

  private async getAICostsPerDay(since: Date): Promise<AICostPerDayDto[]> {
    const rawData = await this.aiUsageRepository
      .createQueryBuilder('log')
      .select('DATE(log.createdAt)', 'date')
      .addSelect('SUM(log.costUsd)', 'totalCost')
      .where('log.createdAt >= :since', { since })
      .groupBy('DATE(log.createdAt)')
      .orderBy('DATE(log.createdAt)', 'ASC')
      .getRawMany<{ date: string; totalCost: string }>();

    return rawData.map((item) => ({
      date: item.date,
      cost: parseFloat(parseFloat(item.totalCost || '0').toFixed(2)),
    }));
  }

  private async getTopPredefinedQuestions(): Promise<TopQuestionDto[]> {
    const rawData = await this.readingRepository
      .createQueryBuilder('reading')
      .leftJoin('reading.predefinedQuestion', 'question')
      .select('question.id', 'questionId')
      .addSelect('question.questionText', 'question')
      .addSelect('COUNT(*)', 'count')
      .where('reading.deletedAt IS NULL')
      .andWhere('reading.questionType = :type', { type: 'predefined' })
      .andWhere('question.id IS NOT NULL')
      .groupBy('question.id')
      .addGroupBy('question.questionText')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany<{ questionId: number; question: string; count: string }>();

    return rawData.map((item) => ({
      questionId: item.questionId,
      question: item.question,
      count: parseInt(item.count, 10),
    }));
  }

  private async getPredefinedVsCustom(): Promise<{
    predefinedCount: number;
    customCount: number;
    predefinedPercentage: number;
    customPercentage: number;
  }> {
    const result = await this.readingRepository
      .createQueryBuilder('reading')
      .select(
        "SUM(CASE WHEN reading.questionType = 'predefined' THEN 1 ELSE 0 END)",
        'predefinedCount',
      )
      .addSelect(
        "SUM(CASE WHEN reading.questionType = 'custom' THEN 1 ELSE 0 END)",
        'customCount',
      )
      .where('reading.deletedAt IS NULL')
      .getRawOne<{ predefinedCount: string; customCount: string }>();

    const predefinedCount = parseInt(result?.predefinedCount || '0', 10);
    const customCount = parseInt(result?.customCount || '0', 10);
    const total = predefinedCount + customCount;

    const predefinedPercentage =
      total > 0 ? (predefinedCount / total) * 100 : 0;
    const customPercentage = total > 0 ? (customCount / total) * 100 : 0;

    return {
      predefinedCount,
      customCount,
      predefinedPercentage: parseFloat(predefinedPercentage.toFixed(2)),
      customPercentage: parseFloat(customPercentage.toFixed(2)),
    };
  }
}
