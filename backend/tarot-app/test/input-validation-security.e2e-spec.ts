import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

describe('Input Validation and Security (E2E)', () => {
  let app: INestApplication;
  let dbHelper: E2EDatabaseHelper;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configure ValidationPipe with security settings
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
    await dbHelper.cleanDatabase();
  });

  afterAll(async () => {
    await dbHelper.cleanDatabase();
    await app.close();
  });

  beforeEach(async () => {
    await dbHelper.cleanDatabase();
  });

  describe('SQL Injection Protection', () => {
    it('should reject SQL injection in email field', async () => {
      const response = await request(app.getHttpServer() as never)
        .post('/auth/login')
        .send({
          email: "admin'--",
          password: 'password',
        })
        .expect(400);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBeDefined();
    });
  });

  describe('XSS Protection', () => {
    it('should sanitize HTML script tags in name field', async () => {
      const response = await request(app.getHttpServer() as never)
        .post('/auth/register')
        .send({
          email: 'xss@example.com',
          password: 'password123',
          name: '<script>alert("XSS")</script>',
        })
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const userName = response.body.user?.name as string;
      expect(userName).not.toContain('<script>');
      expect(userName).not.toContain('alert');
    });
  });

  describe('Input Validation - String Length', () => {
    it('should reject excessively long strings', async () => {
      const longString = 'a'.repeat(1001);
      const response = await request(app.getHttpServer() as never)
        .post('/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'password123',
          name: longString,
        })
        .expect(400);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Input Validation - Email Format', () => {
    it('should reject invalid email formats', async () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user@.com',
      ];

      for (const email of invalidEmails) {
        const response = await request(app.getHttpServer() as never)
          .post('/auth/register')
          .send({
            email,
            password: 'password123',
            name: 'Test User',
          })
          .expect(400);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(response.body.message).toBeDefined();
      }
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
      ];

      for (const email of validEmails) {
        await request(app.getHttpServer() as never)
          .post('/auth/register')
          .send({
            email,
            password: 'password123',
            name: 'Test User',
          })
          .expect(201);

        // Clean up - use cleanDatabase which is available
        await dbHelper.cleanDatabase();
      }
    });
  });

  describe('Input Validation - Whitelist Protection', () => {
    it('should strip non-whitelisted properties', async () => {
      const response = await request(app.getHttpServer() as never)
        .post('/auth/register')
        .send({
          email: 'whitelist@example.com',
          password: 'password123',
          name: 'Test User',
          maliciousField: 'This should be removed',
          anotherBadField: 'Also removed',
        })
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const user = response.body.user as Record<string, unknown>;
      expect(user).toBeDefined();
      expect(user.maliciousField).toBeUndefined();
      expect(user.anotherBadField).toBeUndefined();
    });
  });

  describe('Input Validation - Required Fields', () => {
    it('should reject missing required fields', async () => {
      const response = await request(app.getHttpServer() as never)
        .post('/auth/register')
        .send({
          email: 'incomplete@example.com',
          // missing password and name
        })
        .expect(400);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBeDefined();
    });

    it('should reject empty strings in required fields', async () => {
      const response = await request(app.getHttpServer() as never)
        .post('/auth/register')
        .send({
          email: 'empty@example.com',
          password: '',
          name: '',
        })
        .expect(400);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Input Validation - Trimming Whitespace', () => {
    it('should trim whitespace from string inputs', async () => {
      const response = await request(app.getHttpServer() as never)
        .post('/auth/register')
        .send({
          email: '  trim@example.com  ',
          password: 'password123',
          name: '  Trimmed Name  ',
        })
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const user = response.body.user as { email: string; name: string };
      expect(user.email).toBe('trim@example.com');
      expect(user.name).toBe('Trimmed Name');
    });
  });

  describe('Password Security', () => {
    it('should reject passwords shorter than minimum length', async () => {
      const response = await request(app.getHttpServer() as never)
        .post('/auth/register')
        .send({
          email: 'shortpass@example.com',
          password: '12345', // Less than 6 characters
          name: 'Test User',
        })
        .expect(400);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBeDefined();
    });

    it('should accept passwords meeting minimum requirements', async () => {
      const response = await request(app.getHttpServer() as never)
        .post('/auth/register')
        .send({
          email: 'goodpass@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.user).toBeDefined();
    });
  });
});
