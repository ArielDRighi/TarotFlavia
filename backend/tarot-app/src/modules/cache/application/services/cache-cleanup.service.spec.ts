import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CacheCleanupService } from './cache-cleanup.service';
import { InterpretationCacheService } from './interpretation-cache.service';

describe('CacheCleanupService', () => {
  let service: CacheCleanupService;
  let cacheService: jest.Mocked<InterpretationCacheService>;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const mockCacheService = {
      cleanExpiredCache: jest.fn(),
      cleanUnusedCache: jest.fn(),
      getCacheStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheCleanupService,
        {
          provide: InterpretationCacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<CacheCleanupService>(CacheCleanupService);
    cacheService = module.get(InterpretationCacheService);

    // Spy on logger methods
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cleanExpiredCache', () => {
    it('should clean expired cache successfully', async () => {
      const deletedCount = 42;
      cacheService.cleanExpiredCache.mockResolvedValue(deletedCount);

      await service.cleanExpiredCache();

      expect(cacheService.cleanExpiredCache).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Starting expired cache cleanup...',
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `Expired cache cleanup completed. Deleted ${deletedCount} entries.`,
      );
    });

    it('should handle errors during expired cache cleanup', async () => {
      const error = new Error('Database connection failed');
      cacheService.cleanExpiredCache.mockRejectedValue(error);

      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await service.cleanExpiredCache();

      expect(cacheService.cleanExpiredCache).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        'Error during expired cache cleanup:',
        error,
      );
    });

    it('should handle zero deleted entries', async () => {
      cacheService.cleanExpiredCache.mockResolvedValue(0);

      await service.cleanExpiredCache();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Expired cache cleanup completed. Deleted 0 entries.',
      );
    });
  });

  describe('cleanUnusedCache', () => {
    it('should clean unused cache successfully', async () => {
      const deletedCount = 15;
      cacheService.cleanUnusedCache.mockResolvedValue(deletedCount);

      await service.cleanUnusedCache();

      expect(cacheService.cleanUnusedCache).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Starting unused cache cleanup...',
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `Unused cache cleanup completed. Deleted ${deletedCount} entries.`,
      );
    });

    it('should handle errors during unused cache cleanup', async () => {
      const error = new Error('Timeout error');
      cacheService.cleanUnusedCache.mockRejectedValue(error);

      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await service.cleanUnusedCache();

      expect(cacheService.cleanUnusedCache).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        'Error during unused cache cleanup:',
        error,
      );
    });

    it('should handle large numbers of deleted entries', async () => {
      const deletedCount = 999999;
      cacheService.cleanUnusedCache.mockResolvedValue(deletedCount);

      await service.cleanUnusedCache();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Unused cache cleanup completed. Deleted 999999 entries.',
      );
    });
  });

  describe('logCacheStats', () => {
    it('should log cache statistics successfully', async () => {
      const mockStats = {
        total: 100,
        expired: 5,
        avgHits: 12.5678,
      };
      cacheService.getCacheStats.mockResolvedValue(mockStats);

      await service.logCacheStats();

      expect(cacheService.getCacheStats).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Cache stats - Total: 100, Expired: 5, Avg Hits: 12.57',
      );
    });

    it('should handle zero values in stats', async () => {
      const mockStats = {
        total: 0,
        expired: 0,
        avgHits: 0,
      };
      cacheService.getCacheStats.mockResolvedValue(mockStats);

      await service.logCacheStats();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Cache stats - Total: 0, Expired: 0, Avg Hits: 0.00',
      );
    });

    it('should handle high avgHits values with proper formatting', async () => {
      const mockStats = {
        total: 500,
        expired: 10,
        avgHits: 999.999,
      };
      cacheService.getCacheStats.mockResolvedValue(mockStats);

      await service.logCacheStats();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Cache stats - Total: 500, Expired: 10, Avg Hits: 1000.00',
      );
    });

    it('should handle errors when getting cache stats', async () => {
      const error = new Error('Stats retrieval failed');
      cacheService.getCacheStats.mockRejectedValue(error);

      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await service.logCacheStats();

      expect(cacheService.getCacheStats).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        'Error logging cache stats:',
        error,
      );
    });

    it('should handle decimal avgHits correctly', async () => {
      const mockStats = {
        total: 50,
        expired: 2,
        avgHits: 7.3,
      };
      cacheService.getCacheStats.mockResolvedValue(mockStats);

      await service.logCacheStats();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Cache stats - Total: 50, Expired: 2, Avg Hits: 7.30',
      );
    });
  });
});
