import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

/**
 * E2E Tests for IP Whitelist Admin Controller
 *
 * Tests the admin endpoints for managing IP whitelist:
 * - GET /admin/ip-whitelist - List whitelisted IPs
 * - POST /admin/ip-whitelist - Add IP to whitelist
 * - DELETE /admin/ip-whitelist - Remove IP from whitelist
 *
 * @module IPWhitelistAdminE2E
 */
describe('IP Whitelist Admin (e2e)', () => {
  let app: INestApplication;
  let dbHelper: E2EDatabaseHelper;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dbHelper = new E2EDatabaseHelper();
    await dbHelper.initialize();

    // Login as admin
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'Test123456!' });
    adminToken = adminLogin.body.access_token;

    // Login as regular user
    const userLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'free@test.com', password: 'Test123456!' });
    userToken = userLogin.body.access_token;
  });

  afterAll(async () => {
    await dbHelper.close();
    await app.close();
  });

  describe('GET /admin/ip-whitelist', () => {
    it('should return whitelist when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('ips');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.ips)).toBe(true);
      expect(typeof response.body.count).toBe('number');
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/ip-whitelist')
        .expect(401);
    });

    it('should return count matching ips array length', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.count).toBe(response.body.ips.length);
    });
  });

  describe('POST /admin/ip-whitelist', () => {
    const testIP = '192.168.100.100';

    afterEach(async () => {
      // Clean up: try to remove the test IP
      await request(app.getHttpServer())
        .delete('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ip: testIP });
    });

    it('should add IP to whitelist when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ip: testIP })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('ip', testIP);
      expect(response.body.message).toContain(testIP);
    });

    it('should include added IP in whitelist', async () => {
      // Add IP
      await request(app.getHttpServer())
        .post('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ip: testIP })
        .expect(201);

      // Verify it's in the list
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.ips).toContain(testIP);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ip: testIP })
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/ip-whitelist')
        .send({ ip: testIP })
        .expect(401);
    });

    it('should return 400 for invalid IP format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ip: 'not-an-ip' })
        .expect(400);
    });

    it('should return 400 for empty IP', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ip: '' })
        .expect(400);
    });

    it('should accept valid IPv6 address', async () => {
      const ipv6 = '2001:db8::1';

      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ip: ipv6 })
        .expect(201);

      expect(response.body.ip).toBe(ipv6);

      // Cleanup
      await request(app.getHttpServer())
        .delete('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ip: ipv6 });
    });
  });

  describe('DELETE /admin/ip-whitelist', () => {
    const testIP = '192.168.200.200';

    beforeEach(async () => {
      // Add a test IP to delete
      await request(app.getHttpServer())
        .post('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ip: testIP });
    });

    it('should remove IP from whitelist when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ip: testIP })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('ip', testIP);
      expect(response.body.message).toContain(testIP);
    });

    it('should not include removed IP in whitelist', async () => {
      // Remove IP
      await request(app.getHttpServer())
        .delete('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ip: testIP })
        .expect(200);

      // Verify it's not in the list
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.ips).not.toContain(testIP);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ip: testIP })
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/admin/ip-whitelist')
        .send({ ip: testIP })
        .expect(401);
    });

    it('should return 400 when IP is not provided', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });

    it('should handle removal of non-existent IP gracefully', async () => {
      const nonExistentIP = '10.255.255.255';

      // Should not throw error for non-existent IP
      await request(app.getHttpServer())
        .delete('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ip: nonExistentIP })
        .expect(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple IPs added sequentially', async () => {
      const testIPs = ['10.0.0.1', '10.0.0.2', '10.0.0.3'];

      // Add all IPs
      for (const ip of testIPs) {
        await request(app.getHttpServer())
          .post('/api/v1/admin/ip-whitelist')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ip })
          .expect(201);
      }

      // Verify all are in the list
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      for (const ip of testIPs) {
        expect(response.body.ips).toContain(ip);
      }

      // Cleanup
      for (const ip of testIPs) {
        await request(app.getHttpServer())
          .delete('/api/v1/admin/ip-whitelist')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ip });
      }
    });

    it('should handle localhost IP', async () => {
      const localhost = '127.0.0.1';

      // Localhost should typically be whitelisted by default
      // Just verify the endpoint handles it properly
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/ip-whitelist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ip: localhost })
        .expect(201);

      expect(response.body.ip).toBe(localhost);
    });
  });
});
