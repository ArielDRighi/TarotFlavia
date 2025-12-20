import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

/**
 * E2E Tests for Audit Log Module
 *
 * Tests cover:
 * - GET /admin/audit-logs - List audit logs with pagination and filters
 * - Authorization (admin only)
 * - Query filters (action, userId, entityType, date range)
 *
 * Following TESTING_PHILOSOPHY.md guidelines:
 * - No `as any` casts
 * - Investigate failures in production code, not tests
 * - Tests validate real behavior
 */
describe('Audit Logs (e2e)', () => {
  let app: INestApplication<App>;
  let dbHelper: E2EDatabaseHelper;
  let adminToken: string;
  let userToken: string;

  interface AuditLogEntry {
    id: number;
    action: string;
    entityType: string;
    entityId: number;
    userId: number;
    changes: Record<string, unknown>;
    createdAt: string;
  }

  // Response structure matching the actual service
  interface AuditLogListResponse {
    logs: AuditLogEntry[];
    meta: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
    };
  }

  beforeAll(async () => {
    // Initialize E2E database helper
    dbHelper = new E2EDatabaseHelper();
    await dbHelper.initialize();

    // Create NestJS application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // Login to get tokens
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'Test123456!' })
      .expect(200);

    const userLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'free@test.com', password: 'Test123456!' })
      .expect(200);

    adminToken = adminLoginResponse.body.access_token;
    userToken = userLoginResponse.body.access_token;

    if (!adminToken || !userToken) {
      throw new Error('Failed to obtain authentication tokens');
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (dbHelper) {
      await dbHelper.close();
    }
  });

  // ============================================
  // GET /admin/audit-logs - List Audit Logs
  // ============================================
  describe('GET /admin/audit-logs', () => {
    it('should return audit logs when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      expect(result).toHaveProperty('logs');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('currentPage');
      expect(result.meta).toHaveProperty('itemsPerPage');
      expect(result.meta).toHaveProperty('totalItems');
      expect(result.meta).toHaveProperty('totalPages');
      expect(Array.isArray(result.logs)).toBe(true);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs')
        .expect(401);
    });
  });

  // ============================================
  // Pagination Tests
  // ============================================
  describe('Pagination', () => {
    it('should respect page parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?page=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      expect(result.meta.currentPage).toBe(1);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      expect(result.meta.itemsPerPage).toBe(5);
      expect(result.logs.length).toBeLessThanOrEqual(5);
    });

    it('should use default pagination values when not provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.itemsPerPage).toBe(20); // Default limit
    });

    it('should return 400 for invalid page number', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?page=0')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should return 400 for limit exceeding maximum', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?limit=101')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  // ============================================
  // Filter Tests
  // ============================================
  describe('Filters', () => {
    it('should filter by action type', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?action=user_banned')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      // All returned entries should have the specified action
      result.logs.forEach((entry) => {
        expect(entry.action).toBe('user_banned');
      });
    });

    it('should filter by entityType', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?entityType=User')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      result.logs.forEach((entry) => {
        expect(entry.entityType).toBe('User');
      });
    });

    it('should filter by userId', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?userId=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      result.logs.forEach((entry) => {
        expect(entry.userId).toBe(1);
      });
    });

    it('should filter by date range (startDate)', async () => {
      const startDate = '2025-01-01T00:00:00Z';

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/audit-logs?startDate=${startDate}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      result.logs.forEach((entry) => {
        expect(new Date(entry.createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(startDate).getTime(),
        );
      });
    });

    it('should filter by date range (endDate)', async () => {
      const endDate = '2025-12-31T23:59:59Z';

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/audit-logs?endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      result.logs.forEach((entry) => {
        expect(new Date(entry.createdAt).getTime()).toBeLessThanOrEqual(
          new Date(endDate).getTime(),
        );
      });
    });

    it('should combine multiple filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?entityType=User&page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.itemsPerPage).toBe(10);
      result.logs.forEach((entry) => {
        expect(entry.entityType).toBe('User');
      });
    });

    it('should return 400 for invalid action enum', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?action=invalid_action')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should return 400 for invalid date format', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?startDate=not-a-date')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  // ============================================
  // Response Structure Tests
  // ============================================
  describe('Response Structure', () => {
    it('should return proper audit log entry structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;

      if (result.logs.length > 0) {
        const entry = result.logs[0];
        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('action');
        expect(entry).toHaveProperty('entityType');
        expect(entry).toHaveProperty('createdAt');
      }
    });

    it('should calculate totalPages correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      const expectedTotalPages = Math.ceil(
        result.meta.totalItems / result.meta.itemsPerPage,
      );
      expect(result.meta.totalPages).toBe(expectedTotalPages);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle empty result set gracefully', async () => {
      // Query for a very specific filter that likely has no results
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?userId=999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      expect(result.logs).toEqual([]);
      expect(result.meta.totalItems).toBe(0);
    });

    it('should handle page beyond available data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?page=9999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      expect(result.logs).toEqual([]);
      expect(result.meta.currentPage).toBe(9999);
    });

    it('should handle minimum valid limit', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      expect(result.meta.itemsPerPage).toBe(1);
      expect(result.logs.length).toBeLessThanOrEqual(1);
    });

    it('should handle maximum valid limit', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?limit=100')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const result = response.body as AuditLogListResponse;
      expect(result.meta.itemsPerPage).toBe(100);
    });
  });
});
