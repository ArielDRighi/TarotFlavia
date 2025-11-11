import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { InterpretationCacheService } from '../../src/modules/cache/application/services/interpretation-cache.service';
import { CachedInterpretation } from '../../src/modules/cache/infrastructure/entities/cached-interpretation.entity';

describe('InterpretationCacheService - Invalidation', () => {
  let service: InterpretationCacheService;
  let cacheRepository: Repository<CachedInterpretation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterpretationCacheService,
        {
          provide: getRepositoryToken(CachedInterpretation),
          useClass: Repository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            reset: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InterpretationCacheService>(
      InterpretationCacheService,
    );
    cacheRepository = module.get<Repository<CachedInterpretation>>(
      getRepositoryToken(CachedInterpretation),
    );
  });

  describe('invalidateTarotistaCache', () => {
    it('should delete all cache entries for a specific tarotista', async () => {
      const tarotistaId = 1;

      const mockResult = { affected: 5, raw: [] };
      const deleteQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(mockResult),
      };

      jest
        .spyOn(cacheRepository, 'createQueryBuilder')
        .mockReturnValue(deleteQueryBuilder as never);

      const result = await service.invalidateTarotistaCache(tarotistaId);

      expect(result).toBe(5);
      expect(deleteQueryBuilder.delete).toHaveBeenCalled();
      expect(deleteQueryBuilder.where).toHaveBeenCalledWith(
        'tarotista_id = :tarotistaId',
        { tarotistaId },
      );
    });
  });

  describe('invalidateTarotistaMeaningsCache', () => {
    it('should delete cache entries affected by specific card meanings', async () => {
      const tarotistaId = 1;
      const cardIds = [5, 10, 15];

      const mockCacheEntries = [
        {
          id: 1,
          cache_key: 'key1',
          card_combination: [{ card_id: '5', position: 0, is_reversed: false }],
        },
        {
          id: 2,
          cache_key: 'key2',
          card_combination: [
            { card_id: '10', position: 0, is_reversed: false },
          ],
        },
      ];

      const selectQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockCacheEntries),
      };

      const deleteQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        whereInIds: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 2, raw: [] }),
      };

      jest
        .spyOn(cacheRepository, 'createQueryBuilder')
        .mockReturnValueOnce(selectQueryBuilder as never)
        .mockReturnValueOnce(deleteQueryBuilder as never);

      const result = await service.invalidateTarotistaMeaningsCache(
        tarotistaId,
        cardIds,
      );

      expect(result).toBe(2);
      expect(selectQueryBuilder.where).toHaveBeenCalledWith(
        'tarotista_id = :tarotistaId',
        { tarotistaId },
      );
    });

    it('should return 0 if no cache entries are affected', async () => {
      const tarotistaId = 1;
      const cardIds = [99];

      const selectQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(cacheRepository, 'createQueryBuilder')
        .mockReturnValue(selectQueryBuilder as never);

      const result = await service.invalidateTarotistaMeaningsCache(
        tarotistaId,
        cardIds,
      );

      expect(result).toBe(0);
    });
  });

  describe('invalidateCascade', () => {
    it('should invalidate all dependent interpretations when config changes', async () => {
      const tarotistaId = 1;

      const mockResult = { affected: 10, raw: [] };
      const deleteQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(mockResult),
      };

      jest
        .spyOn(cacheRepository, 'createQueryBuilder')
        .mockReturnValue(deleteQueryBuilder as never);

      const result = await service.invalidateCascade(tarotistaId);

      expect(result).toBe(10);
      expect(deleteQueryBuilder.where).toHaveBeenCalledWith(
        'tarotista_id = :tarotistaId',
        { tarotistaId },
      );
    });
  });

  describe('Event Listeners', () => {
    it('should handle tarotista.config.updated event', async () => {
      const tarotistaId = 1;

      jest.spyOn(service, 'invalidateTarotistaCache').mockResolvedValue(5);

      await service.handleTarotistaConfigUpdated({
        tarotistaId,
        previousConfig: {} as never,
        newConfig: {} as never,
      });

      expect(service.invalidateTarotistaCache).toHaveBeenCalledWith(
        tarotistaId,
      );
    });

    it('should handle tarotista.meanings.updated event', async () => {
      const tarotistaId = 1;
      const cardId = 5;

      jest
        .spyOn(service, 'invalidateTarotistaMeaningsCache')
        .mockResolvedValue(3);

      await service.handleTarotistaMeaningsUpdated({
        tarotistaId,
        cardId,
        previousMeaning: {} as never,
        newMeaning: {} as never,
      });

      expect(service.invalidateTarotistaMeaningsCache).toHaveBeenCalledWith(
        tarotistaId,
        [cardId],
      );
    });
  });
});
