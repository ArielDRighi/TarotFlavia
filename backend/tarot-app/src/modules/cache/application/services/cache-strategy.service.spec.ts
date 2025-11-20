import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { CacheStrategyService } from './cache-strategy.service';
import { InterpretationCacheService } from './interpretation-cache.service';
import { CachedInterpretation } from '../../infrastructure/entities/cached-interpretation.entity';
import { CacheLevel } from '../constants/cache-strategy.constants';

describe('CacheStrategyService', () => {
  let service: CacheStrategyService;
  let cacheRepository: Repository<CachedInterpretation>;
  let interpretationCacheService: InterpretationCacheService;

  const mockCachedInterpretation: Partial<CachedInterpretation> = {
    id: '1',
    cache_key: 't1:test-key',
    interpretation_text: 'Test interpretation',
    hit_count: 5,
    created_at: new Date('2025-01-01'),
    expires_at: new Date('2025-02-01'),
    spread_id: 1,
    card_combination: [
      { card_id: '1', position: 0, is_reversed: false },
      { card_id: '2', position: 1, is_reversed: false },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheStrategyService,
        {
          provide: getRepositoryToken(CachedInterpretation),
          useValue: {
            find: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            })),
          },
        },
        {
          provide: InterpretationCacheService,
          useValue: {
            generateCacheKey: jest.fn(),
            getFromCache: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CacheStrategyService>(CacheStrategyService);
    cacheRepository = module.get<Repository<CachedInterpretation>>(
      getRepositoryToken(CachedInterpretation),
    );
    interpretationCacheService = module.get<InterpretationCacheService>(
      InterpretationCacheService,
    );

    // Silenciar logs en tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateDynamicTTL', () => {
    it('should return 7 days for low popularity (hit_count < 3)', () => {
      expect(service.calculateDynamicTTL(0)).toBe(7);
      expect(service.calculateDynamicTTL(2)).toBe(7);
    });

    it('should return 30 days for medium popularity (hit_count 3-9)', () => {
      expect(service.calculateDynamicTTL(3)).toBe(30);
      expect(service.calculateDynamicTTL(9)).toBe(30);
    });

    it('should return 90 days for high popularity (hit_count >= 10)', () => {
      expect(service.calculateDynamicTTL(10)).toBe(90);
      expect(service.calculateDynamicTTL(50)).toBe(90);
    });
  });

  describe('updateDynamicTTLs', () => {
    it('should update TTL for caches with outdated expiration', async () => {
      const oldDate = new Date('2025-01-01');
      const recentDate = new Date();

      const mockCaches = [
        {
          ...mockCachedInterpretation,
          hit_count: 15, // high popularity, should get 90 days
          created_at: oldDate,
          expires_at: new Date(oldDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from creation
        },
        {
          ...mockCachedInterpretation,
          id: '2',
          hit_count: 1, // low popularity, should keep 7 days
          created_at: recentDate,
          expires_at: new Date(recentDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      ] as CachedInterpretation[];

      jest.spyOn(cacheRepository, 'find').mockResolvedValue(mockCaches);
      jest
        .spyOn(cacheRepository, 'update')
        .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      const updatedCount = await service.updateDynamicTTLs();

      // Solo el primero debería actualizarse (de 7 a 90 días)
      expect(updatedCount).toBe(1);
      expect(cacheRepository.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('calculateQuestionSimilarity', () => {
    it('should return 1 for identical questions', () => {
      const q1 = 'What does my future hold?';
      const q2 = 'What does my future hold?';

      const similarity = service.calculateQuestionSimilarity(q1, q2);

      expect(similarity).toBe(1);
    });

    it('should return high similarity for questions differing only in stop words', () => {
      const q1 = 'que me depara el futuro';
      const q2 = 'que depara futuro'; // missing "me" and "el"

      const similarity = service.calculateQuestionSimilarity(q1, q2);

      // Después de normalización (remover stop words), deberían ser casi idénticas
      expect(similarity).toBeGreaterThan(0.8);
    });

    it('should return low similarity for completely different questions', () => {
      const q1 = 'What does my future hold?';
      const q2 = 'Am I going to find love?';

      const similarity = service.calculateQuestionSimilarity(q1, q2);

      expect(similarity).toBeLessThan(0.5);
    });

    it('should handle case insensitivity', () => {
      const q1 = 'WHAT DOES MY FUTURE HOLD?';
      const q2 = 'what does my future hold?';

      const similarity = service.calculateQuestionSimilarity(q1, q2);

      expect(similarity).toBe(1);
    });
  });

  describe('getFromMultiLevelCache', () => {
    const cardCombination = [
      { card_id: '1', position: 0, is_reversed: false },
      { card_id: '2', position: 1, is_reversed: false },
    ];
    const spreadId = 1;
    const questionHash = 'test-hash';

    it('should return exact cache hit from Level 1', async () => {
      jest
        .spyOn(interpretationCacheService, 'generateCacheKey')
        .mockReturnValue('exact-cache-key');

      jest
        .spyOn(interpretationCacheService, 'getFromCache')
        .mockResolvedValue(mockCachedInterpretation as CachedInterpretation);

      const result = await service.getFromMultiLevelCache(
        cardCombination,
        spreadId,
        questionHash,
      );

      expect(result.level).toBe(CacheLevel.EXACT);
      expect(result.cached).toBeDefined();
      expect(result.cached?.id).toBe('1');
    });

    it('should return cache miss when no match found', async () => {
      jest
        .spyOn(interpretationCacheService, 'generateCacheKey')
        .mockReturnValue('exact-cache-key');

      jest
        .spyOn(interpretationCacheService, 'getFromCache')
        .mockResolvedValue(null);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(cacheRepository, 'createQueryBuilder')
        .mockReturnValue(
          mockQueryBuilder as unknown as ReturnType<
            Repository<CachedInterpretation>['createQueryBuilder']
          >,
        );

      const result = await service.getFromMultiLevelCache(
        cardCombination,
        spreadId,
        questionHash,
      );

      expect(result.level).toBe(CacheLevel.EXACT);
      expect(result.cached).toBeNull();
    });
  });

  describe('getTopCachedCombinations', () => {
    it('should return top N cached combinations ordered by hit_count', async () => {
      const mockTopCaches = [
        { ...mockCachedInterpretation, hit_count: 100 },
        { ...mockCachedInterpretation, id: '2', hit_count: 50 },
        { ...mockCachedInterpretation, id: '3', hit_count: 25 },
      ] as CachedInterpretation[];

      jest.spyOn(cacheRepository, 'find').mockResolvedValue(mockTopCaches);

      const result = await service.getTopCachedCombinations(3);

      expect(result).toHaveLength(3);
      expect(result[0].hitCount).toBe(100);
      expect(result[1].hitCount).toBe(50);
      expect(result[2].hitCount).toBe(25);
      expect(cacheRepository.find).toHaveBeenCalledWith({
        order: { hit_count: 'DESC' },
        take: 3,
      });
    });
  });

  describe('getCacheHitRate', () => {
    it('should calculate hit rate percentage correctly', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest
          .fn()
          .mockResolvedValueOnce(80) // cache hits
          .mockResolvedValueOnce(20), // cache misses
      };

      jest
        .spyOn(cacheRepository, 'createQueryBuilder')
        .mockReturnValue(
          mockQueryBuilder as unknown as ReturnType<
            Repository<CachedInterpretation>['createQueryBuilder']
          >,
        );

      const result = await service.getCacheHitRate(startDate, endDate);

      expect(result.cacheHits).toBe(80);
      expect(result.cacheMisses).toBe(20);
      expect(result.totalRequests).toBe(100);
      expect(result.hitRatePercentage).toBe(80);
    });

    it('should handle zero requests gracefully', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest
          .fn()
          .mockResolvedValueOnce(0) // cache hits
          .mockResolvedValueOnce(0), // cache misses
      };

      jest
        .spyOn(cacheRepository, 'createQueryBuilder')
        .mockReturnValue(
          mockQueryBuilder as unknown as ReturnType<
            Repository<CachedInterpretation>['createQueryBuilder']
          >,
        );

      const result = await service.getCacheHitRate(startDate, endDate);

      expect(result.totalRequests).toBe(0);
      expect(result.hitRatePercentage).toBe(0);
    });
  });
});
