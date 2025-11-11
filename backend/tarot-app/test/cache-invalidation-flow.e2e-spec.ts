import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { InterpretationCacheService } from '../src/modules/cache/application/services/interpretation-cache.service';

describe('Cache Invalidation Flow (e2e)', () => {
  let app: INestApplication<App>;
  let cacheService: InterpretationCacheService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    cacheService = moduleFixture.get<InterpretationCacheService>(
      InterpretationCacheService,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Automatic cache invalidation on config update', () => {
    it('should track invalidation metrics when config is updated', async () => {
      const tarotistaId = 1;

      // 1. Get initial metrics
      const metricsBefore = await cacheService.getInvalidationMetrics();
      const initialByTarotista = metricsBefore.byTarotista;

      // 2. Simulate cache invalidation due to config update
      await cacheService.invalidateTarotistaCache(tarotistaId);

      // 3. Verify that metrics were updated
      const metricsAfter = await cacheService.getInvalidationMetrics();
      expect(metricsAfter.byTarotista).toBe(initialByTarotista + 1);
      expect(metricsAfter.total).toBeGreaterThan(metricsBefore.total);
    });
  });

  describe('Automatic cache invalidation on card meaning update', () => {
    it('should track invalidation metrics when card meaning is updated', async () => {
      const tarotistaId = 2;
      const cardId = 5;

      // 1. Create cache entries
      await cacheService.saveToCache(
        'test-key-affected',
        null,
        [{ card_id: '5', position: 0, is_reversed: false }],
        'question-hash',
        'interpretation with card 5',
        tarotistaId,
      );

      // 2. Get initial metrics
      const metricsBefore = await cacheService.getInvalidationMetrics();
      const initialByMeanings = metricsBefore.byMeanings;

      // 3. Invalidate cache due to meaning change
      await cacheService.invalidateTarotistaMeaningsCache(tarotistaId, [
        cardId,
      ]);

      // 4. Verify that metrics were updated
      const metricsAfter = await cacheService.getInvalidationMetrics();
      expect(metricsAfter.byMeanings).toBe(initialByMeanings + 1);
    });
  });

  describe('Selective invalidation strategy', () => {
    it('should only invalidate cache entries that use the modified cards', async () => {
      const tarotistaId = 3;

      // Create multiple entries with different cards
      await cacheService.saveToCache(
        'key-card-1',
        null,
        [{ card_id: '1', position: 0, is_reversed: false }],
        'hash-1',
        'interpretation 1',
        tarotistaId,
      );

      await cacheService.saveToCache(
        'key-card-2',
        null,
        [{ card_id: '2', position: 0, is_reversed: false }],
        'hash-2',
        'interpretation 2',
        tarotistaId,
      );

      await cacheService.saveToCache(
        'key-card-3',
        null,
        [{ card_id: '3', position: 0, is_reversed: false }],
        'hash-3',
        'interpretation 3',
        tarotistaId,
      );

      const statsBefore = await cacheService.getCacheStats();
      const totalBefore = statsBefore.total;

      // Invalidate only cards 1 and 2
      const deleted = await cacheService.invalidateTarotistaMeaningsCache(
        tarotistaId,
        [1, 2],
      );

      expect(deleted).toBe(2);

      const statsAfter = await cacheService.getCacheStats();
      expect(statsAfter.total).toBe(totalBefore - 2);
    });
  });
});
