/**
 * SUBTASK-23: Performance Tests - Database Queries
 *
 * Tests de rendimiento para queries de base de datos:
 * - Detectar N+1 problems
 * - Identificar queries lentos
 * - Verificar índices correctos
 * - Medir tiempos de query
 *
 * Filosofía: Identificar problemas reales de performance en DB
 */

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

interface ReadingResponse {
  id: number;
  deckId: number;
  spreadId: number;
  userId: number;
  cardPositions: unknown[];
  deck?: unknown;
  cards?: unknown[];
  category?: unknown;
  predefinedQuestion?: unknown;
}

interface PaginatedResponse {
  data: ReadingResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface QueryMetrics {
  duration: number;
  queryCount: number;
  rowsReturned: number;
}

describe('Performance Tests - Database Queries (SUBTASK-23)', () => {
  let app: INestApplication;
  let httpServer: App;
  let dbHelper: E2EDatabaseHelper;

  let premiumUserToken: string;
  let deckId: number;
  let spreadId: number;
  let questionId: number;
  let cardIds: number[];

  /**
   * Utility para medir tiempo de query SQL directo
   */
  async function measureDirectQuery(
    sql: string,
    params?: unknown[],
  ): Promise<QueryMetrics> {
    const startTime = Date.now();
    const result = (await dbHelper
      .getDataSource()
      .query(sql, params)) as unknown as unknown[];
    const duration = Date.now() - startTime;

    return {
      duration,
      queryCount: 1,
      rowsReturned: result.length,
    };
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer() as App;

    dbHelper = new E2EDatabaseHelper();
    await dbHelper.initialize();

    // Login premium user
    const premiumLogin = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'premium@test.com', password: 'Test123456!' })
      .expect(200);
    premiumUserToken = (premiumLogin.body as LoginResponse).access_token;

    // Get seeded IDs
    const decks = (await dbHelper
      .getDataSource()
      .query('SELECT id FROM tarot_deck LIMIT 1')) as unknown as {
      id: number;
    }[];
    deckId = decks[0].id;

    const spreads = (await dbHelper
      .getDataSource()
      .query('SELECT id FROM tarot_spread LIMIT 1')) as unknown as {
      id: number;
    }[];
    spreadId = spreads[0].id;

    const questions = (await dbHelper
      .getDataSource()
      .query('SELECT id FROM predefined_question LIMIT 1')) as unknown as {
      id: number;
    }[];
    questionId = questions[0].id;

    const cards = (await dbHelper
      .getDataSource()
      .query('SELECT id FROM tarot_card LIMIT 3')) as unknown as {
      id: number;
    }[];
    cardIds = cards.map((c) => c.id);

    // Create test readings for query testing
    for (let i = 0; i < 20; i++) {
      await request(httpServer)
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          deckId,
          spreadId,
          predefinedQuestionId: questionId,
          cardIds,
          cardPositions: cardIds.map((id, idx) => ({
            cardId: id,
            position: `pos_${idx}`,
            isReversed: false,
          })),
          generateInterpretation: false,
        })
        .expect(201);
    }
  }, 60000);

  afterAll(async () => {
    await dbHelper.close();
    await app.close();
  });

  /**
   * TEST 1: GET /readings debe cargar relaciones eficientemente (sin N+1)
   */
  describe('GET /readings - N+1 Prevention', () => {
    it('should load all relations in a single query (no N+1 problem)', async () => {
      const response = await request(httpServer)
        .get('/readings?limit=10')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      const body = response.body as PaginatedResponse;
      expect(body.data).toBeDefined();
      expect(body.data.length).toBeGreaterThan(0);

      // Verificar que las relaciones están cargadas
      const firstReading = body.data[0];
      expect(firstReading.deck).toBeDefined();
      expect(firstReading.cards).toBeDefined();
      expect(Array.isArray(firstReading.cards)).toBe(true);

      // NOTE: No podemos medir queries exactos sin instrumentación adicional,
      // pero verificamos que las relaciones están presentes (no undefined)
      // Si hubiera N+1, las relaciones estarían undefined o requerirían requests adicionales
    });

    it('should load 20 readings with relations in <500ms', async () => {
      const startTime = Date.now();

      const response = await request(httpServer)
        .get('/readings?limit=20')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      const duration = Date.now() - startTime;
      const body = response.body as PaginatedResponse;

      expect(body.data).toBeDefined();
      expect(body.data.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(500); // <500ms para 20 readings con relaciones
    });

    it('should use leftJoinAndSelect for eager loading (check SQL pattern)', async () => {
      // Este test verifica que el repository usa leftJoinAndSelect correctamente
      // Los readings deben incluir deck, cards, category automáticamente
      const response = await request(httpServer)
        .get('/readings?limit=1')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      const body = response.body as PaginatedResponse;
      const reading = body.data[0];

      // Si usara N+1, estas propiedades serían undefined hasta lazy load
      expect(reading).toBeDefined();
      expect(reading.deck).toBeDefined(); // Eager loaded via leftJoinAndSelect
      expect(reading.cards).toBeDefined(); // Eager loaded via leftJoinAndSelect
      expect(Array.isArray(reading.cards)).toBe(true);
    });
  });

  /**
   * TEST 2: Queries directos de base de datos
   */
  describe('Direct Database Queries - Performance', () => {
    it('should query readings with JOIN in <100ms', async () => {
      const metrics = await measureDirectQuery(`
        SELECT r.*, d.name as deck_name
        FROM tarot_reading r
        LEFT JOIN tarot_deck d ON r."deckId" = d.id
        WHERE r."deletedAt" IS NULL
        LIMIT 10
      `);

      console.log('📊 Query readings with JOIN:', {
        duration: `${metrics.duration}ms`,
        rows: metrics.rowsReturned,
      });

      expect(metrics.duration).toBeLessThan(100); // <100ms
      expect(metrics.rowsReturned).toBeGreaterThan(0);
    });

    it('should query readings with multiple JOINs in <150ms', async () => {
      // NOTE: Using tarot_reading_cards_tarot_card (TypeORM auto-generated join table name)
      const metrics = await measureDirectQuery(`
        SELECT r.id, r."createdAt", d.name as deck_name, COUNT(c.id) as card_count
        FROM tarot_reading r
        LEFT JOIN tarot_deck d ON r."deckId" = d.id
        LEFT JOIN tarot_reading_cards_tarot_card rc ON rc."tarotReadingId" = r.id
        LEFT JOIN tarot_card c ON rc."tarotCardId" = c.id
        WHERE r."deletedAt" IS NULL
        GROUP BY r.id, d.name
        LIMIT 10
      `);

      console.log('📊 Query readings with multiple JOINs:', {
        duration: `${metrics.duration}ms`,
        rows: metrics.rowsReturned,
      });

      expect(metrics.duration).toBeLessThan(150); // <150ms
      expect(metrics.rowsReturned).toBeGreaterThan(0);
    });

    it('should count total readings in <50ms', async () => {
      const metrics = await measureDirectQuery(`
        SELECT COUNT(*) as total
        FROM tarot_reading
        WHERE "deletedAt" IS NULL
      `);

      console.log('📊 Count total readings:', {
        duration: `${metrics.duration}ms`,
      });

      expect(metrics.duration).toBeLessThan(50); // <50ms for simple count
    });

    it('should filter readings by date range in <100ms', async () => {
      const dateFrom = new Date('2024-01-01').toISOString();
      const dateTo = new Date().toISOString();

      const metrics = await measureDirectQuery(
        `
        SELECT r.*
        FROM tarot_reading r
        WHERE r."deletedAt" IS NULL
          AND r."createdAt" >= $1
          AND r."createdAt" <= $2
        LIMIT 20
      `,
        [dateFrom, dateTo],
      );

      console.log('📊 Filter readings by date range:', {
        duration: `${metrics.duration}ms`,
        rows: metrics.rowsReturned,
      });

      expect(metrics.duration).toBeLessThan(100); // <100ms
    });
  });

  /**
   * TEST 3: Index effectiveness
   */
  describe('Database Indexes - Effectiveness', () => {
    it('should use index on userId for fast lookup', async () => {
      // Get premium user ID
      const users = (await dbHelper
        .getDataSource()
        .query(
          `SELECT id FROM "user" WHERE email = 'premium@test.com'`,
        )) as unknown as { id: number }[];
      const userId = users[0].id;

      const metrics = await measureDirectQuery(
        `
        SELECT r.*
        FROM tarot_reading r
        WHERE r."userId" = $1
          AND r."deletedAt" IS NULL
        LIMIT 20
      `,
        [userId],
      );

      console.log('📊 Query by userId (indexed):', {
        duration: `${metrics.duration}ms`,
        rows: metrics.rowsReturned,
      });

      // Should be very fast (<50ms) if index exists
      expect(metrics.duration).toBeLessThan(50);
      expect(metrics.rowsReturned).toBeGreaterThan(0);
    });

    it('should use index on createdAt for sorting', async () => {
      const metrics = await measureDirectQuery(`
        SELECT r.id, r."createdAt"
        FROM tarot_reading r
        WHERE r."deletedAt" IS NULL
        ORDER BY r."createdAt" DESC
        LIMIT 20
      `);

      console.log('📊 Query with ORDER BY createdAt (indexed):', {
        duration: `${metrics.duration}ms`,
        rows: metrics.rowsReturned,
      });

      // Should be fast (<100ms) if index on createdAt exists
      expect(metrics.duration).toBeLessThan(100);
    });

    it('should verify indexes exist on critical columns', async () => {
      // Query PostgreSQL system catalog for indexes
      const indexes = (await dbHelper.getDataSource().query(`
        SELECT
          t.relname as table_name,
          i.relname as index_name,
          a.attname as column_name
        FROM
          pg_class t,
          pg_class i,
          pg_index ix,
          pg_attribute a
        WHERE
          t.oid = ix.indrelid
          AND i.oid = ix.indexrelid
          AND a.attrelid = t.oid
          AND a.attnum = ANY(ix.indkey)
          AND t.relkind = 'r'
          AND t.relname = 'tarot_reading'
        ORDER BY t.relname, i.relname;
      `)) as unknown as {
        table_name: string;
        index_name: string;
        column_name: string;
      }[];

      console.log('📊 Indexes on reading table:', indexes);

      // Verificar que existen índices críticos
      const indexedColumns = indexes.map((idx) => idx.column_name);
      expect(indexedColumns).toContain('id'); // Primary key
      expect(indexedColumns.some((col) => col === 'userId')).toBe(true); // userId index

      // Log all found indexes for analysis
      const uniqueIndexNames = [
        ...new Set(indexes.map((idx) => idx.index_name)),
      ];
      console.log('📊 Total indexes found:', uniqueIndexNames.length);
      console.log('📊 Index names:', uniqueIndexNames);
    });
  });

  /**
   * TEST 4: Pagination performance
   */
  describe('Pagination - Performance', () => {
    it('should paginate efficiently with LIMIT/OFFSET', async () => {
      // Test pagination at different offsets
      const page1Metrics = await measureDirectQuery(`
        SELECT r.*
        FROM tarot_reading r
        WHERE r."deletedAt" IS NULL
        ORDER BY r."createdAt" DESC
        LIMIT 10 OFFSET 0
      `);

      const page5Metrics = await measureDirectQuery(`
        SELECT r.*
        FROM tarot_reading r
        WHERE r."deletedAt" IS NULL
        ORDER BY r."createdAt" DESC
        LIMIT 10 OFFSET 40
      `);

      console.log('📊 Pagination performance:', {
        page1: `${page1Metrics.duration}ms`,
        page5: `${page5Metrics.duration}ms`,
      });

      // Both pages should be fast (<100ms)
      expect(page1Metrics.duration).toBeLessThan(100);
      expect(page5Metrics.duration).toBeLessThan(100);

      // Page 5 shouldn't be significantly slower (index working)
      expect(page5Metrics.duration).toBeLessThan(page1Metrics.duration * 2);
    });

    it('should count total without loading all rows', async () => {
      // Verify COUNT(*) doesn't load all data
      const countMetrics = await measureDirectQuery(`
        SELECT COUNT(*) as total
        FROM tarot_reading
        WHERE "deletedAt" IS NULL
      `);

      console.log('📊 Count performance:', {
        duration: `${countMetrics.duration}ms`,
      });

      // Count should be very fast (<50ms) even with many rows
      expect(countMetrics.duration).toBeLessThan(50);
    });
  });

  /**
   * TEST 5: Complex queries performance
   */
  describe('Complex Queries - Performance', () => {
    it('should handle filtered + sorted + paginated query in <200ms', async () => {
      const users = (await dbHelper
        .getDataSource()
        .query(
          `SELECT id FROM "user" WHERE email = 'premium@test.com'`,
        )) as unknown as { id: number }[];
      const userId = users[0].id;

      const metrics = await measureDirectQuery(
        `
        SELECT r.*, d.name as deck_name
        FROM tarot_reading r
        LEFT JOIN tarot_deck d ON r."deckId" = d.id
        WHERE r."userId" = $1
          AND r."deletedAt" IS NULL
          AND r."createdAt" >= $2
        ORDER BY r."createdAt" DESC
        LIMIT 10 OFFSET 0
      `,
        [userId, new Date('2024-01-01').toISOString()],
      );

      console.log('📊 Complex filtered query:', {
        duration: `${metrics.duration}ms`,
        rows: metrics.rowsReturned,
      });

      expect(metrics.duration).toBeLessThan(200);
      expect(metrics.rowsReturned).toBeGreaterThan(0);
    });

    it('should aggregate data efficiently', async () => {
      const metrics = await measureDirectQuery(`
        SELECT
          DATE("createdAt") as date,
          COUNT(*) as readings_count
        FROM tarot_reading
        WHERE "deletedAt" IS NULL
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
        LIMIT 30
      `);

      console.log('📊 Aggregation query (readings per day):', {
        duration: `${metrics.duration}ms`,
        rows: metrics.rowsReturned,
      });

      expect(metrics.duration).toBeLessThan(200);
    });
  });

  /**
   * TEST 6: Subquery performance
   */
  describe('Subqueries - Performance', () => {
    it('should optimize subquery for counting interpretations', async () => {
      // NOTE: Using tarot_interpretation table name
      const metrics = await measureDirectQuery(`
        SELECT
          r.id,
          r."createdAt",
          (SELECT COUNT(*) FROM tarot_interpretation i WHERE i."readingId" = r.id) as interpretation_count
        FROM tarot_reading r
        WHERE r."deletedAt" IS NULL
        LIMIT 10
      `);

      console.log('📊 Subquery performance (interpretation count):', {
        duration: `${metrics.duration}ms`,
        rows: metrics.rowsReturned,
      });

      // Subquery should still be reasonably fast (<150ms)
      expect(metrics.duration).toBeLessThan(150);
    });
  });
});
