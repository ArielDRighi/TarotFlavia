import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetricsService } from './metrics.service';
import { TarotistaRevenueMetrics } from '../entities/tarotista-revenue-metrics.entity';
import { Tarotista } from '../entities/tarotista.entity';
import { TarotReading } from '../../tarot/readings/entities/tarot-reading.entity';
import { User } from '../../users/entities/user.entity';
import {
  MetricsQueryDto,
  PlatformMetricsQueryDto,
  MetricsPeriod,
} from '../dto/metrics-query.dto';
import { NotFoundException } from '@nestjs/common';

describe('MetricsService', () => {
  let service: MetricsService;
  let _revenueMetricsRepository: Repository<TarotistaRevenueMetrics>;
  let tarotistaRepository: Repository<Tarotista>;
  let _readingsRepository: Repository<TarotReading>;
  let _userRepository: Repository<User>;

  const mockTarotista: Partial<Tarotista> = {
    id: 1,
    nombrePublico: 'Flavia',
    ratingPromedio: 4.8,
    totalReviews: 50,
    totalLecturas: 150,
  };

  // Shared QueryBuilder mock
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    distinct: jest.fn().mockReturnThis(),
    distinctOn: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: getRepositoryToken(TarotistaRevenueMetrics),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Tarotista),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(TarotReading),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    _revenueMetricsRepository = module.get<Repository<TarotistaRevenueMetrics>>(
      getRepositoryToken(TarotistaRevenueMetrics),
    );
    tarotistaRepository = module.get<Repository<Tarotista>>(
      getRepositoryToken(Tarotista),
    );
    _readingsRepository = module.get<Repository<TarotReading>>(
      getRepositoryToken(TarotReading),
    );

    // Reset all mocks before each test
    jest.clearAllMocks();
    mockQueryBuilder.getRawOne.mockReset();
    mockQueryBuilder.getRawMany.mockReset();
    mockQueryBuilder.getCount.mockReset();
  });

  describe('getTarotistaMetrics', () => {
    it('should return metrics for a tarotista with MONTH period', async () => {
      const query: MetricsQueryDto = {
        tarotistaId: 1,
        period: MetricsPeriod.MONTH,
      };

      const mockMetricsData = {
        totalReadings: '25',
        totalRevenueShare: '350.00',
        totalPlatformFee: '150.00',
        totalGrossRevenue: '500.00',
      };

      // Configure mocks
      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      mockQueryBuilder.getRawOne.mockResolvedValueOnce(mockMetricsData);

      const result = await service.getTarotistaMetrics(query);

      expect(result.tarotistaId).toBe(1);
      expect(result.nombrePublico).toBe('Flavia');
      expect(result.totalReadings).toBe(25);
      expect(result.totalRevenueShare).toBe(350.0);
      expect(result.totalPlatformFee).toBe(150.0);
      expect(result.totalGrossRevenue).toBe(500.0);
      expect(result.averageRating).toBe(4.8);
      expect(result.totalReviews).toBe(50);
      expect(result.period).toBeDefined();
    });

    it('should throw NotFoundException if tarotista does not exist', async () => {
      const query: MetricsQueryDto = {
        tarotistaId: 999,
        period: MetricsPeriod.MONTH,
      };

      jest.spyOn(tarotistaRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getTarotistaMetrics(query)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getTarotistaMetrics(query)).rejects.toThrow(
        'Tarotista with ID 999 not found',
      );
    });

    it('should return metrics for CUSTOM period', async () => {
      const query: MetricsQueryDto = {
        tarotistaId: 1,
        period: MetricsPeriod.CUSTOM,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
      };

      const mockMetricsData = {
        totalReadings: '50',
        totalRevenueShare: '700.00',
        totalPlatformFee: '300.00',
        totalGrossRevenue: '1000.00',
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      mockQueryBuilder.getRawOne.mockResolvedValueOnce(mockMetricsData);

      const result = await service.getTarotistaMetrics(query);

      expect(result.totalReadings).toBe(50);
      expect(result.totalRevenueShare).toBe(700.0);
    });

    it('should return zero metrics when no data exists for period', async () => {
      const query: MetricsQueryDto = {
        tarotistaId: 1,
        period: MetricsPeriod.WEEK,
      };

      const mockMetricsData = {
        totalReadings: '0',
        totalRevenueShare: null,
        totalPlatformFee: null,
        totalGrossRevenue: null,
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      mockQueryBuilder.getRawOne.mockResolvedValueOnce(mockMetricsData);

      const result = await service.getTarotistaMetrics(query);

      expect(result.totalReadings).toBe(0);
      expect(result.totalRevenueShare).toBe(0);
      expect(result.totalPlatformFee).toBe(0);
      expect(result.totalGrossRevenue).toBe(0);
    });

    it('should handle WEEK period correctly', async () => {
      const query: MetricsQueryDto = {
        tarotistaId: 1,
        period: MetricsPeriod.WEEK,
      };

      const mockMetricsData = {
        totalReadings: '5',
        totalRevenueShare: '70.00',
        totalPlatformFee: '30.00',
        totalGrossRevenue: '100.00',
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      mockQueryBuilder.getRawOne.mockResolvedValueOnce(mockMetricsData);

      const result = await service.getTarotistaMetrics(query);

      expect(result.totalReadings).toBe(5);
      expect(result.totalRevenueShare).toBe(70.0);
    });

    it('should handle DAY period correctly', async () => {
      const query: MetricsQueryDto = {
        tarotistaId: 1,
        period: MetricsPeriod.DAY,
      };

      const mockMetricsData = {
        totalReadings: '2',
        totalRevenueShare: '35.00',
        totalPlatformFee: '15.00',
        totalGrossRevenue: '50.00',
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      mockQueryBuilder.getRawOne.mockResolvedValueOnce(mockMetricsData);

      const result = await service.getTarotistaMetrics(query);

      expect(result.totalReadings).toBe(2);
      expect(result.totalRevenueShare).toBe(35.0);
    });

    it('should handle YEAR period correctly', async () => {
      const query: MetricsQueryDto = {
        tarotistaId: 1,
        period: MetricsPeriod.YEAR,
      };

      const mockMetricsData = {
        totalReadings: '600',
        totalRevenueShare: '8400.00',
        totalPlatformFee: '3600.00',
        totalGrossRevenue: '12000.00',
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      mockQueryBuilder.getRawOne.mockResolvedValueOnce(mockMetricsData);

      const result = await service.getTarotistaMetrics(query);

      expect(result.totalReadings).toBe(600);
      expect(result.totalRevenueShare).toBe(8400.0);
    });
  });

  describe('getPlatformMetrics', () => {
    it('should return aggregated platform metrics for MONTH period', async () => {
      const query: PlatformMetricsQueryDto = {
        period: MetricsPeriod.MONTH,
      };

      const mockAggregatedData = {
        totalReadings: '250',
        totalRevenueShare: '3500.00',
        totalPlatformFee: '1500.00',
        totalGrossRevenue: '5000.00',
      };

      const mockActiveTarotistas = [
        { tarotistaId: '1' },
        { tarotistaId: '2' },
        { tarotistaId: '3' },
      ];

      const mockActiveUsers = 150;

      const mockTopRevenue = [{ tarotistaId: 1, totalRevenue: '1400.00' }];

      const mockTarotistaMetrics = {
        totalReadings: '100',
        totalRevenueShare: '1400.00',
        totalPlatformFee: '600.00',
        totalGrossRevenue: '2000.00',
      };

      // Configure mock sequence
      mockQueryBuilder.getRawOne
        .mockResolvedValueOnce(mockAggregatedData) // totalMetrics
        .mockResolvedValueOnce(mockTarotistaMetrics); // metrics for tarotista in loop
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockActiveTarotistas) // activeTarotistasResult
        .mockResolvedValueOnce(mockTopRevenue); // revenueByTarotista in getTopTarotistas
      mockQueryBuilder.getCount.mockResolvedValueOnce(mockActiveUsers); // activeUsers

      jest.spyOn(tarotistaRepository, 'find').mockResolvedValue([
        {
          id: 1,
          nombrePublico: 'Tarotista 1',
          ratingPromedio: 4.8,
          totalReviews: 50,
          totalLecturas: 100,
        } as Tarotista,
      ]);

      const result = await service.getPlatformMetrics(query);

      expect(result.totalReadings).toBe(250);
      expect(result.totalRevenueShare).toBe(3500.0);
      expect(result.totalPlatformFee).toBe(1500.0);
      expect(result.totalGrossRevenue).toBe(5000.0);
      expect(result.activeUsers).toBe(150);
      expect(result.activeTarotistas).toBe(3);
      expect(result.topTarotistas).toHaveLength(1);
      expect(result.topTarotistas[0].tarotistaId).toBe(1);
      expect(result.topTarotistas[0].nombrePublico).toBe('Tarotista 1');
    });

    it('should return zero metrics when no data exists', async () => {
      const query: PlatformMetricsQueryDto = {
        period: MetricsPeriod.DAY,
      };

      const mockAggregatedData = {
        totalReadings: '0',
        totalRevenueShare: null,
        totalPlatformFee: null,
        totalGrossRevenue: null,
      };

      const mockActiveTarotistas = [];
      const mockActiveUsers = 0;
      const mockTopRevenue = [];

      // Configure mock sequence
      mockQueryBuilder.getRawOne.mockResolvedValueOnce(mockAggregatedData); // totalMetrics
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockActiveTarotistas) // activeTarotistasResult
        .mockResolvedValueOnce(mockTopRevenue); // revenueByTarotista in getTopTarotistas
      mockQueryBuilder.getCount.mockResolvedValueOnce(mockActiveUsers); // activeUsers

      const result = await service.getPlatformMetrics(query);

      expect(result.totalReadings).toBe(0);
      expect(result.totalRevenueShare).toBe(0);
      expect(result.totalPlatformFee).toBe(0);
      expect(result.totalGrossRevenue).toBe(0);
      expect(result.activeUsers).toBe(0);
      expect(result.activeTarotistas).toBe(0);
      expect(result.topTarotistas).toEqual([]);
    });
  });
});
