import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

// Helper to add delay between requests to avoid rate limiting
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    await dbHelper.cleanUserData(); // Solo limpiar datos de usuario, no los seeders base
  }, 30000);

  afterAll(async () => {
    await dbHelper.cleanUserData(); // Solo limpiar datos de usuario
    await dbHelper.close();
    await app.close();
  }, 30000);

  beforeEach(async () => {
    await dbHelper.cleanUserData(); // Solo limpiar datos de usuario entre tests
    // Add significant delay to avoid rate limiting between tests
    await delay(1000);
  }, 15000); // Aumentar timeout a 15s para operaciones de limpieza de DB

  describe('SQL Injection Protection', () => {
    it('should reject SQL injection attempts in email field', async () => {
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

  describe('Input Validation - String Length', () => {
    it('should reject excessively long strings', async () => {
      const longString = 'a'.repeat(1001);
      const response = await request(app.getHttpServer() as never)
        .post('/auth/register')
        .send({
          email: 'longstring@example.com',
          password: 'password123',
          name: longString,
        })
        .expect(400);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(Array.isArray(response.body.message)).toBe(true);
    });
  });

  describe('Input Validation - Email Format', () => {
    it('should reject invalid email format', async () => {
      const response = await request(app.getHttpServer() as never)
        .post('/auth/register')
        .send({
          email: 'notanemail',
          password: 'password123',
          name: 'Test User',
        })
        .expect(400);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBeDefined();
    });

    it('should accept valid email format and trim whitespace', async () => {
      const response = await request(app.getHttpServer() as never)
        .post('/auth/register')
        .send({
          email: '  validuser@example.com  ',
          password: 'password123',
          name: '  Test User  ',
        })
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const user = response.body.user as { email: string; name: string };
      expect(user.email).toBe('validuser@example.com');
      expect(user.name).toBe('Test User');
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
  });
});
