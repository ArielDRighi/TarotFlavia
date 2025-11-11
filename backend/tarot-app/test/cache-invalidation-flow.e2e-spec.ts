import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { InterpretationsModule } from '../src/modules/tarot/interpretations/interpretations.module';
import { InterpretationCacheService } from '../src/modules/tarot/interpretations/interpretation-cache.service';
import { CachedInterpretation } from '../src/modules/tarot/interpretations/entities/cached-interpretation.entity';

describe('Cache Invalidation Flow (e2e)', () => {
  let app: INestApplication;
  let cacheService: InterpretationCacheService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TAROT_E2E_DB_HOST || 'localhost',
          port: parseInt(process.env.TAROT_E2E_DB_PORT || '5433', 10),
          username: process.env.TAROT_E2E_DB_USER || 'tarot_test',
          password: process.env.TAROT_E2E_DB_PASSWORD || 'test_password',
          database: process.env.TAROT_E2E_DB_NAME || 'tarot_test',
          entities: [CachedInterpretation],
          synchronize: true,
          dropSchema: false, // No eliminar schema, ya está configurado
        }),
        EventEmitterModule.forRoot(),
        CacheModule.register({
          isGlobal: true,
          ttl: 3600000,
        }),
        InterpretationsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    cacheService = moduleFixture.get<InterpretationCacheService>(
      InterpretationCacheService,
    );
  }, 30000); // Aumentar timeout

  afterAll(async () => {
    await app.close();
  });

  describe('Automatic cache invalidation on config update', () => {
    it('should track invalidation metrics when config is updated', async () => {
      const tarotistaId = 1;

      // 1. Obtener métricas iniciales
      const metricsBefore = await cacheService.getInvalidationMetrics();
      const initialByTarotista = metricsBefore.byTarotista;

      // 2. Simular invalidación de cache por actualización de config
      await cacheService.invalidateTarotistaCache(tarotistaId);

      // 3. Verificar que las métricas se actualizaron
      const metricsAfter = await cacheService.getInvalidationMetrics();
      expect(metricsAfter.byTarotista).toBe(initialByTarotista + 1);
      expect(metricsAfter.total).toBeGreaterThan(metricsBefore.total);
    });
  });

  describe('Automatic cache invalidation on card meaning update', () => {
    it('should track invalidation metrics when card meaning is updated', async () => {
      const tarotistaId = 2;
      const cardId = 5;

      // 1. Crear entradas de cache
      await cacheService.saveToCache(
        'test-key-affected',
        null,
        [{ card_id: '5', position: 0, is_reversed: false }],
        'question-hash',
        'interpretation with card 5',
        tarotistaId,
      );

      // 2. Obtener métricas iniciales
      const metricsBefore = await cacheService.getInvalidationMetrics();
      const initialByMeanings = metricsBefore.byMeanings;

      // 3. Invalidar cache por cambio de significado
      await cacheService.invalidateTarotistaMeaningsCache(tarotistaId, [
        cardId,
      ]);

      // 4. Verificar que las métricas se actualizaron
      const metricsAfter = await cacheService.getInvalidationMetrics();
      expect(metricsAfter.byMeanings).toBe(initialByMeanings + 1);
    });
  });

  describe('Selective invalidation strategy', () => {
    it('should only invalidate cache entries that use the modified cards', async () => {
      const tarotistaId = 3;

      // Crear múltiples entradas con diferentes cartas
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

      // Invalidar solo las cartas 1 y 2
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
