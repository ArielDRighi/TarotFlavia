import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, IsNull } from 'typeorm';
import { User, UserPlan } from '../users/entities/user.entity';
import { TarotReading } from '../tarot/readings/entities/tarot-reading.entity';
import { AIUsageLog } from '../ai-usage/entities/ai-usage-log.entity';
import {
  DashboardMetricsDto,
  PlanDistributionDto,
  AIMetricsDto,
} from './dto/dashboard-metrics.dto';
import { RecentReadingDto } from './dto/recent-reading.dto';
import { RecentUserDto } from './dto/recent-user.dto';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TarotReading)
    private readonly readingRepository: Repository<TarotReading>,
    @InjectRepository(AIUsageLog)
    private readonly aiUsageRepository: Repository<AIUsageLog>,
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
}
