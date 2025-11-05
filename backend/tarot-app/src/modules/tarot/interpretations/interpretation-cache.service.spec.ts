import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InterpretationCacheService } from './interpretation-cache.service';
import { CachedInterpretation } from './entities/cached-interpretation.entity';

describe('InterpretationCacheService', () => {
  let service: InterpretationCacheService;

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    create: jest.fn((entity: unknown) => entity),
    createQueryBuilder: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
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
      ],
    }).compile();

    service = module.get<InterpretationCacheService>(
      InterpretationCacheService,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCacheKey', () => {
    it('should generate a deterministic cache key for the same input', () => {
      const cardCombination = [
        { card_id: 'card1', position: 0, is_reversed: false },
        { card_id: 'card2', position: 1, is_reversed: true },
      ];
      const spreadId = 'spread123';
      const questionHash = 'question-hash';

      const key1 = service.generateCacheKey(
        cardCombination,
        spreadId,
        questionHash,
      );
      const key2 = service.generateCacheKey(
        cardCombination,
        spreadId,
        questionHash,
      );

      expect(key1).toBe(key2);
      expect(key1).toBeTruthy();
    });

    it('should generate different keys for different card combinations', () => {
      const combo1 = [
        { card_id: 'card1', position: 0, is_reversed: false },
        { card_id: 'card2', position: 1, is_reversed: true },
      ];
      const combo2 = [
        { card_id: 'card1', position: 0, is_reversed: true },
        { card_id: 'card2', position: 1, is_reversed: false },
      ];
      const spreadId = 'spread123';
      const questionHash = 'question-hash';

      const key1 = service.generateCacheKey(combo1, spreadId, questionHash);
      const key2 = service.generateCacheKey(combo2, spreadId, questionHash);

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different spreads', () => {
      const cardCombination = [
        { card_id: 'card1', position: 0, is_reversed: false },
      ];
      const questionHash = 'question-hash';

      const key1 = service.generateCacheKey(
        cardCombination,
        'spread1',
        questionHash,
      );
      const key2 = service.generateCacheKey(
        cardCombination,
        'spread2',
        questionHash,
      );

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different questions', () => {
      const cardCombination = [
        { card_id: 'card1', position: 0, is_reversed: false },
      ];
      const spreadId = 'spread123';

      const key1 = service.generateCacheKey(cardCombination, spreadId, 'hash1');
      const key2 = service.generateCacheKey(cardCombination, spreadId, 'hash2');

      expect(key1).not.toBe(key2);
    });
  });

  describe('generateQuestionHash', () => {
    it('should generate a deterministic hash for the same question', () => {
      const category = 'Love';
      const questionText = 'Will I find love?';

      const hash1 = service.generateQuestionHash(category, questionText);
      const hash2 = service.generateQuestionHash(category, questionText);

      expect(hash1).toBe(hash2);
      expect(hash1).toBeTruthy();
    });

    it('should normalize question text and category (case and whitespace)', () => {
      const hash1 = service.generateQuestionHash('Love', 'Will I find love?');
      const hash2 = service.generateQuestionHash('love', 'will i find love?');
      const hash3 = service.generateQuestionHash(
        '  LOVE  ',
        '  WILL  I  FIND  LOVE?  ',
      );

      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
    });

    it('should generate different hashes for different categories', () => {
      const questionText = 'Will I find love?';

      const hash1 = service.generateQuestionHash('Love', questionText);
      const hash2 = service.generateQuestionHash('Career', questionText);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes for different questions', () => {
      const category = 'Love';

      const hash1 = service.generateQuestionHash(category, 'Will I find love?');
      const hash2 = service.generateQuestionHash(
        category,
        'Will I find money?',
      );

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('getFromCache', () => {
    it('should check in-memory cache first', async () => {
      const cacheKey = 'test-key';
      const cachedData = { interpretation_text: 'cached interpretation' };

      mockCacheManager.get.mockResolvedValue(cachedData);

      const result = await service.getFromCache(cacheKey);

      expect(mockCacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(result).toEqual(cachedData);
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('should check database if not in memory cache', async () => {
      const cacheKey = 'test-key';
      const dbCached = {
        id: '123',
        cache_key: cacheKey,
        interpretation_text: 'db interpretation',
        expires_at: new Date(Date.now() + 86400000),
        hit_count: 5,
      } as CachedInterpretation;

      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(dbCached);

      const result = await service.getFromCache(cacheKey);

      expect(mockCacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cache_key: cacheKey },
      });
      expect(result).toEqual(dbCached);
    });

    it('should not return expired cache from database', async () => {
      const cacheKey = 'test-key';
      const expiredCache = {
        id: '123',
        cache_key: cacheKey,
        interpretation_text: 'expired interpretation',
        expires_at: new Date(Date.now() - 1000),
        hit_count: 5,
      } as CachedInterpretation;

      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(expiredCache);

      const result = await service.getFromCache(cacheKey);

      expect(result).toBeNull();
    });

    it('should return null if not found anywhere', async () => {
      const cacheKey = 'test-key';

      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getFromCache(cacheKey);

      expect(result).toBeNull();
    });

    it('should update hit count and last_used_at when cache is found in DB', async () => {
      const cacheKey = 'test-key';
      const dbCached = {
        id: '123',
        cache_key: cacheKey,
        interpretation_text: 'db interpretation',
        expires_at: new Date(Date.now() + 86400000),
        hit_count: 5,
      } as CachedInterpretation;

      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(dbCached);
      mockRepository.update.mockResolvedValue(undefined);

      await service.getFromCache(cacheKey);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: '123' },
        expect.objectContaining({
          hit_count: 6,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          last_used_at: expect.any(Date),
        }),
      );
    });

    it('should save to in-memory cache when found in DB', async () => {
      const cacheKey = 'test-key';
      const dbCached = {
        id: '123',
        cache_key: cacheKey,
        interpretation_text: 'db interpretation',
        expires_at: new Date(Date.now() + 86400000),
        hit_count: 5,
      } as CachedInterpretation;

      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(dbCached);
      mockRepository.update.mockResolvedValue(undefined);

      await service.getFromCache(cacheKey);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        cacheKey,
        dbCached,
        3600000,
      );
    });
  });

  describe('saveToCache', () => {
    it('should save to both in-memory and database caches', async () => {
      const cacheKey = 'test-key';
      const spreadId = 123;
      const cardCombination = [
        { card_id: 'card1', position: 0, is_reversed: false },
      ];
      const questionHash = 'hash123';
      const interpretation = 'test interpretation';

      const savedEntity = {
        id: '123',
        cache_key: cacheKey,
        spread_id: spreadId,
        card_combination: cardCombination,
        question_hash: questionHash,
        interpretation_text: interpretation,
        hit_count: 0,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      } as CachedInterpretation;

      mockRepository.save.mockResolvedValue(savedEntity);

      await service.saveToCache(
        cacheKey,
        spreadId,
        cardCombination,
        questionHash,
        interpretation,
      );

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          cache_key: cacheKey,
          spread_id: spreadId,
          card_combination: cardCombination,
          question_hash: questionHash,
          interpretation_text: interpretation,
          hit_count: 0,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          expires_at: expect.any(Date),
        }),
      );

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        cacheKey,
        savedEntity,
        3600000,
      );
    });

    it('should set expires_at to 30 days from now', async () => {
      const cacheKey = 'test-key';
      const spreadId = 123;
      const cardCombination = [
        { card_id: 'card1', position: 0, is_reversed: false },
      ];
      const questionHash = 'hash123';
      const interpretation = 'test interpretation';

      mockRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity as CachedInterpretation),
      );

      const beforeSave = Date.now();
      await service.saveToCache(
        cacheKey,
        spreadId,
        cardCombination,
        questionHash,
        interpretation,
      );
      const afterSave = Date.now();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const saveCall = mockRepository.save.mock.calls[0][0];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const expiresAt = saveCall.expires_at.getTime();

      const expectedMin = beforeSave + 29.9 * 24 * 60 * 60 * 1000;
      const expectedMax = afterSave + 30.1 * 24 * 60 * 60 * 1000;

      expect(expiresAt).toBeGreaterThan(expectedMin);
      expect(expiresAt).toBeLessThan(expectedMax);
    });
  });

  describe('clearAllCaches', () => {
    it('should clear database cache', async () => {
      const queryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 10 }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder as never);

      await service.clearAllCaches();

      expect(queryBuilder.delete).toHaveBeenCalled();
      expect(queryBuilder.from).toHaveBeenCalledWith(CachedInterpretation);
      expect(queryBuilder.execute).toHaveBeenCalled();
    });
  });

  describe('cleanExpiredCache', () => {
    it('should delete expired cache entries from database', async () => {
      const queryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder as never);

      const result = await service.cleanExpiredCache();

      expect(queryBuilder.delete).toHaveBeenCalled();
      expect(queryBuilder.from).toHaveBeenCalledWith(CachedInterpretation);
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'expires_at < :now',
        expect.any(Object),
      );
      expect(queryBuilder.execute).toHaveBeenCalled();
      expect(result).toBe(5);
    });
  });

  describe('cleanUnusedCache', () => {
    it('should delete cache entries with low usage after 7 days', async () => {
      const queryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 3 }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder as never);

      const result = await service.cleanUnusedCache();

      expect(queryBuilder.delete).toHaveBeenCalled();
      expect(queryBuilder.from).toHaveBeenCalledWith(CachedInterpretation);
      expect(queryBuilder.where).toHaveBeenCalledWith('hit_count < :minHits', {
        minHits: 2,
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'created_at < :cutoffDate',
        expect.any(Object),
      );
      expect(queryBuilder.execute).toHaveBeenCalled();
      expect(result).toBe(3);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          total: '100',
          expired: '10',
          avg_hits: '5.5',
        }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder as never);

      const stats = await service.getCacheStats();

      expect(stats).toEqual({
        total: 100,
        expired: 10,
        avgHits: 5.5,
      });
      expect(queryBuilder.setParameter).toHaveBeenCalledWith(
        'now',
        expect.any(Date),
      );
    });
  });
});
