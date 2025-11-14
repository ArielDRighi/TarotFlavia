/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminDashboardService } from './admin-dashboard.service';
import { User } from '../users/entities/user.entity';
import { TarotReading } from '../tarot/readings/entities/tarot-reading.entity';
import { AIUsageLog } from '../ai-usage/entities/ai-usage-log.entity';
import { TarotCard } from '../tarot/cards/entities/tarot-card.entity';
import { PredefinedQuestion } from '../predefined-questions/entities/predefined-question.entity';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;

  const mockQueryBuilder: any = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getMany: jest.fn(),
    getCount: jest.fn(),
  };

  const mockUserRepository = {
    count: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockReadingRepository = {
    count: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockAIUsageRepository = {
    count: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockCardRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockPredefinedQuestionRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(TarotReading),
          useValue: mockReadingRepository,
        },
        {
          provide: getRepositoryToken(AIUsageLog),
          useValue: mockAIUsageRepository,
        },
        {
          provide: getRepositoryToken(TarotCard),
          useValue: mockCardRepository,
        },
        {
          provide: getRepositoryToken(PredefinedQuestion),
          useValue: mockPredefinedQuestionRepository,
        },
      ],
    }).compile();

    service = module.get<AdminDashboardService>(AdminDashboardService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return comprehensive dashboard statistics', async () => {
      // Mock user data
      mockUserRepository.count.mockResolvedValueOnce(1000); // totalUsers
      mockQueryBuilder.getRawOne
        .mockResolvedValueOnce({ count: '200' }) // activeUsers 7 days
        .mockResolvedValueOnce({ count: '350' }); // activeUsers 30 days

      // Mock reading data
      mockReadingRepository.count
        .mockResolvedValueOnce(5000) // totalReadings
        .mockResolvedValueOnce(400) // readingsLast7Days
        .mockResolvedValueOnce(1200); // readingsLast30Days

      mockQueryBuilder.getRawOne
        .mockResolvedValueOnce({ avgReadings: '5.5' }) // avg readings per user
        .mockResolvedValueOnce({ count: '1000' }); // predefined questions count

      // Mock plan distribution
      mockUserRepository.count
        .mockResolvedValueOnce(750) // free users
        .mockResolvedValueOnce(250); // premium users

      // Mock category distribution
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { categoryId: 1, categoryName: 'Amor', count: '2000' },
        { categoryId: 2, categoryName: 'Trabajo', count: '1500' },
      ]);

      // Mock spread distribution
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { spreadName: 'Tres Cartas', count: '3000' },
        { spreadName: 'Cruz Celta', count: '2000' },
      ]);

      // Mock card stats
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { cardId: 1, cardName: 'El Loco', count: '500' },
          { cardId: 2, cardName: 'La Muerte', count: '450' },
        ])
        .mockResolvedValueOnce([
          { category: 'arcanos_mayores', count: '3000' },
          { category: 'copas', count: '1000' },
        ]);

      mockQueryBuilder.getRawOne.mockResolvedValueOnce({
        upright: '2500',
        reversed: '2500',
      }); // card orientation

      // Mock AI metrics
      mockAIUsageRepository.count.mockResolvedValueOnce(5000);
      mockQueryBuilder.getRawOne
        .mockResolvedValueOnce({ totalTokens: '10000000', avgTokens: '2000' })
        .mockResolvedValueOnce({ totalCost: '50.00' })
        .mockResolvedValueOnce({ avgDuration: '1500' });

      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { provider: 'groq', count: '3000' },
        { provider: 'openai', count: '2000' },
      ]);

      mockAIUsageRepository.count
        .mockResolvedValueOnce(100) // errors
        .mockResolvedValueOnce(500); // cached

      // Mock predefined questions
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        {
          questionId: 1,
          questionText: '¿Cómo mejorar mi relación?',
          count: '500',
        },
        {
          questionId: 2,
          questionText: '¿Cuál es mi futuro laboral?',
          count: '400',
        },
      ]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = (await service.getStats()) as any;

      expect(result).toBeDefined();
      expect(result.users).toBeDefined();
      expect(result.users.totalUsers).toBe(1000);
      expect(result.users.activeUsersLast30Days).toBe(350);
      expect(result.users.planDistribution.freeUsers).toBe(750);
      expect(result.users.planDistribution.premiumUsers).toBe(250);
      expect(result.users.planDistribution.conversionRate).toBeCloseTo(25, 1);

      expect(result.readings).toBeDefined();
      expect(result.readings.totalReadings).toBe(5000);
      expect(result.readings.readingsLast7Days).toBe(400);
      expect(result.readings.readingsLast30Days).toBe(1200);
      expect(result.readings.averageReadingsPerUser).toBeCloseTo(5.5, 1);

      expect(result.cards).toBeDefined();
      expect(result.cards.topCards).toHaveLength(2);
      expect(result.cards.topCards[0].name).toBe('El Loco');

      expect(result.openai).toBeDefined();
      expect(result.openai.totalInterpretations).toBe(5000);
      expect(result.openai.totalTokens).toBe(10000000);

      expect(result.questions).toBeDefined();
      expect(result.questions.topPredefinedQuestions).toHaveLength(2);
    });
  });

  describe('getCharts', () => {
    it('should return chart data for last 30 days', async () => {
      const mockUserRegistrations = [
        { date: '2024-01-01', count: '10' },
        { date: '2024-01-02', count: '15' },
      ];

      const mockReadingsPerDay = [
        { date: '2024-01-01', count: '50' },
        { date: '2024-01-02', count: '60' },
      ];

      const mockAICostsPerDay = [
        { date: '2024-01-01', totalCost: '1.50' },
        { date: '2024-01-02', totalCost: '2.00' },
      ];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockUserRegistrations)
        .mockResolvedValueOnce(mockReadingsPerDay)
        .mockResolvedValueOnce(mockAICostsPerDay);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = (await service.getCharts()) as any;

      expect(result).toBeDefined();
      expect(result.userRegistrations).toHaveLength(2);
      expect(result.userRegistrations[0].date).toBe('2024-01-01');
      expect(result.userRegistrations[0].count).toBe(10);

      expect(result.readingsPerDay).toHaveLength(2);
      expect(result.readingsPerDay[0].count).toBe(50);

      expect(result.aiCostsPerDay).toHaveLength(2);
      expect(result.aiCostsPerDay[0].cost).toBeCloseTo(1.5, 2);
    });
  });

  describe('getUserStats', () => {
    it('should return detailed user statistics', async () => {
      mockUserRepository.count
        .mockResolvedValueOnce(1000) // total
        .mockResolvedValueOnce(750) // free
        .mockResolvedValueOnce(250); // premium

      mockQueryBuilder.getRawOne
        .mockResolvedValueOnce({ count: '200' }) // active 7 days
        .mockResolvedValueOnce({ count: '350' }); // active 30 days

      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { date: '2024-01-01', count: '10' },
        { date: '2024-01-02', count: '15' },
      ]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = (await service.getUserStats()) as any;

      expect(result.totalUsers).toBe(1000);
      expect(result.activeUsersLast7Days).toBe(200);
      expect(result.activeUsersLast30Days).toBe(350);
      expect(result.planDistribution.freeUsers).toBe(750);
      expect(result.planDistribution.premiumUsers).toBe(250);
      expect(result.planDistribution.conversionRate).toBeCloseTo(25, 1);
      expect(result.newRegistrationsPerDay).toHaveLength(2);
    });
  });

  describe('getReadingStats', () => {
    it('should return detailed reading statistics', async () => {
      mockReadingRepository.count
        .mockResolvedValueOnce(5000) // total
        .mockResolvedValueOnce(400) // last 7 days
        .mockResolvedValueOnce(1200); // last 30 days

      // Mock for getAverageReadingsPerUser
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({
        totalReadings: '5500',
        totalUsers: '1000',
      });

      // Mock for getCategoryDistribution
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { categoryId: 1, categoryName: 'Amor', count: '2000' },
      ]);

      // Mock for getSpreadDistribution
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { cardCount: 3, count: '3000' },
      ]);

      // Mock for getReadingsPerDay
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { date: '2024-01-01', count: '50' },
      ]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = (await service.getReadingStats()) as any;

      expect(result.totalReadings).toBe(5000);
      expect(result.readingsLast7Days).toBe(400);
      expect(result.readingsLast30Days).toBe(1200);
      expect(result.averageReadingsPerUser).toBeCloseTo(5.5, 1);
      expect(result.categoryDistribution).toHaveLength(1);
      expect(result.spreadDistribution).toHaveLength(1);
    });
  });

  describe('getCardStats', () => {
    it('should return detailed card statistics', async () => {
      jest.clearAllMocks();

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { cardId: 1, name: 'El Loco', count: '500' },
          { cardId: 2, name: 'La Muerte', count: '450' },
        ])
        .mockResolvedValueOnce([
          { category: 'arcanos_mayores', count: '3000' },
          { category: 'copas', count: '1000' },
        ]);

      mockQueryBuilder.getRawOne.mockResolvedValueOnce({
        upright: '2500',
        reversed: '2500',
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = (await service.getCardStats()) as any;

      expect(result.topCards).toHaveLength(2);
      expect(result.topCards[0].name).toBe('El Loco');
      expect(result.topCards[0].count).toBe(500);
      expect(result.categoryDistribution).toHaveLength(2);
      expect(result.orientationRatio.upright).toBe(2500);
      expect(result.orientationRatio.reversed).toBe(2500);
      expect(result.orientationRatio.uprightPercentage).toBeCloseTo(50, 1);
    });
  });

  describe('getOpenAIStats', () => {
    it('should return detailed OpenAI statistics', async () => {
      jest.clearAllMocks();

      mockAIUsageRepository.count
        .mockResolvedValueOnce(5000) // total
        .mockResolvedValueOnce(100) // errors
        .mockResolvedValueOnce(500); // cached

      mockQueryBuilder.getRawOne
        .mockResolvedValueOnce({ totalTokens: '10000000', avgTokens: '2000' })
        .mockResolvedValueOnce({ totalCost: '50.00' })
        .mockResolvedValueOnce({ avgDuration: '1500' });

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { provider: 'groq', count: '3000' },
          { provider: 'openai', count: '2000' },
        ])
        .mockResolvedValueOnce([{ date: '2024-01-01', totalCost: '1.50' }]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = (await service.getOpenAIStats()) as any;

      expect(result.totalInterpretations).toBe(5000);
      expect(result.totalTokens).toBe(10000000);
      expect(result.averageTokens).toBe(2000);
      expect(result.totalCostUsd).toBeCloseTo(50, 2);
      expect(result.averageDurationMs).toBe(1500);
      expect(result.errorRate).toBeCloseTo(2, 1);
      expect(result.cacheHitRate).toBeCloseTo(10, 1);
      expect(result.usageByProvider).toHaveLength(2);
    });
  });

  describe('getQuestionStats', () => {
    it('should return detailed question statistics', async () => {
      jest.clearAllMocks();

      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        {
          questionId: 1,
          question: '¿Cómo mejorar mi relación?',
          count: '500',
        },
        {
          questionId: 2,
          question: '¿Cuál es mi futuro laboral?',
          count: '400',
        },
      ]);

      mockQueryBuilder.getRawOne.mockResolvedValueOnce({
        predefinedCount: '1000',
        customCount: '500',
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = (await service.getQuestionStats()) as any;

      expect(result.topPredefinedQuestions).toHaveLength(2);
      expect(result.topPredefinedQuestions[0].question).toBe(
        '¿Cómo mejorar mi relación?',
      );
      expect(result.topPredefinedQuestions[0].count).toBe(500);
      expect(result.predefinedVsCustom.predefinedCount).toBe(1000);
      expect(result.predefinedVsCustom.customCount).toBe(500);
      expect(result.predefinedVsCustom.predefinedPercentage).toBeCloseTo(
        66.67,
        1,
      );
    });
  });
});
