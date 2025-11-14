import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { StatsResponseDto, ChartsResponseDto } from './dto/stats-response.dto';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';

describe('AdminDashboardController', () => {
  let controller: AdminDashboardController;
  let service: AdminDashboardService;

  const mockStatsResponse: StatsResponseDto = {
    users: {
      totalUsers: 1000,
      activeUsersLast7Days: 200,
      activeUsersLast30Days: 350,
      newRegistrationsPerDay: [],
      planDistribution: {
        freeUsers: 750,
        premiumUsers: 250,
        freePercentage: 75.0,
        premiumPercentage: 25.0,
        conversionRate: 25.0,
      },
    },
    readings: {
      totalReadings: 5000,
      readingsLast7Days: 400,
      readingsLast30Days: 1200,
      averageReadingsPerUser: 5.5,
      categoryDistribution: [],
      spreadDistribution: [],
      readingsPerDay: [],
    },
    cards: {
      topCards: [],
      categoryDistribution: [],
      orientationRatio: {
        upright: 2500,
        reversed: 2500,
        uprightPercentage: 50.0,
        reversedPercentage: 50.0,
      },
    },
    openai: {
      totalInterpretations: 5000,
      totalTokens: 10000000,
      averageTokens: 2000,
      totalCostUsd: 50.0,
      averageDurationMs: 1500,
      errorRate: 2.0,
      cacheHitRate: 10.0,
      usageByProvider: [],
      costsPerDay: [],
    },
    questions: {
      topPredefinedQuestions: [],
      predefinedVsCustom: {
        predefinedCount: 1000,
        customCount: 500,
        predefinedPercentage: 66.67,
        customPercentage: 33.33,
      },
    },
  };

  const mockChartsResponse: ChartsResponseDto = {
    userRegistrations: [{ date: '2024-01-01', count: 10 }],
    readingsPerDay: [{ date: '2024-01-01', count: 50 }],
    aiCostsPerDay: [{ date: '2024-01-01', cost: 1.5 }],
  };

  const mockMetricsResponse: DashboardMetricsDto = {
    userMetrics: {
      totalUsers: 1000,
      activeUsersLast7Days: 200,
      activeUsersLast30Days: 350,
    },
    readingMetrics: {
      totalReadings: 5000,
      readingsLast7Days: 400,
      readingsLast30Days: 1200,
    },
    planDistribution: {
      freeUsers: 750,
      premiumUsers: 250,
      freePercentage: 75.0,
      premiumPercentage: 25.0,
      conversionRate: 25.0,
    },
    recentReadings: [],
    recentUsers: [],
    aiMetrics: {
      totalInterpretations: 5000,
      usageByProvider: [],
    },
  };

  const mockAdminDashboardService = {
    getStats: jest
      .fn<Promise<StatsResponseDto>, []>()
      .mockResolvedValue(mockStatsResponse),
    getCharts: jest
      .fn<Promise<ChartsResponseDto>, []>()
      .mockResolvedValue(mockChartsResponse),
    getMetrics: jest
      .fn<Promise<DashboardMetricsDto>, []>()
      .mockResolvedValue(mockMetricsResponse),
  } as unknown as AdminDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDashboardController],
      providers: [
        {
          provide: AdminDashboardService,
          useValue: mockAdminDashboardService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<AdminDashboardController>(AdminDashboardController);
    service = module.get<AdminDashboardService>(AdminDashboardService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    it('should return comprehensive dashboard statistics', async () => {
      await expect(controller.getStats()).resolves.toEqual(mockStatsResponse);
      expect(service.getStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCharts', () => {
    it('should return chart data for last 30 days', async () => {
      await expect(controller.getCharts()).resolves.toEqual(mockChartsResponse);
      expect(service.getCharts).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMetrics (deprecated)', () => {
    it('should return basic dashboard metrics', async () => {
      const result = await controller.getMetrics();

      expect(result).toEqual(mockMetricsResponse);
      expect(service.getMetrics).toHaveBeenCalledTimes(1);
    });
  });
});
