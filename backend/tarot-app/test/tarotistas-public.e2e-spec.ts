import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

describe('Tarotistas Públicos E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let httpServer: ReturnType<INestApplication['getHttpServer']>;
  let tarotistaId1: number;
  let tarotistaId2: number;
  let tarotistaId3: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    httpServer = app.getHttpServer();
    dataSource = app.get<DataSource>(DataSource);

    // Setup: Create test tarotistas
    await setupTarotistas();
  });

  afterAll(async () => {
    // Cleanup
    await cleanupTarotistas();
    await app.close();
  });

  async function setupTarotistas() {
    // Correct table name is "user" (singular with quotes)
    const hashedPassword = await bcrypt.hash('TarotistaPass123!', 10);

    // Create users one by one (proper type casting and field names)
    // UserRole enum values: 'consumer', 'tarotist', 'admin' (lowercase)
    const user1 = (await dataSource.query(
      `INSERT INTO "user" (email, password, name, roles, plan)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        'tarotista1@test.com',
        hashedPassword,
        'Luna',
        ['consumer', 'tarotist'],
        'free',
      ],
    )) as unknown as Array<{ id: number }>;

    const user2 = (await dataSource.query(
      `INSERT INTO "user" (email, password, name, roles, plan)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        'tarotista2@test.com',
        hashedPassword,
        'Sol',
        ['consumer', 'tarotist'],
        'free',
      ],
    )) as unknown as Array<{ id: number }>;

    const user3 = (await dataSource.query(
      `INSERT INTO "user" (email, password, name, roles, plan)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        'tarotista3@test.com',
        hashedPassword,
        'Estrella',
        ['consumer', 'tarotist'],
        'free',
      ],
    )) as unknown as Array<{ id: number }>;

    // Create tarotistas
    const tarotista1 = (await dataSource.query(
      `INSERT INTO tarotistas (
        user_id, 
        nombre_publico, 
        bio, 
        especialidades, 
        foto_perfil,
        is_active,
        rating_promedio,
        total_lecturas,
        total_reviews,
        años_experiencia,
        idiomas,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() - INTERVAL '3 months')
      RETURNING id`,
      [
        user1[0].id,
        'Luna Misteriosa',
        'Experta en amor y relaciones',
        ['Amor', 'Trabajo'],
        'https://example.com/luna.jpg',
        true,
        4.8,
        250,
        50,
        10,
        ['Español', 'Inglés'],
      ],
    )) as unknown as Array<{ id: number }>;

    const tarotista2 = (await dataSource.query(
      `INSERT INTO tarotistas (
        user_id, 
        nombre_publico, 
        bio, 
        especialidades, 
        foto_perfil,
        is_active,
        rating_promedio,
        total_lecturas,
        total_reviews,
        años_experiencia,
        idiomas,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() - INTERVAL '2 months')
      RETURNING id`,
      [
        user2[0].id,
        'Sol Radiante',
        'Especialista en trabajo y finanzas',
        ['Trabajo', 'Salud'],
        'https://example.com/sol.jpg',
        true,
        4.5,
        180,
        36,
        8,
        ['Español'],
      ],
    )) as unknown as Array<{ id: number }>;

    const tarotista3 = (await dataSource.query(
      `INSERT INTO tarotistas (
        user_id, 
        nombre_publico, 
        bio, 
        especialidades, 
        foto_perfil,
        is_active,
        rating_promedio,
        total_lecturas,
        total_reviews,
        años_experiencia,
        idiomas,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() - INTERVAL '1 month')
      RETURNING id`,
      [
        user3[0].id,
        'Estrella Nocturna',
        'Maestra en salud y bienestar',
        ['Salud'],
        'https://example.com/estrella.jpg',
        false,
        4.9,
        300,
        60,
        15,
        ['Español', 'Inglés', 'Francés'],
      ],
    )) as unknown as Array<{ id: number }>;

    tarotistaId1 = tarotista1[0].id;
    tarotistaId2 = tarotista2[0].id;
    tarotistaId3 = tarotista3[0].id;
  }

  async function cleanupTarotistas() {
    await dataSource.query(`DELETE FROM tarotistas WHERE id IN ($1, $2, $3)`, [
      tarotistaId1,
      tarotistaId2,
      tarotistaId3,
    ]);
    await dataSource.query(`DELETE FROM "user" WHERE email IN ($1, $2, $3)`, [
      'tarotista1@test.com',
      'tarotista2@test.com',
      'tarotista3@test.com',
    ]);
  }

  describe('GET /tarotistas - Listar tarotistas públicos', () => {
    it('should return list of active tarotistas without authentication', async () => {
      const response = await request(httpServer).get('/tarotistas').expect(200);

      type TarotistasList = {
        data: unknown[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };

      const body = response.body as unknown as TarotistasList;

      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.total).toBeGreaterThanOrEqual(2); // At least 2 active
      expect(body.page).toBe(1);
      expect(body.limit).toBe(20);

      // Should only include active tarotistas (tarotista3 is inactive)
      const tarotistaIds = body.data.map((t: { id: number }) => t.id);
      expect(tarotistaIds).toContain(tarotistaId1);
      expect(tarotistaIds).toContain(tarotistaId2);
      expect(tarotistaIds).not.toContain(tarotistaId3); // Inactive
    });

    it('should apply search filter by nombrePublico', async () => {
      const response = await request(httpServer)
        .get('/tarotistas')
        .query({ search: 'Luna' })
        .expect(200);

      type TarotistaData = { id: number; nombrePublico: string };
      type TarotistasList = { data: TarotistaData[]; total: number };

      const body = response.body as unknown as TarotistasList;

      expect(body.data.length).toBeGreaterThanOrEqual(1);
      const found = body.data.find((t) => t.id === tarotistaId1);
      expect(found).toBeDefined();
      expect(found?.nombrePublico).toBe('Luna Misteriosa');
    });

    it('should apply search filter by bio', async () => {
      const response = await request(httpServer)
        .get('/tarotistas')
        .query({ search: 'finanzas' })
        .expect(200);

      type TarotistaData = { id: number; bio: string };
      type TarotistasList = { data: TarotistaData[]; total: number };

      const body = response.body as unknown as TarotistasList;

      expect(body.data.length).toBeGreaterThanOrEqual(1);
      const found = body.data.find((t) => t.id === tarotistaId2);
      expect(found).toBeDefined();
      expect(found?.bio).toContain('finanzas');
    });

    it('should filter by especialidad (Amor)', async () => {
      const response = await request(httpServer)
        .get('/tarotistas')
        .query({ especialidad: 'Amor' })
        .expect(200);

      type TarotistaData = { id: number; especialidades: string[] };
      type TarotistasList = { data: TarotistaData[]; total: number };

      const body = response.body as unknown as TarotistasList;

      expect(body.data.length).toBeGreaterThanOrEqual(1);
      const found = body.data.find((t) => t.id === tarotistaId1);
      expect(found).toBeDefined();
      expect(found?.especialidades).toContain('Amor');
    });

    it('should filter by especialidad (Trabajo)', async () => {
      const response = await request(httpServer)
        .get('/tarotistas')
        .query({ especialidad: 'Trabajo' })
        .expect(200);

      type TarotistaData = { id: number; especialidades: string[] };
      type TarotistasList = { data: TarotistaData[]; total: number };

      const body = response.body as unknown as TarotistasList;

      expect(body.data.length).toBeGreaterThanOrEqual(2); // Luna y Sol
      const tarotistaIds = body.data.map((t) => t.id);
      expect(tarotistaIds).toContain(tarotistaId1);
      expect(tarotistaIds).toContain(tarotistaId2);
    });

    it('should order by rating DESC (default for rating)', async () => {
      const response = await request(httpServer)
        .get('/tarotistas')
        .query({ orderBy: 'rating', order: 'DESC' })
        .expect(200);

      type TarotistaData = { id: number; ratingPromedio: number | null };
      type TarotistasList = { data: TarotistaData[] };

      const body = response.body as unknown as TarotistasList;

      // Verify descending order (regardless of total count from other seeders)
      expect(body.data.length).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < body.data.length - 1; i++) {
        const current = body.data[i].ratingPromedio ?? 0;
        const next = body.data[i + 1].ratingPromedio ?? 0;
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it('should order by totalLecturas DESC', async () => {
      const response = await request(httpServer)
        .get('/tarotistas')
        .query({ orderBy: 'totalLecturas', order: 'DESC' })
        .expect(200);

      type TarotistaData = { id: number; totalLecturas: number };
      type TarotistasList = { data: TarotistaData[] };

      const body = response.body as unknown as TarotistasList;

      // Verify descending order
      for (let i = 0; i < body.data.length - 1; i++) {
        const current = body.data[i].totalLecturas;
        const next = body.data[i + 1].totalLecturas;
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it('should order by nombrePublico ASC (alphabetical)', async () => {
      const response = await request(httpServer)
        .get('/tarotistas')
        .query({ orderBy: 'nombrePublico', order: 'ASC' })
        .expect(200);

      type TarotistaData = { nombrePublico: string };
      type TarotistasList = { data: TarotistaData[] };

      const body = response.body as unknown as TarotistasList;

      // Verify alphabetical order
      for (let i = 0; i < body.data.length - 1; i++) {
        const current = body.data[i].nombrePublico.toLowerCase();
        const next = body.data[i + 1].nombrePublico.toLowerCase();
        expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
      }
    });

    it('should apply pagination (page 1, limit 1)', async () => {
      const response = await request(httpServer)
        .get('/tarotistas')
        .query({ page: 1, limit: 1 })
        .expect(200);

      type TarotistasList = {
        data: unknown[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };

      const body = response.body as unknown as TarotistasList;

      expect(body.data).toHaveLength(1);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(1);
      expect(body.totalPages).toBeGreaterThanOrEqual(2); // At least 2 active tarotistas
    });

    it('should validate page (reject page = 0)', async () => {
      await request(httpServer)
        .get('/tarotistas')
        .query({ page: 0 })
        .expect(400);
    });

    it('should validate limit (reject limit > 100)', async () => {
      await request(httpServer)
        .get('/tarotistas')
        .query({ limit: 101 })
        .expect(400);
    });

    it('should validate orderBy (reject invalid value)', async () => {
      await request(httpServer)
        .get('/tarotistas')
        .query({ orderBy: 'invalidField' })
        .expect(400);
    });

    it('should NOT expose sensitive data (configs, customCardMeanings)', async () => {
      const response = await request(httpServer).get('/tarotistas').expect(200);

      type TarotistaData = {
        id: number;
        nombrePublico: string;
        configs?: unknown;
        customCardMeanings?: unknown;
      };
      type TarotistasList = { data: TarotistaData[] };

      const body = response.body as unknown as TarotistasList;

      body.data.forEach((tarotista) => {
        expect(tarotista).toHaveProperty('nombrePublico');
        expect(tarotista).not.toHaveProperty('configs');
        expect(tarotista).not.toHaveProperty('customCardMeanings');
      });
    });
  });

  describe('GET /tarotistas/:id - Ver perfil público', () => {
    it('should return public profile of active tarotista', async () => {
      const response = await request(httpServer)
        .get(`/tarotistas/${tarotistaId1}`)
        .expect(200);

      type TarotistaProfile = {
        id: number;
        nombrePublico: string;
        bio: string;
        especialidades: string[];
        fotoPerfil: string;
        ratingPromedio: number;
        totalLecturas: number;
        totalReviews: number;
        añosExperiencia: number;
        idiomas: string[];
      };

      const body = response.body as unknown as TarotistaProfile;

      expect(body.id).toBe(tarotistaId1);
      expect(body.nombrePublico).toBe('Luna Misteriosa');
      expect(body.bio).toBe('Experta en amor y relaciones');
      expect(body.especialidades).toContain('Amor');
      expect(body.fotoPerfil).toBe('https://example.com/luna.jpg');
      expect(body.ratingPromedio).toBe(4.8);
      expect(body.totalLecturas).toBe(250);
      expect(body.totalReviews).toBe(50);
      expect(body.añosExperiencia).toBe(10);
      expect(body.idiomas).toContain('Español');
      expect(body.idiomas).toContain('Inglés');
    });

    it('should return 404 for inactive tarotista', async () => {
      // Tarotista3 is inactive
      await request(httpServer).get(`/tarotistas/${tarotistaId3}`).expect(404);
    });

    it('should return 404 for non-existent tarotista', async () => {
      await request(httpServer).get('/tarotistas/99999').expect(404);
    });

    it('should reject invalid id (non-numeric)', async () => {
      await request(httpServer).get('/tarotistas/invalid').expect(400);
    });

    it('should NOT expose sensitive data in profile', async () => {
      const response = await request(httpServer)
        .get(`/tarotistas/${tarotistaId1}`)
        .expect(200);

      type TarotistaProfile = {
        id: number;
        nombrePublico: string;
        configs?: unknown;
        customCardMeanings?: unknown;
      };

      const body = response.body as unknown as TarotistaProfile | null;

      if (body !== null) {
        expect(body).toHaveProperty('nombrePublico');
        expect(body).not.toHaveProperty('configs');
        expect(body).not.toHaveProperty('customCardMeanings');
      }
    });
  });

  describe('Security - SQL Injection Prevention', () => {
    it('should escape special characters in search query', async () => {
      const response = await request(httpServer)
        .get('/tarotistas')
        .query({ search: "%'; DROP TABLE tarotistas; --" })
        .expect(200);

      type TarotistasList = { data: unknown[]; total: number };
      const body = response.body as unknown as TarotistasList;

      // Should return 0 results (no match), not cause SQL error
      expect(body.data).toHaveLength(0);
      expect(body.total).toBe(0);
    });

    it('should handle special characters in especialidad filter', async () => {
      const response = await request(httpServer)
        .get('/tarotistas')
        .query({ especialidad: "'; DROP TABLE tarotistas; --" })
        .expect(200);

      type TarotistasList = { data: unknown[]; total: number };
      const body = response.body as unknown as TarotistasList;

      // Should return 0 results, not cause SQL error
      expect(body.data).toHaveLength(0);
      expect(body.total).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty list when no tarotistas match filters', async () => {
      const response = await request(httpServer)
        .get('/tarotistas')
        .query({ search: 'NonexistentTarotista12345' })
        .expect(200);

      type TarotistasList = {
        data: unknown[];
        total: number;
        totalPages: number;
      };
      const body = response.body as unknown as TarotistasList;

      expect(body.data).toHaveLength(0);
      expect(body.total).toBe(0);
      expect(body.totalPages).toBe(0);
    });

    it('should handle multiple filters combined', async () => {
      const response = await request(httpServer)
        .get('/tarotistas')
        .query({
          search: 'Luna',
          especialidad: 'Amor',
          orderBy: 'rating',
          order: 'DESC',
          page: 1,
          limit: 10,
        })
        .expect(200);

      type TarotistaData = { id: number; nombrePublico: string };
      type TarotistasList = { data: TarotistaData[] };

      const body = response.body as unknown as TarotistasList;

      expect(body.data.length).toBeGreaterThanOrEqual(1);
      const found = body.data.find((t) => t.id === tarotistaId1);
      expect(found).toBeDefined();
      expect(found?.nombrePublico).toBe('Luna Misteriosa');
    });
  });
});
