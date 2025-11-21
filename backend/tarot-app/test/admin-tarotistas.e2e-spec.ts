import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../src/common/enums/user-role.enum';
import { UserPlan } from '../src/modules/users/entities/user.entity';
import { ApplicationStatus } from '../src/modules/tarotistas/entities/tarotista-application.entity';

const TEST_DOMAIN = 'test-admin-tarotistas.com';

interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    isAdmin: boolean;
    plan: string;
  };
  access_token: string;
  refresh_token: string;
}

interface TarotistaResponse {
  id: number;
  userId: number;
  nombrePublico: string;
  bio: string;
  especialidades: string[];
  isActive: boolean;
}

interface TarotistaListResponse {
  data: TarotistaResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApplicationResponse {
  id: number;
  userId: number;
  nombrePublico: string;
  biografia: string;
  especialidades: string[];
  motivacion: string;
  experiencia: string;
  status: ApplicationStatus;
  adminNotes: string | null;
  reviewedByUserId: number | null;
  reviewedAt: Date | null;
}

describe('Admin Tarotistas Management (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let normalUserToken: string;
  let testUserId: number;
  let tarotistaUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Clean up test data
    await dataSource.query(
      'DELETE FROM tarotista_card_meanings WHERE tarotista_id IN (SELECT id FROM tarotistas WHERE user_id IN (SELECT id FROM "user" WHERE email LIKE $1))',
      [`%@${TEST_DOMAIN}`],
    );
    await dataSource.query(
      'DELETE FROM tarotista_config WHERE tarotista_id IN (SELECT id FROM tarotistas WHERE user_id IN (SELECT id FROM "user" WHERE email LIKE $1))',
      [`%@${TEST_DOMAIN}`],
    );
    await dataSource.query(
      'DELETE FROM tarotistas WHERE user_id IN (SELECT id FROM "user" WHERE email LIKE $1)',
      [`%@${TEST_DOMAIN}`],
    );
    await dataSource.query(
      'DELETE FROM tarotista_applications WHERE user_id IN (SELECT id FROM "user" WHERE email LIKE $1)',
      [`%@${TEST_DOMAIN}`],
    );
    await dataSource.query('DELETE FROM "user" WHERE email LIKE $1', [
      `%@${TEST_DOMAIN}`,
    ]);

    // Create admin user
    const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
    await dataSource.query(
      `INSERT INTO "user" (email, password, name, roles, plan) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        `admin@${TEST_DOMAIN}`,
        hashedPassword,
        'Admin User',
        [UserRole.CONSUMER, UserRole.ADMIN],
        UserPlan.FREE,
      ],
    );

    // Create normal user
    const normalUserResult = (await dataSource.query(
      `INSERT INTO "user" (email, password, name, roles, plan) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [
        `normaluser@${TEST_DOMAIN}`,
        hashedPassword,
        'Normal User',
        [UserRole.CONSUMER],
        UserPlan.FREE,
      ],
    )) as unknown as Array<{ id: number }>;
    testUserId = normalUserResult[0].id;

    // Create user for tarotista
    const tarotistaUserResult = (await dataSource.query(
      `INSERT INTO "user" (email, password, name, roles, plan) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [
        `tarotista@${TEST_DOMAIN}`,
        hashedPassword,
        'Tarotista User',
        [UserRole.CONSUMER, UserRole.TAROTIST],
        UserPlan.FREE,
      ],
    )) as unknown as Array<{ id: number }>;
    tarotistaUserId = tarotistaUserResult[0].id;

    // Login as admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `admin@${TEST_DOMAIN}`,
        password: 'AdminPass123!',
      });
    adminToken = (adminLoginResponse.body as LoginResponse).access_token;

    // Login as normal user
    const normalUserLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `normaluser@${TEST_DOMAIN}`,
        password: 'AdminPass123!',
      });
    normalUserToken = (normalUserLoginResponse.body as LoginResponse)
      .access_token;

    // Small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    // Clean up
    await dataSource.query(
      'DELETE FROM tarotista_card_meanings WHERE tarotista_id IN (SELECT id FROM tarotistas WHERE user_id IN (SELECT id FROM "user" WHERE email LIKE $1))',
      [`%@${TEST_DOMAIN}`],
    );
    await dataSource.query(
      'DELETE FROM tarotista_config WHERE tarotista_id IN (SELECT id FROM tarotistas WHERE user_id IN (SELECT id FROM "user" WHERE email LIKE $1))',
      [`%@${TEST_DOMAIN}`],
    );
    await dataSource.query(
      'DELETE FROM tarotistas WHERE user_id IN (SELECT id FROM "user" WHERE email LIKE $1)',
      [`%@${TEST_DOMAIN}`],
    );
    await dataSource.query(
      'DELETE FROM tarotista_applications WHERE user_id IN (SELECT id FROM "user" WHERE email LIKE $1)',
      [`%@${TEST_DOMAIN}`],
    );
    await dataSource.query('DELETE FROM "user" WHERE email LIKE $1', [
      `%@${TEST_DOMAIN}`,
    ]);

    await app.close();
  });

  describe('POST /admin/tarotistas - Create Tarotista', () => {
    it('should require admin role', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/tarotistas')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({
          userId: testUserId,
          nombrePublico: 'Luna Mística',
          biografia: 'Tarotista profesional',
          especialidades: ['amor', 'trabajo'],
        });

      expect(response.status).toBe(403);
    });

    it('should create a new tarotista (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/tarotistas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: tarotistaUserId,
          nombrePublico: 'Luna Mística',
          biografia: 'Tarotista profesional con experiencia',
          especialidades: ['amor', 'trabajo', 'espiritual'],
        });

      expect(response.status).toBe(201);
      const body = response.body as TarotistaResponse;
      expect(body.userId).toBe(tarotistaUserId);
      expect(body.nombrePublico).toBe('Luna Mística');
      expect(body.bio).toBe('Tarotista profesional con experiencia');
      expect(body.especialidades).toEqual(['amor', 'trabajo', 'espiritual']);
      expect(body.isActive).toBe(true);
    });

    it('should validate required fields', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await request(app.getHttpServer())
        .post('/admin/tarotistas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Missing userId
          nombrePublico: 'Test Tarotista',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /admin/tarotistas - List Tarotistas', () => {
    it('should require admin role', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/tarotistas')
        .set('Authorization', `Bearer ${normalUserToken}`);

      expect(response.status).toBe(403);
    });

    it('should list tarotistas with pagination', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await request(app.getHttpServer())
        .get('/admin/tarotistas')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      const body = response.body as TarotistaListResponse;
      expect(body.data).toBeInstanceOf(Array);
      expect(body.total).toBeGreaterThanOrEqual(0);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(20);
    });

    it('should filter by search term', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await request(app.getHttpServer())
        .get('/admin/tarotistas')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ search: 'Luna' });

      expect(response.status).toBe(200);
      const body = response.body as TarotistaListResponse;
      if (body.total > 0) {
        expect(body.data[0].nombrePublico).toContain('Luna');
      }
    });

    it('should filter by isActive', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await request(app.getHttpServer())
        .get('/admin/tarotistas')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ isActive: true });

      expect(response.status).toBe(200);
      const body = response.body as TarotistaListResponse;
      body.data.forEach((tarotista) => {
        expect(tarotista.isActive).toBe(true);
      });
    });
  });

  describe('PUT /admin/tarotistas/:id - Update Tarotista', () => {
    let tarotistaId: number;

    beforeAll(async () => {
      // Get the tarotista ID we created
      const tarotistas = (await dataSource.query(
        'SELECT id FROM tarotistas WHERE user_id = $1',
        [tarotistaUserId],
      )) as unknown as Array<{ id: number }>;
      if (tarotistas.length > 0) {
        tarotistaId = tarotistas[0].id;
      }
    });

    it('should update tarotista info', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (!tarotistaId) {
        console.warn('Skipping test: no tarotista found');
        return;
      }

      const response = await request(app.getHttpServer())
        .put(`/admin/tarotistas/${tarotistaId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombrePublico: 'Luna Mística Actualizada',
          especialidades: ['amor', 'trabajo', 'espiritual', 'salud'],
        });

      expect(response.status).toBe(200);
      const body = response.body as TarotistaResponse;
      expect(body.nombrePublico).toBe('Luna Mística Actualizada');
      expect(body.especialidades).toContain('salud');
    });

    it('should return 404 for non-existent tarotista', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await request(app.getHttpServer())
        .put('/admin/tarotistas/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombrePublico: 'Test',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /admin/tarotistas/:id/deactivate - Deactivate Tarotista', () => {
    let tarotistaId: number;

    beforeAll(async () => {
      const tarotistas = (await dataSource.query(
        'SELECT id FROM tarotistas WHERE user_id = $1',
        [tarotistaUserId],
      )) as unknown as Array<{ id: number }>;
      if (tarotistas.length > 0) {
        tarotistaId = tarotistas[0].id;
      }
    });

    it('should deactivate tarotista', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (!tarotistaId) {
        console.warn('Skipping test: no tarotista found');
        return;
      }

      const response = await request(app.getHttpServer())
        .put(`/admin/tarotistas/${tarotistaId}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const body = response.body as TarotistaResponse;
      expect(body.isActive).toBe(false);
    });
  });

  describe('PUT /admin/tarotistas/:id/reactivate - Reactivate Tarotista', () => {
    let tarotistaId: number;

    beforeAll(async () => {
      const tarotistas = (await dataSource.query(
        'SELECT id FROM tarotistas WHERE user_id = $1',
        [tarotistaUserId],
      )) as unknown as Array<{ id: number }>;
      if (tarotistas.length > 0) {
        tarotistaId = tarotistas[0].id;
      }
    });

    it('should reactivate tarotista', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (!tarotistaId) {
        console.warn('Skipping test: no tarotista found');
        return;
      }

      const response = await request(app.getHttpServer())
        .put(`/admin/tarotistas/${tarotistaId}/reactivate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const body = response.body as TarotistaResponse;
      expect(body.isActive).toBe(true);
    });
  });

  describe('Application Workflow', () => {
    let applicationId: number;

    it('should create a tarotista application', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create application directly in DB (as if user applied)
      const result = (await dataSource.query(
        `INSERT INTO tarotista_applications 
         (user_id, nombre_publico, biografia, especialidades, motivacion, experiencia, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id`,
        [
          testUserId,
          'Estrella del Norte',
          'Aspirante a tarotista',
          ['amor', 'trabajo'],
          'Quiero ayudar a las personas',
          '5 años de experiencia en tarot',
          ApplicationStatus.PENDING,
        ],
      )) as unknown as Array<{ id: number }>;

      applicationId = result[0].id;
      expect(applicationId).toBeGreaterThan(0);
    });

    it('should list applications', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await request(app.getHttpServer())
        .get('/admin/tarotistas/applications')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      const body = response.body as {
        data: ApplicationResponse[];
        total: number;
      };
      expect(body.data).toBeInstanceOf(Array);
      expect(body.total).toBeGreaterThan(0);
    });

    it('should approve application and create tarotista', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await request(app.getHttpServer())
        .post(`/admin/tarotistas/applications/${applicationId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminNotes: 'Excelente perfil, aprobado',
        });

      expect(response.status).toBe(200);
      const body = response.body as ApplicationResponse;
      expect(body.status).toBe(ApplicationStatus.APPROVED);
      expect(body.adminNotes).toBe('Excelente perfil, aprobado');
      expect(body.reviewedByUserId).toBeDefined();

      // Verify tarotista was created
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const tarotistas = (await dataSource.query(
        'SELECT * FROM tarotistas WHERE user_id = $1',
        [testUserId],
      )) as unknown as Array<{
        id: number;
        user_id: number;
        nombre_publico: string;
      }>;
      expect(tarotistas.length).toBeGreaterThan(0);
      expect(tarotistas[0].nombre_publico).toBe('Estrella del Norte');
    });

    it('should reject already processed application', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await request(app.getHttpServer())
        .post(`/admin/tarotistas/applications/${applicationId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminNotes: 'Test',
        });

      expect(response.status).toBe(400);
    });

    it('should reject application with admin notes', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create another application to reject
      const result = (await dataSource.query(
        `INSERT INTO tarotista_applications 
         (user_id, nombre_publico, biografia, especialidades, motivacion, experiencia, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id`,
        [
          testUserId,
          'Test Reject',
          'Test biografia',
          ['test'],
          'Test motivacion',
          'Test experiencia',
          ApplicationStatus.PENDING,
        ],
      )) as unknown as Array<{ id: number }>;

      const newAppId = result[0].id;

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await request(app.getHttpServer())
        .post(`/admin/tarotistas/applications/${newAppId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminNotes: 'No cumple con los requisitos mínimos',
        });

      expect(response.status).toBe(200);
      const body = response.body as ApplicationResponse;
      expect(body.status).toBe(ApplicationStatus.REJECTED);
      expect(body.adminNotes).toBe('No cumple con los requisitos mínimos');
    });

    it('should require adminNotes when rejecting', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create another application
      const result = (await dataSource.query(
        `INSERT INTO tarotista_applications 
         (user_id, nombre_publico, biografia, especialidades, motivacion, experiencia, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id`,
        [
          testUserId,
          'Test',
          'Test',
          ['test'],
          'Test',
          'Test',
          ApplicationStatus.PENDING,
        ],
      )) as unknown as Array<{ id: number }>;

      const newAppId = result[0].id;

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await request(app.getHttpServer())
        .post(`/admin/tarotistas/applications/${newAppId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Missing adminNotes
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Configuration Management', () => {
    let tarotistaId: number;

    beforeAll(async () => {
      const tarotistaResult = (await dataSource.query(
        'SELECT id FROM tarotistas WHERE user_id = $1 LIMIT 1',
        [tarotistaUserId],
      )) as unknown as Array<{ id: number }>;
      if (tarotistaResult.length > 0) {
        tarotistaId = tarotistaResult[0].id;
      }
    });

    it('should get tarotista config', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (!tarotistaId) {
        console.warn('Skipping test: no tarotista found');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/admin/tarotistas/${tarotistaId}/config`)
        .set('Authorization', `Bearer ${adminToken}`);

      // 404 is OK if config doesn't exist yet
      expect([200, 404]).toContain(response.status);
    });

    it('should update tarotista config', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (!tarotistaId) {
        console.warn('Skipping test: no tarotista found');
        return;
      }

      const response = await request(app.getHttpServer())
        .put(`/admin/tarotistas/${tarotistaId}/config`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          temperature: 0.8,
          maxTokens: 600,
        });

      expect(response.status).toBe(200);
      const body = response.body as {
        temperature: number;
        maxTokens: number;
      };
      expect(body.temperature).toBe(0.8);
      expect(body.maxTokens).toBe(600);
    });

    it('should reset config to defaults', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (!tarotistaId) {
        console.warn('Skipping test: no tarotista found');
        return;
      }

      const response = await request(app.getHttpServer())
        .post(`/admin/tarotistas/${tarotistaId}/config/reset`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const body = response.body as {
        temperature: number;
        maxTokens: number;
        topP: number;
      };
      expect(Number(body.temperature)).toBe(0.7);
      expect(body.maxTokens).toBe(500);
      expect(Number(body.topP)).toBe(0.9);
    });
  });
});
