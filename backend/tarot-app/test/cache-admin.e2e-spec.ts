import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { InterpretationsModule } from '../src/modules/tarot/interpretations/interpretations.module';
import { CachedInterpretation } from '../src/modules/tarot/interpretations/entities/cached-interpretation.entity';
import { TarotistasModule } from '../src/modules/tarotistas/tarotistas.module';

describe('Cache Admin Endpoints (e2e)', () => {
  let app: INestApplication;

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
          dropSchema: true,
        }),
        EventEmitterModule.forRoot(),
        CacheModule.register({
          isGlobal: true,
          ttl: 3600000,
        }),
        InterpretationsModule,
        TarotistasModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('DELETE /admin/cache/tarotistas/:id', () => {
    it('should invalidate cache for a specific tarotista', async () => {
      const response = await request(app.getHttpServer())
        .delete('/admin/cache/tarotistas/1')
        .expect(200);

      expect(response.body).toHaveProperty('deletedCount');
      expect(
        typeof (response.body as { deletedCount: number }).deletedCount,
      ).toBe('number');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid tarotista ID', async () => {
      await request(app.getHttpServer())
        .delete('/admin/cache/tarotistas/invalid')
        .expect(400);
    });
  });

  describe('DELETE /admin/cache/tarotistas/:id/meanings', () => {
    it('should invalidate cache for specific card meanings', async () => {
      const response = await request(app.getHttpServer())
        .delete('/admin/cache/tarotistas/1/meanings')
        .query({ cardIds: '5,10,15' })
        .expect(200);

      expect(response.body).toHaveProperty('deletedCount');
      expect(
        typeof (response.body as { deletedCount: number }).deletedCount,
      ).toBe('number');
    });

    it('should require cardIds query parameter', async () => {
      await request(app.getHttpServer())
        .delete('/admin/cache/tarotistas/1/meanings')
        .expect(400);
    });

    it('should validate cardIds format', async () => {
      await request(app.getHttpServer())
        .delete('/admin/cache/tarotistas/1/meanings')
        .query({ cardIds: 'invalid,ids' })
        .expect(400);
    });
  });

  describe('DELETE /admin/cache/global', () => {
    it('should clear all cache entries', async () => {
      const response = await request(app.getHttpServer())
        .delete('/admin/cache/global')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect((response.body as { message: string }).message).toContain(
        'cleared',
      );
    });
  });

  describe('GET /admin/cache/stats', () => {
    it('should return cache statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/cache/stats')
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('expired');
      expect(response.body).toHaveProperty('avgHits');
      expect(response.body).toHaveProperty('invalidations');

      const body = response.body as {
        total: number;
        expired: number;
        avgHits: number;
      };
      expect(typeof body.total).toBe('number');
      expect(typeof body.expired).toBe('number');
      expect(typeof body.avgHits).toBe('number');
    });

    it('should include invalidation metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/cache/stats')
        .expect(200);

      const body = response.body as {
        invalidations: {
          total: number;
          byTarotista: number;
          byMeanings: number;
        };
      };
      expect(body.invalidations).toHaveProperty('total');
      expect(body.invalidations).toHaveProperty('byTarotista');
      expect(body.invalidations).toHaveProperty('byMeanings');
    });
  });

  describe('Cache Invalidation Logs', () => {
    it('should log invalidation when deleting tarotista cache', async () => {
      const response = await request(app.getHttpServer())
        .delete('/admin/cache/tarotistas/1')
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('reason');
      expect((response.body as { reason: string }).reason).toBe(
        'manual-invalidation',
      );
    });
  });
});
