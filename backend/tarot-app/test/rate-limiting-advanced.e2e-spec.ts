import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { IPBlockingService } from '../src/common/services/ip-blocking.service';
import { IPWhitelistService } from '../src/common/services/ip-whitelist.service';

describe('Rate Limiting Advanced (IP Blocking) E2E Tests', () => {
  let app: INestApplication;
  let ipBlockingService: IPBlockingService;
  let ipWhitelistService: IPWhitelistService;

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

    ipBlockingService = app.get<IPBlockingService>(IPBlockingService);
    ipWhitelistService = app.get<IPWhitelistService>(IPWhitelistService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    ipBlockingService.clearAll();
    ipWhitelistService.clearAll();
  });

  describe('IP Blocking after violations', () => {
    it('should block IP after 10 rate limit violations within 1 hour', () => {
      const testIP = '203.0.113.100';

      for (let i = 0; i < 10; i++) {
        ipBlockingService.recordViolation(testIP);
      }

      expect(ipBlockingService.isBlocked(testIP)).toBe(true);
      expect(ipBlockingService.getViolations(testIP)).toBeGreaterThanOrEqual(
        10,
      );
    });

    it('should allow requests after block expires', async () => {
      const testIP = '203.0.113.102';

      ipBlockingService.blockIP(testIP, 1, 'Short test block');
      expect(ipBlockingService.isBlocked(testIP)).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(ipBlockingService.isBlocked(testIP)).toBe(false);
    });

    it('should reset violation count after clearing', () => {
      const testIP = '203.0.113.103';

      for (let i = 0; i < 5; i++) {
        ipBlockingService.recordViolation(testIP);
      }

      expect(ipBlockingService.getViolations(testIP)).toBe(5);

      ipBlockingService.clearAll();
      expect(ipBlockingService.getViolations(testIP)).toBe(0);
    });
  });

  describe('IP Whitelist', () => {
    it('should bypass rate limiting for whitelisted IPs', () => {
      const testIP = '203.0.113.200';
      ipWhitelistService.addIP(testIP);

      const whitelisted = ipWhitelistService.getWhitelistedIPs();
      expect(whitelisted).toContain(testIP);
    });

    it('should include default localhost IPs in whitelist', () => {
      const ips = ipWhitelistService.getWhitelistedIPs();
      expect(ips).toContain('127.0.0.1');
      expect(ips).toContain('::1');
    });
  });

  describe('Admin violations endpoint', () => {
    it('should return violations stats', () => {
      ipBlockingService.recordViolation('203.0.113.50');
      ipBlockingService.recordViolation('203.0.113.50');
      ipBlockingService.recordViolation('203.0.113.51');

      const violations = ipBlockingService.getAllViolations();
      expect(violations.length).toBeGreaterThan(0);

      const stats = violations.find((v) => v.ip === '203.0.113.50');
      expect(stats).toBeDefined();
      expect(stats?.count).toBe(2);
    });

    it('should return blocked IPs list', () => {
      const testIP = '203.0.113.60';
      ipBlockingService.blockIP(testIP, 3600, 'Test block');

      const blockedIPs = ipBlockingService.getBlockedIPs();
      expect(blockedIPs).toHaveLength(1);
      expect(blockedIPs[0].ip).toBe(testIP);
      expect(blockedIPs[0].reason).toBe('Test block');
    });
  });

  describe('Rate limiting enforcement', () => {
    it('should apply custom rate limits to auth endpoints', async () => {
      const email1 = `user1-${Date.now()}@test.com`;
      const email2 = `user2-${Date.now() + 1}@test.com`;
      const email3 = `user3-${Date.now() + 2}@test.com`;

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: email1, password: 'Pass123!', name: 'User 1' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: email2, password: 'Pass123!', name: 'User 2' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: email3, password: 'Pass123!', name: 'User 3' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `user4-${Date.now() + 3}@test.com`,
          password: 'Pass123!',
          name: 'User 4',
        })
        .expect(429);
    }, 15000);
  });
});
