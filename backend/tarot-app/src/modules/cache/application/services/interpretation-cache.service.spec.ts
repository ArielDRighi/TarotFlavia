import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Repository, SelectQueryBuilder, DeleteResult } from 'typeorm';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InterpretationCacheService } from './interpretation-cache.service';
import { CachedInterpretation } from '../../infrastructure/entities/cached-interpretation.entity';
import { TarotistaConfig } from '../../../tarotistas/infrastructure/entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../../../tarotistas/infrastructure/entities/tarotista-card-meaning.entity';

describe('InterpretationCacheService', () => {
  let service: InterpretationCacheService;
  let repository: jest.Mocked<Repository<CachedInterpretation>>;
  let cacheManager: jest.Mocked<Cache>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<CachedInterpretation>>;

  const mockCardCombination = [
    { card_id: '1', position: 0, is_reversed: false },
    { card_id: '2', position: 1, is_reversed: true },
  ];

  beforeEach(async () => {
    queryBuilder = {
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      whereInIds: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      execute: jest.fn(),
      getMany: jest.fn(),
      getRawOne: jest.fn(),
    } as unknown as jest.Mocked<SelectQueryBuilder<CachedInterpretation>>;

    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(() => queryBuilder),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterpretationCacheService,
        {
          provide: getRepositoryToken(CachedInterpretation),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<InterpretationCacheService>(
      InterpretationCacheService,
    );
    repository = module.get(getRepositoryToken(CachedInterpretation));
    cacheManager = module.get(CACHE_MANAGER);

    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCacheKey', () => {
    it('should generate consistent cache key for same inputs', () => {
      const key1 = service.generateCacheKey(
        mockCardCombination,
        '1',
        'questionHash',
      );
      const key2 = service.generateCacheKey(
        mockCardCombination,
        '1',
        'questionHash',
      );

      expect(key1).toBe(key2);
      expect(key1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex
    });

    it('should generate different keys for different spreads', () => {
      const key1 = service.generateCacheKey(mockCardCombination, '1', 'hash');
      const key2 = service.generateCacheKey(mockCardCombination, '2', 'hash');

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different questions', () => {
      const key1 = service.generateCacheKey(mockCardCombination, '1', 'hash1');
      const key2 = service.generateCacheKey(mockCardCombination, '1', 'hash2');

      expect(key1).not.toBe(key2);
    });

    it('should handle null spread ID', () => {
      const key = service.generateCacheKey(mockCardCombination, null, 'hash');

      expect(key).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate consistent keys regardless of card order (sorted by position)', () => {
      const cards1 = [
        { card_id: '2', position: 1, is_reversed: true },
        { card_id: '1', position: 0, is_reversed: false },
      ];
      const cards2 = [
        { card_id: '1', position: 0, is_reversed: false },
        { card_id: '2', position: 1, is_reversed: true },
      ];

      const key1 = service.generateCacheKey(cards1, '1', 'hash');
      const key2 = service.generateCacheKey(cards2, '1', 'hash');

      expect(key1).toBe(key2);
    });

    it('should differentiate reversed/upright cards', () => {
      const cards1 = [{ card_id: '1', position: 0, is_reversed: false }];
      const cards2 = [{ card_id: '1', position: 0, is_reversed: true }];

      const key1 = service.generateCacheKey(cards1, '1', 'hash');
      const key2 = service.generateCacheKey(cards2, '1', 'hash');

      expect(key1).not.toBe(key2);
    });
  });

  describe('generateQuestionHash', () => {
    it('should generate consistent hash for same inputs', () => {
      const hash1 = service.generateQuestionHash('amor', 'Me ama?');
      const hash2 = service.generateQuestionHash('amor', 'Me ama?');

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should normalize category to lowercase', () => {
      const hash1 = service.generateQuestionHash('AMOR', 'pregunta');
      const hash2 = service.generateQuestionHash('amor', 'pregunta');

      expect(hash1).toBe(hash2);
    });

    it('should normalize question text', () => {
      const hash1 = service.generateQuestionHash('amor', '  Me    ama?  ');
      const hash2 = service.generateQuestionHash('amor', 'Me ama?');

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different categories', () => {
      const hash1 = service.generateQuestionHash('amor', 'pregunta');
      const hash2 = service.generateQuestionHash('trabajo', 'pregunta');

      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes for different questions', () => {
      const hash1 = service.generateQuestionHash('amor', 'pregunta1');
      const hash2 = service.generateQuestionHash('amor', 'pregunta2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('getFromCache', () => {
    const cacheKey = 'test-cache-key';

    it('should return from memory cache if available', async () => {
      const mockCacheEntry = {
        id: 1,
        cache_key: cacheKey,
      } as unknown as CachedInterpretation;
      cacheManager.get.mockResolvedValue(mockCacheEntry);

      const result = await service.getFromCache(cacheKey);

      expect(result).toEqual(mockCacheEntry);
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should fetch from DB if not in memory cache', async () => {
      const mockDbEntry = {
        id: 1,
        cache_key: cacheKey,
        hit_count: 5,
        expires_at: new Date(Date.now() + 100000),
      } as unknown as CachedInterpretation;

      cacheManager.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(mockDbEntry);

      const result = await service.getFromCache(cacheKey);

      expect(result).toEqual(mockDbEntry);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { cache_key: cacheKey },
      });
      expect(repository.update).toHaveBeenCalledWith(
        { id: mockDbEntry.id },
        expect.objectContaining({
          hit_count: 6,
        }),
      );
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should return null if not found in memory or DB', async () => {
      cacheManager.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(null);

      const result = await service.getFromCache(cacheKey);

      expect(result).toBeNull();
    });

    it('should return null if DB entry is expired', async () => {
      const expiredEntry = {
        id: 1,
        cache_key: cacheKey,
        expires_at: new Date(Date.now() - 100000),
      } as unknown as CachedInterpretation;

      cacheManager.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(expiredEntry);

      const result = await service.getFromCache(cacheKey);

      expect(result).toBeNull();
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should save DB result to memory cache', async () => {
      const mockDbEntry = {
        id: 1,
        cache_key: cacheKey,
        hit_count: 0,
        expires_at: new Date(Date.now() + 100000),
      } as unknown as CachedInterpretation;

      cacheManager.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(mockDbEntry);

      await service.getFromCache(cacheKey);

      expect(cacheManager.set).toHaveBeenCalledWith(
        cacheKey,
        mockDbEntry,
        3600000, // 1 hour TTL
      );
    });
  });

  describe('saveToCache', () => {
    it('should save to both DB and memory cache', async () => {
      const mockSavedEntry = { id: 1 } as unknown as CachedInterpretation;
      repository.create.mockReturnValue(mockSavedEntry);
      repository.save.mockResolvedValue(mockSavedEntry);

      await service.saveToCache(
        'key',
        1,
        mockCardCombination,
        'questionHash',
        'interpretation text',
        100,
      );

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cache_key: 'key',
          tarotista_id: 100,
          spread_id: 1,
          card_combination: mockCardCombination,
          question_hash: 'questionHash',
          interpretation_text: 'interpretation text',
          hit_count: 0,
        }),
      );
      expect(repository.save).toHaveBeenCalledWith(mockSavedEntry);
      expect(cacheManager.set).toHaveBeenCalledWith(
        'key',
        mockSavedEntry,
        3600000,
      );
    });

    it('should handle null spreadId', async () => {
      const mockSavedEntry = { id: 1 } as unknown as CachedInterpretation;
      repository.create.mockReturnValue(mockSavedEntry);
      repository.save.mockResolvedValue(mockSavedEntry);

      await service.saveToCache(
        'key',
        null,
        mockCardCombination,
        'hash',
        'text',
      );

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          spread_id: null,
          tarotista_id: null,
        }),
      );
    });

    it('should set expires_at to 30 days from now', async () => {
      const mockSavedEntry = { id: 1 } as unknown as CachedInterpretation;
      repository.create.mockReturnValue(mockSavedEntry);
      repository.save.mockResolvedValue(mockSavedEntry);

      await service.saveToCache('key', 1, mockCardCombination, 'hash', 'text');

      const createCall = repository.create.mock
        .calls[0][0] as CachedInterpretation;
      const daysDiff = Math.floor(
        (createCall.expires_at.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );

      expect(daysDiff).toBeCloseTo(30, 0);
    });
  });

  describe('clearTarotistaCache', () => {
    it('should delete all cache entries for tarotista', async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 42 } as DeleteResult);

      const result = await service.clearTarotistaCache(100);

      expect(result).toBe(42);
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'tarotista_id = :tarotistaId',
        { tarotistaId: 100 },
      );
    });

    it('should return 0 if no entries deleted', async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 0 } as DeleteResult);

      const result = await service.clearTarotistaCache(100);

      expect(result).toBe(0);
    });

    it('should handle undefined affected count', async () => {
      queryBuilder.execute.mockResolvedValue({} as DeleteResult);

      const result = await service.clearTarotistaCache(100);

      expect(result).toBe(0);
    });
  });

  describe('clearAllCaches', () => {
    it('should reset memory cache and delete all DB entries', async () => {
      (cacheManager as unknown as { reset: jest.Mock }).reset = jest
        .fn()
        .mockResolvedValue(undefined);
      queryBuilder.execute.mockResolvedValue({ affected: 100 } as DeleteResult);

      await service.clearAllCaches();

      expect(
        (cacheManager as unknown as { reset: jest.Mock }).reset,
      ).toHaveBeenCalled();
      expect(queryBuilder.delete).toHaveBeenCalled();
    });

    it('should handle missing reset method gracefully', async () => {
      const cacheWithoutReset = cacheManager as unknown as Record<
        string,
        unknown
      >;
      delete cacheWithoutReset.reset;
      queryBuilder.execute.mockResolvedValue({ affected: 50 } as DeleteResult);

      await service.clearAllCaches();

      expect(queryBuilder.delete).toHaveBeenCalled();
    });
  });

  describe('cleanExpiredCache', () => {
    it('should delete expired entries', async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 15 } as DeleteResult);

      const result = await service.cleanExpiredCache();

      expect(result).toBe(15);
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'expires_at < :now',
        expect.objectContaining({ now: expect.any(Date) as unknown as Date }),
      );
    });

    it('should return 0 if no expired entries', async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 0 } as DeleteResult);

      const result = await service.cleanExpiredCache();

      expect(result).toBe(0);
    });
  });

  describe('cleanUnusedCache', () => {
    it('should delete unused entries older than 7 days', async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 10 } as DeleteResult);

      const result = await service.cleanUnusedCache();

      expect(result).toBe(10);
      expect(queryBuilder.where).toHaveBeenCalledWith('hit_count < :minHits', {
        minHits: 2,
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'created_at < :cutoffDate',
        expect.objectContaining({
          cutoffDate: expect.any(Date) as unknown as Date,
        }),
      );
    });

    it('should return 0 if no unused entries', async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 0 } as DeleteResult);

      const result = await service.cleanUnusedCache();

      expect(result).toBe(0);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      const mockStats = {
        total: '150',
        expired: '10',
        avg_hits: '7.5',
      };
      queryBuilder.getRawOne.mockResolvedValue(mockStats);

      const result = await service.getCacheStats();

      expect(result).toEqual({
        total: 150,
        expired: 10,
        avgHits: 7.5,
      });
    });

    it('should handle null stats gracefully', async () => {
      queryBuilder.getRawOne.mockResolvedValue(null);

      const result = await service.getCacheStats();

      expect(result).toEqual({
        total: 0,
        expired: 0,
        avgHits: 0,
      });
    });

    it('should handle undefined values', async () => {
      queryBuilder.getRawOne.mockResolvedValue({
        total: undefined,
        expired: undefined,
        avg_hits: undefined,
      });

      const result = await service.getCacheStats();

      expect(result).toEqual({
        total: 0,
        expired: 0,
        avgHits: 0,
      });
    });
  });

  describe('invalidateTarotistaCache', () => {
    it('should invalidate all cache for tarotista and update metrics', async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 25 } as DeleteResult);

      const result = await service.invalidateTarotistaCache(100);

      expect(result).toBe(25);
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'tarotista_id = :tarotistaId',
        { tarotistaId: 100 },
      );

      const metrics = await service.getInvalidationMetrics();
      expect(metrics.byTarotista).toBeGreaterThan(0);
    });

    it('should log invalidation events', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      queryBuilder.execute.mockResolvedValue({ affected: 5 } as DeleteResult);

      await service.invalidateTarotistaCache(100);

      expect(logSpy).toHaveBeenCalledWith(
        'Invalidating all cache for tarotista 100',
        'CacheInvalidation',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Invalidated 5 cache entries for tarotista 100',
        'CacheInvalidation',
      );
    });
  });

  describe('invalidateTarotistaMeaningsCache', () => {
    it('should selectively invalidate cache for affected cards', async () => {
      const mockEntries = [
        {
          id: 1,
          cache_key: 'key1',
          card_combination: [
            { card_id: '10', position: 0, is_reversed: false },
          ],
        },
        {
          id: 2,
          cache_key: 'key2',
          card_combination: [
            { card_id: '20', position: 0, is_reversed: false },
          ],
        },
      ];

      queryBuilder.getMany.mockResolvedValue(
        mockEntries as unknown as CachedInterpretation[],
      );
      queryBuilder.execute.mockResolvedValue({ affected: 1 } as DeleteResult);

      const result = await service.invalidateTarotistaMeaningsCache(100, [10]);

      expect(result).toBe(1);
      expect(queryBuilder.whereInIds).toHaveBeenCalledWith([1]);

      const metrics = await service.getInvalidationMetrics();
      expect(metrics.byMeanings).toBeGreaterThan(0);
    });

    it('should return 0 if no affected entries found', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      const result = await service.invalidateTarotistaMeaningsCache(100, [999]);

      expect(result).toBe(0);
      expect(queryBuilder.whereInIds).not.toHaveBeenCalled();
    });

    it('should handle multiple card IDs', async () => {
      const mockEntries = [
        {
          id: 1,
          card_combination: [
            { card_id: '10', position: 0, is_reversed: false },
          ],
        },
        {
          id: 2,
          card_combination: [
            { card_id: '20', position: 0, is_reversed: false },
          ],
        },
      ];

      queryBuilder.getMany.mockResolvedValue(
        mockEntries as unknown as CachedInterpretation[],
      );
      queryBuilder.execute.mockResolvedValue({ affected: 2 } as DeleteResult);

      const result = await service.invalidateTarotistaMeaningsCache(
        100,
        [10, 20],
      );

      expect(result).toBe(2);
      expect(queryBuilder.whereInIds).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('invalidateCascade', () => {
    it('should cascade invalidate all tarotista cache', async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 50 } as DeleteResult);

      const result = await service.invalidateCascade(100);

      expect(result).toBe(50);
    });
  });

  describe('handleTarotistaConfigUpdated', () => {
    it('should invalidate cache when config updated', async () => {
      const payload = {
        tarotistaId: 100,
        previousConfig: {} as TarotistaConfig,
        newConfig: {} as TarotistaConfig,
      };

      queryBuilder.execute.mockResolvedValue({ affected: 10 } as DeleteResult);

      await service.handleTarotistaConfigUpdated(payload);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'tarotista_id = :tarotistaId',
        { tarotistaId: 100 },
      );
    });
  });

  describe('handleTarotistaMeaningsUpdated', () => {
    it('should invalidate cache when meanings updated', async () => {
      const payload = {
        tarotistaId: 100,
        cardId: 42,
        previousMeaning: null,
        newMeaning: {} as TarotistaCardMeaning,
      };

      queryBuilder.getMany.mockResolvedValue([]);

      await service.handleTarotistaMeaningsUpdated(payload);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'tarotista_id = :tarotistaId',
        { tarotistaId: 100 },
      );
    });
  });

  describe('getInvalidationMetrics', () => {
    it('should return current metrics', async () => {
      const metrics = await service.getInvalidationMetrics();

      expect(metrics).toHaveProperty('total');
      expect(metrics).toHaveProperty('byTarotista');
      expect(metrics).toHaveProperty('byMeanings');
    });

    it('should accumulate metrics across multiple invalidations', async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 1 } as DeleteResult);
      queryBuilder.getMany.mockResolvedValue([]);

      await service.invalidateTarotistaCache(1);
      await service.invalidateTarotistaCache(2);

      const metrics = await service.getInvalidationMetrics();
      expect(metrics.total).toBeGreaterThanOrEqual(2);
    });
  });
});
