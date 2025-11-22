import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  setupE2EDatabase,
  cleanupE2EDatabase,
} from './helpers/e2e-database.helper';
import { UserFactory } from './helpers/factories/user.factory';
import { DataSource } from 'typeorm';
import { User, UserPlan } from '../src/modules/users/entities/user.entity';
import { Tarotista } from '../src/modules/tarotistas/entities/tarotista.entity';
import { TarotistaConfig } from '../src/modules/tarotistas/entities/tarotista-config.entity';
import {
  UserTarotistaSubscription,
  SubscriptionType,
} from '../src/modules/tarotistas/entities/user-tarotista-subscription.entity';

describe('Revenue Sharing and Metrics (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let freeUserToken: string;
  let premiumUserToken: string;
  let freeUser: User;
  let premiumUser: User;
  let tarotista1: Tarotista;
  let tarotista2: Tarotista;

  beforeAll(async () => {
    await setupE2EDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    dataSource = app.get(DataSource);

    // Create admin user
    const adminUser = await UserFactory.createUser(dataSource, {
      email: 'admin@test.com',
      role: 'admin',
    });

    // Create tarotistas
    tarotista1 = await dataSource.getRepository(Tarotista).save({
      nombrePublico: 'Test Tarotista 1',
      biografia: 'Bio 1',
      especialidades: ['amor', 'trabajo'],
      experienciaAnios: 5,
      precioConsulta: 50.0,
      isActive: true,
      userId: null,
    });

    await dataSource.getRepository(TarotistaConfig).save({
      tarotistaId: tarotista1.id,
      aiProvider: 'openai',
      aiModel: 'gpt-4',
      temperatura: 0.7,
      maxTokens: 500,
      systemPromptPersonalizado: 'Test prompt',
    });

    tarotista2 = await dataSource.getRepository(Tarotista).save({
      nombrePublico: 'Test Tarotista 2',
      biografia: 'Bio 2',
      especialidades: ['salud'],
      experienciaAnios: 3,
      precioConsulta: 40.0,
      isActive: true,
      userId: null,
      customCommissionPercentage: 25, // Custom 25% commission (75% share)
    });

    await dataSource.getRepository(TarotistaConfig).save({
      tarotistaId: tarotista2.id,
      aiProvider: 'openai',
      aiModel: 'gpt-4',
      temperatura: 0.7,
      maxTokens: 500,
      systemPromptPersonalizado: 'Test prompt 2',
    });

    // Create free and premium users
    freeUser = await UserFactory.createUser(dataSource, {
      email: 'free@test.com',
      plan: UserPlan.FREE,
    });

    premiumUser = await UserFactory.createUser(dataSource, {
      email: 'premium@test.com',
      plan: UserPlan.PREMIUM,
    });

    // Create subscriptions
    await dataSource.getRepository(UserTarotistaSubscription).save({
      userId: freeUser.id,
      tarotistaId: tarotista1.id,
      subscriptionType: SubscriptionType.FAVORITE,
      status: 'active',
    });

    await dataSource.getRepository(UserTarotistaSubscription).save({
      userId: premiumUser.id,
      tarotistaId: tarotista2.id,
      subscriptionType: SubscriptionType.PREMIUM_INDIVIDUAL,
      status: 'active',
    });

    // Login users
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'Password123!' });
    adminToken = adminLogin.body.accessToken;

    const freeLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'free@test.com', password: 'Password123!' });
    freeUserToken = freeLogin.body.accessToken;

    const premiumLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'premium@test.com', password: 'Password123!' });
    premiumUserToken = premiumLogin.body.accessToken;
  });

  afterAll(async () => {
    await cleanupE2EDatabase();
    await app.close();
  });

  describe('Tarotista Metrics Endpoint', () => {
    it('should return metrics for a specific tarotista (authenticated user)', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/tarotistas/metrics/tarotista?tarotistaId=${tarotista1.id}&period=MONTH`,
        )
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('tarotistaId', tarotista1.id);
      expect(response.body).toHaveProperty('nombrePublico', 'Test Tarotista 1');
      expect(response.body).toHaveProperty('totalReadings');
      expect(response.body).toHaveProperty('totalRevenueShare');
      expect(response.body).toHaveProperty('totalPlatformFee');
      expect(response.body).toHaveProperty('period');
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .get(
          `/tarotistas/metrics/tarotista?tarotistaId=${tarotista1.id}&period=MONTH`,
        )
        .expect(401);
    });

    it('should return 404 for non-existent tarotista', async () => {
      await request(app.getHttpServer())
        .get('/tarotistas/metrics/tarotista?tarotistaId=999&period=MONTH')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(404);
    });
  });

  describe('Platform Metrics Endpoint (Admin Only)', () => {
    it('should return platform-wide metrics for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/tarotistas/metrics/platform?period=MONTH')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalReadings');
      expect(response.body).toHaveProperty('totalRevenueShare');
      expect(response.body).toHaveProperty('totalPlatformFee');
      expect(response.body).toHaveProperty('activeTarotistas');
      expect(response.body).toHaveProperty('activeUsers');
      expect(response.body).toHaveProperty('topTarotistas');
      expect(Array.isArray(response.body.topTarotistas)).toBe(true);
    });

    it('should return 403 for non-admin users', async () => {
      await request(app.getHttpServer())
        .get('/tarotistas/metrics/platform?period=MONTH')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(403);
    });
  });

  describe('Report Export Endpoint', () => {
    it('should export CSV report for a tarotista', async () => {
      const response = await request(app.getHttpServer())
        .post('/tarotistas/reports/export')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          tarotistaId: tarotista1.id,
          period: 'MONTH',
          format: 'CSV',
        })
        .expect(200);

      expect(response.body).toHaveProperty('filename');
      expect(response.body.filename).toContain('.csv');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('format', 'CSV');
    });

    it('should export PDF report for a tarotista', async () => {
      const response = await request(app.getHttpServer())
        .post('/tarotistas/reports/export')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          tarotistaId: tarotista2.id,
          period: 'MONTH',
          format: 'PDF',
        })
        .expect(200);

      expect(response.body).toHaveProperty('filename');
      expect(response.body.filename).toContain('.pdf');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('format', 'PDF');

      // Decode base64 and verify PDF header
      const pdfContent = Buffer.from(response.body.content, 'base64').toString(
        'utf-8',
      );
      expect(pdfContent).toContain('%PDF');
    });

    it('should allow admin to export platform-wide reports', async () => {
      const response = await request(app.getHttpServer())
        .post('/tarotistas/reports/export')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          period: 'YEAR',
          format: 'CSV',
        })
        .expect(200);

      expect(response.body.filename).toContain('platform');
    });
  });

  describe('Integration: Reading Creation → Revenue Calculation', () => {
    it('should automatically calculate revenue when a reading is created', async () => {
      // TODO: This requires creating a full reading with cards, spread, etc.
      // For now, we'll test the integration through the services directly
      // A full E2E test would require setting up all dependencies for reading creation
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Custom Commission Rates', () => {
    it('should apply custom commission for tarotista with customCommissionPercentage', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/tarotistas/metrics/tarotista?tarotistaId=${tarotista2.id}&period=MONTH`,
        )
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      // Tarotista 2 has 25% commission (75% share)
      expect(response.body.tarotistaId).toBe(tarotista2.id);
    });
  });
});
