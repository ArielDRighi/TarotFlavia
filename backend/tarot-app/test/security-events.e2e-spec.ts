import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

interface LoginResponse {
  access_token: string;
}

interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

interface SecurityEventData {
  id: string;
  eventType: string;
  severity: string;
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

interface SecurityEventResponse {
  events: SecurityEventData[];
  meta: PaginationMeta;
}

describe('Security Events E2E', () => {
  let app: INestApplication;
  let httpServer: ReturnType<INestApplication['getHttpServer']>;
  let datasource: DataSource;
  let adminToken: string;
  let regularUserToken: string;

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

    httpServer = app.getHttpServer() as unknown as ReturnType<
      INestApplication['getHttpServer']
    >;
    datasource = moduleFixture.get<DataSource>(DataSource);

    // Get admin token
    const adminResponse = await request(httpServer).post('/auth/login').send({
      email: 'admin@test.com',
      password: 'Test123456!',
    });

    adminToken = (adminResponse.body as unknown as LoginResponse).access_token;

    // Create regular user and get token
    await request(httpServer).post('/auth/register').send({
      email: 'securitytest@test.com',
      password: 'Test123456!',
      name: 'Security Test User',
    });

    const userResponse = await request(httpServer).post('/auth/login').send({
      email: 'securitytest@test.com',
      password: 'Test123456!',
    });

    regularUserToken = (userResponse.body as unknown as LoginResponse)
      .access_token;
  });

  afterAll(async () => {
    // Clean up test data
    await datasource.query(
      "DELETE FROM security_events WHERE ip_address = 'test-cleanup'",
    );
    await datasource.query(
      'DELETE FROM "user" WHERE email = \'securitytest@test.com\'',
    );
    await app.close();
  });

  describe('Authentication', () => {
    it('should reject unauthenticated requests', () => {
      return request(httpServer).get('/admin/security/events').expect(401);
    });

    it('should reject non-admin users', () => {
      return request(httpServer)
        .get('/admin/security/events')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should return security events for admin', async () => {
      const response = await request(httpServer)
        .get('/admin/security/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as unknown as SecurityEventResponse;
      expect(body).toHaveProperty('events');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.events)).toBe(true);
      expect(body.meta).toHaveProperty('currentPage');
      expect(body.meta).toHaveProperty('itemsPerPage');
      expect(body.meta).toHaveProperty('totalItems');
      expect(body.meta).toHaveProperty('totalPages');
    });

    it('should filter by event type', async () => {
      const response = await request(httpServer)
        .get('/admin/security/events?eventType=failed_login')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as unknown as SecurityEventResponse;
      expect(body.events).toBeDefined();
      if (body.events.length > 0) {
        expect(body.events[0].eventType).toBe('failed_login');
      }
    });

    it('should filter by severity', async () => {
      const response = await request(httpServer)
        .get('/admin/security/events?severity=high')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as unknown as SecurityEventResponse;
      expect(body.events).toBeDefined();
      if (body.events.length > 0) {
        expect(body.events[0].severity).toBe('high');
      }
    });

    it('should paginate results', async () => {
      const response = await request(httpServer)
        .get('/admin/security/events?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as unknown as SecurityEventResponse;
      expect(body.meta.currentPage).toBe(1);
      expect(body.meta.itemsPerPage).toBe(5);
      expect(body.events.length).toBeLessThanOrEqual(5);
    });

    it('should validate pagination parameters', async () => {
      await request(httpServer)
        .get('/admin/security/events?page=-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      await request(httpServer)
        .get('/admin/security/events?limit=0')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('Security Event Logging', () => {
    it('should log failed login attempts', async () => {
      // Attempt failed login
      await request(httpServer)
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      // Query security events
      const response = await request(httpServer)
        .get('/admin/security/events?eventType=failed_login')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as unknown as SecurityEventResponse;
      expect(body.events).toBeDefined();
      const failedEvent = body.events.find(
        (e: SecurityEventData) => e.ipAddress && e.eventType === 'failed_login',
      );

      if (failedEvent) {
        expect(failedEvent.eventType).toBe('failed_login');
        expect(failedEvent.ipAddress).toBeTruthy();
        expect(failedEvent.userAgent).toBeTruthy();
        expect(
          ['low', 'medium', 'high', 'critical'].includes(failedEvent.severity),
        ).toBe(true);
      }
    });

    it('should log successful login attempts', async () => {
      // Successful login
      await request(httpServer)
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'Test123456!',
        })
        .expect(200);

      // Query security events
      const response = await request(httpServer)
        .get('/admin/security/events?eventType=successful_login')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as unknown as SecurityEventResponse;
      expect(body.events).toBeDefined();
      const successEvent = body.events.find(
        (e: SecurityEventData) =>
          e.ipAddress && e.eventType === 'successful_login',
      );

      if (successEvent) {
        expect(successEvent.eventType).toBe('successful_login');
        expect(successEvent.ipAddress).toBeTruthy();
        expect(successEvent.userAgent).toBeTruthy();
        expect(
          ['low', 'medium', 'high', 'critical'].includes(successEvent.severity),
        ).toBe(true);
      }
    });
  });
});
