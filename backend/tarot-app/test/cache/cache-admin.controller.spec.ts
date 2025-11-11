import { Test, TestingModule } from '@nestjs/testing';
import { CacheAdminController } from '../../src/modules/cache/infrastructure/controllers/cache-admin.controller';
import { InterpretationCacheService } from '../../src/modules/cache/application/services/interpretation-cache.service';

describe('CacheAdminController', () => {
  let controller: CacheAdminController;
  let cacheService: InterpretationCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CacheAdminController],
      providers: [
        {
          provide: InterpretationCacheService,
          useValue: {
            invalidateTarotistaCache: jest.fn(),
            invalidateTarotistaMeaningsCache: jest.fn(),
            clearAllCaches: jest.fn(),
            getCacheStats: jest.fn(),
            getInvalidationMetrics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CacheAdminController>(CacheAdminController);
    cacheService = module.get<InterpretationCacheService>(
      InterpretationCacheService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('invalidateTarotistaCache', () => {
    it('should invalidate cache for a specific tarotista', async () => {
      jest
        .spyOn(cacheService, 'invalidateTarotistaCache')
        .mockResolvedValue(10);

      const result = await controller.invalidateTarotistaCache(1);

      expect(result).toEqual({
        deletedCount: 10,
        message: 'Cache invalidated for tarotista 1',
        timestamp: expect.any(Date) as Date,
        reason: 'manual-invalidation',
      });
      expect(cacheService.invalidateTarotistaCache).toHaveBeenCalledWith(1);
    });
  });

  describe('invalidateMeaningsCache', () => {
    it('should invalidate cache for specific card meanings', async () => {
      jest
        .spyOn(cacheService, 'invalidateTarotistaMeaningsCache')
        .mockResolvedValue(5);

      const result = await controller.invalidateMeaningsCache(1, '5,10,15');

      expect(result).toEqual({
        deletedCount: 5,
        message: 'Cache invalidated for tarotista 1, cards: 5,10,15',
        timestamp: expect.any(Date) as Date,
      });
      expect(
        cacheService.invalidateTarotistaMeaningsCache,
      ).toHaveBeenCalledWith(1, [5, 10, 15]);
    });

    it('should throw error if cardIds is not provided', async () => {
      await expect(
        controller.invalidateMeaningsCache(1, undefined as never),
      ).rejects.toThrow();
    });

    it('should throw error if cardIds format is invalid', async () => {
      await expect(
        controller.invalidateMeaningsCache(1, 'invalid,ids'),
      ).rejects.toThrow();
    });
  });

  describe('clearGlobalCache', () => {
    it('should clear all cache entries', async () => {
      jest.spyOn(cacheService, 'clearAllCaches').mockResolvedValue(undefined);

      const result = await controller.clearGlobalCache();

      expect(result).toEqual({
        message: 'All cache cleared successfully',
        timestamp: expect.any(Date) as Date,
      });
      expect(cacheService.clearAllCaches).toHaveBeenCalled();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      const mockStats = {
        total: 100,
        expired: 10,
        avgHits: 5.5,
      };

      const mockMetrics = {
        total: 15,
        byTarotista: 10,
        byMeanings: 5,
      };

      jest.spyOn(cacheService, 'getCacheStats').mockResolvedValue(mockStats);
      jest
        .spyOn(cacheService, 'getInvalidationMetrics')
        .mockResolvedValue(mockMetrics);

      const result = await controller.getCacheStats();

      expect(result).toEqual({
        ...mockStats,
        invalidations: mockMetrics,
      });
    });
  });
});
