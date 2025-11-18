import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { CacheAnalyticsService } from './cache-analytics.service';
import { CachedInterpretation } from '../../infrastructure/entities/cached-interpretation.entity';
import { CacheMetric } from '../../infrastructure/entities/cache-metrics.entity';
import { CacheLevel } from '../constants/cache-strategy.constants';

describe('CacheAnalyticsService', () => {
  let service: CacheAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheAnalyticsService,
        {
          provide: getRepositoryToken(CachedInterpretation),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({
                total_hits: '100',
                total_entries: '150',
              }),
              getCount: jest.fn().mockResolvedValue(10),
            })),
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(CacheMetric),
          useValue: {
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<CacheAnalyticsService>(CacheAnalyticsService);

    // Silenciar logs
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateHitRate', () => {
    it('should calculate hit rate percentage', async () => {
      const result = await service.calculateHitRate(24);

      expect(result).toHaveProperty('percentage');
      expect(result).toHaveProperty('totalRequests');
      expect(result).toHaveProperty('cacheHits');
      expect(result).toHaveProperty('cacheMisses');
      expect(result).toHaveProperty('windowHours');
    });
  });

  describe('calculateSavings', () => {
    it('should calculate cost savings', async () => {
      const result = await service.calculateSavings(24);

      expect(result).toHaveProperty('openaiSavings');
      expect(result).toHaveProperty('deepseekSavings');
      expect(result).toHaveProperty('groqRateLimitSaved');
      expect(result).toHaveProperty('groqRateLimitPercentage');
    });
  });

  describe('calculateResponseTimes', () => {
    it('should return response time metrics', () => {
      const result = service.calculateResponseTimes();

      expect(result.cacheAvg).toBe(50);
      expect(result.aiAvg).toBe(1500);
      expect(result.improvementFactor).toBe(30);
    });
  });

  describe('recordCacheAccess', () => {
    it('should log cache access without throwing', () => {
      expect(() => {
        service.recordCacheAccess(true, CacheLevel.EXACT, 50);
      }).not.toThrow();
    });
  });
});
