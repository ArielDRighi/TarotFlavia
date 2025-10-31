import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ThrottlerModule, Throttle } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Controller, Get, Post, Module } from '@nestjs/common';
import { CustomThrottlerGuard } from '../src/common/guards/custom-throttler.guard';
import { ThrottlerExceptionFilter } from '../src/common/filters/throttler-exception.filter';

@Controller()
class TestController {
  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Post('auth')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests por minuto
  postAuth(): string {
    return 'Auth OK';
  }

  @Get('readings')
  @Throttle({ default: { limit: 4, ttl: 60000 } }) // 4 requests por minuto
  getReadings(): string {
    return 'Readings OK';
  }
}

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 5, // 5 requests por minuto global
      },
    ]),
  ],
  controllers: [TestController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
  ],
})
class TestAppModule {}

describe('Rate Limiting (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Global Rate Limiting', () => {
    it('should allow requests under global limit', async () => {
      for (let i = 0; i < 3; i++) {
        const response = await request(app.getHttpServer()).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Hello World!');
        // Verificar headers X-RateLimit
        expect(response.headers['x-ratelimit-limit']).toBeDefined();
        expect(response.headers['x-ratelimit-remaining']).toBeDefined();
        expect(response.headers['x-ratelimit-reset']).toBeDefined();
      }
    });

    it('should block requests exceeding global limit and return custom error message', async () => {
      const responses: request.Response[] = [];

      for (let i = 0; i < 6; i++) {
        const response = await request(app.getHttpServer()).get('/');
        responses.push(response);
      }

      const throttledRequests = responses.filter((r) => r.status === 429);
      expect(throttledRequests.length).toBeGreaterThan(0);

      // Verificar el mensaje personalizado en la respuesta throttled
      const throttledResponse = throttledRequests[0];
      expect(throttledResponse?.body).toHaveProperty('statusCode', 429);
      expect(throttledResponse?.body).toHaveProperty('message');

      // Type assertion para body con estructura conocida
      const responseBody = throttledResponse?.body as {
        message: string;
        statusCode: number;
        error: string;
        retryAfter: number;
      };

      expect(responseBody.message).toContain(
        'Has excedido el límite de solicitudes',
      );
      expect(throttledResponse?.body).toHaveProperty('retryAfter');
      expect(throttledResponse?.body).toHaveProperty(
        'error',
        'Too Many Requests',
      );
      expect(throttledResponse?.headers['retry-after']).toBeDefined();
    });
  });

  describe('Endpoint-Specific Rate Limiting', () => {
    it('should apply specific limit to /auth endpoint (3 req/min)', async () => {
      const responses: number[] = [];

      // Hacer 4 requests para exceder el límite de 3
      for (let i = 0; i < 4; i++) {
        const response = await request(app.getHttpServer()).post('/auth');
        responses.push(response.status);
      }

      // Las primeras 3 deben ser 201, la 4ta debe ser 429
      const successfulRequests = responses.filter((status) => status === 201);
      const throttledRequests = responses.filter((status) => status === 429);

      expect(successfulRequests.length).toBe(3);
      expect(throttledRequests.length).toBe(1);
    });

    it('should apply specific limit to /readings endpoint (4 req/min)', async () => {
      const responses: number[] = [];

      // Hacer 5 requests para exceder el límite de 4
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer()).get('/readings');
        responses.push(response.status);
      }

      // Las primeras 4 deben ser 200, la 5ta debe ser 429
      const successfulRequests = responses.filter((status) => status === 200);
      const throttledRequests = responses.filter((status) => status === 429);

      expect(successfulRequests.length).toBe(4);
      expect(throttledRequests.length).toBe(1);
    });
  });
});
