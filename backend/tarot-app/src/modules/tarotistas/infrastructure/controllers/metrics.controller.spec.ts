import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { TarotistasOrchestratorService } from '../../application/services/tarotistas-orchestrator.service';
import {
  MetricsQueryDto,
  TarotistaMetricsDto,
  PlatformMetricsDto,
  PlatformMetricsQueryDto,
  MetricsPeriod,
} from '../../application/dto/metrics-query.dto';
import { NotFoundException } from '@nestjs/common';

describe('MetricsController', () => {
  let controller: MetricsController;
  let orchestrator: TarotistasOrchestratorService;

  const mockTarotistaMetrics: TarotistaMetricsDto = {
    tarotistaId: 1,
    nombrePublico: 'Flavia',
    totalReadings: 150,
    totalRevenueShare: 5250.0,
    totalPlatformFee: 2250.0,
    totalGrossRevenue: 7500.0,
    averageRating: 4.8,
    totalReviews: 50,
    period: {
      start: new Date('2025-01-01'),
      end: new Date('2025-01-31'),
    },
  };

  const mockPlatformMetrics: PlatformMetricsDto = {
    totalReadings: 1500,
    totalRevenueShare: 52500.0,
    totalPlatformFee: 22500.0,
    totalGrossRevenue: 75000.0,
    activeTarotistas: 10,
    activeUsers: 500,
    period: {
      start: new Date('2025-01-01'),
      end: new Date('2025-01-31'),
    },
    topTarotistas: [mockTarotistaMetrics],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: TarotistasOrchestratorService,
          useValue: {
            getTarotistaMetrics: jest.fn(),
            getPlatformMetrics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    orchestrator = module.get<TarotistasOrchestratorService>(
      TarotistasOrchestratorService,
    );
  });

  describe('getTarotistaMetrics', () => {
    it('should return metrics for a specific tarotista', async () => {
      const query: MetricsQueryDto = {
        tarotistaId: 1,
        period: MetricsPeriod.MONTH,
      };

      jest
        .spyOn(orchestrator, 'getTarotistaMetrics')
        .mockResolvedValue(mockTarotistaMetrics);

      const result = await controller.getTarotistaMetrics(query);

      expect(result).toEqual(mockTarotistaMetrics);
      expect(orchestrator.getTarotistaMetrics).toHaveBeenCalledWith(query);
    });

    it('should throw NotFoundException if tarotista does not exist', async () => {
      const query: MetricsQueryDto = {
        tarotistaId: 999,
        period: MetricsPeriod.MONTH,
      };

      jest
        .spyOn(orchestrator, 'getTarotistaMetrics')
        .mockRejectedValue(
          new NotFoundException('Tarotista with ID 999 not found'),
        );

      await expect(controller.getTarotistaMetrics(query)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle CUSTOM period correctly', async () => {
      const query: MetricsQueryDto = {
        tarotistaId: 1,
        period: MetricsPeriod.CUSTOM,
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
      };

      jest
        .spyOn(orchestrator, 'getTarotistaMetrics')
        .mockResolvedValue(mockTarotistaMetrics);

      const result = await controller.getTarotistaMetrics(query);

      expect(result).toEqual(mockTarotistaMetrics);
    });
  });

  describe('getPlatformMetrics', () => {
    it('should return platform-wide metrics', async () => {
      const query: PlatformMetricsQueryDto = {
        period: MetricsPeriod.MONTH,
      };

      jest
        .spyOn(orchestrator, 'getPlatformMetrics')
        .mockResolvedValue(mockPlatformMetrics);

      const result = await controller.getPlatformMetrics(query);

      expect(result).toEqual(mockPlatformMetrics);
      expect(orchestrator.getPlatformMetrics).toHaveBeenCalledWith(query);
    });

    it('should handle different periods', async () => {
      const query: PlatformMetricsQueryDto = {
        period: MetricsPeriod.YEAR,
      };

      jest
        .spyOn(orchestrator, 'getPlatformMetrics')
        .mockResolvedValue(mockPlatformMetrics);

      const result = await controller.getPlatformMetrics(query);

      expect(result).toEqual(mockPlatformMetrics);
    });
  });
});
