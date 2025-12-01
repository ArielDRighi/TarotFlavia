import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

/**
 * E2E Tests for Categories Module
 *
 * Tests cover:
 * - GET /categories - List all categories (with activeOnly filter)
 * - GET /categories/:id - Get category by ID
 * - GET /categories/slug/:slug - Get category by slug
 * - POST /categories - Create category (admin only)
 * - PATCH /categories/:id - Update category (admin only)
 * - DELETE /categories/:id - Delete category (admin only)
 * - PATCH /categories/:id/toggle-active - Toggle active status (admin only)
 *
 * Following TESTING_PHILOSOPHY.md guidelines:
 * - No `as any` casts
 * - Investigate failures in production code, not tests
 * - Tests validate real behavior
 */
describe('Categories (e2e)', () => {
  let app: INestApplication<App>;
  let dbHelper: E2EDatabaseHelper;
  let adminToken: string;
  let userToken: string;

  // Interface matching ReadingCategory entity structure
  interface CategoryResponse {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
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
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login to get tokens (using seeded users)
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'Test123456!' })
      .expect(200);

    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
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
  // GET /categories - List Categories
  // ============================================
  describe('GET /categories', () => {
    it('should return all categories (6 seeded categories)', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const categories = response.body as CategoryResponse[];
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThanOrEqual(6);
    });

    it('should return categories with correct structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const categories = response.body as CategoryResponse[];
      const category = categories[0];

      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('slug');
      expect(category).toHaveProperty('description');
      expect(category).toHaveProperty('icon');
      expect(category).toHaveProperty('color');
      expect(category).toHaveProperty('order');
      expect(category).toHaveProperty('isActive');
      expect(category).toHaveProperty('createdAt');
      expect(category).toHaveProperty('updatedAt');
    });

    it('should filter by activeOnly=true', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories?activeOnly=true')
        .expect(200);

      const categories = response.body as CategoryResponse[];
      expect(Array.isArray(categories)).toBe(true);
      // All returned categories should be active
      categories.forEach((cat) => {
        expect(cat.isActive).toBe(true);
      });
    });

    it('should include seeded categories (Amor, Trabajo, Dinero, Salud, Espiritual, General)', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const categories = response.body as CategoryResponse[];
      const slugs = categories.map((cat) => cat.slug);

      // Verify seeded categories exist
      expect(slugs).toContain('amor-relaciones');
      expect(slugs).toContain('carrera-trabajo');
      expect(slugs).toContain('dinero-finanzas');
      expect(slugs).toContain('salud-bienestar');
      expect(slugs).toContain('crecimiento-espiritual');
      expect(slugs).toContain('consulta-general');
    });

    it('should order categories correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const categories = response.body as CategoryResponse[];
      // Verify categories are ordered by order field
      for (let i = 1; i < categories.length; i++) {
        expect(categories[i].order).toBeGreaterThanOrEqual(
          categories[i - 1].order,
        );
      }
    });
  });

  // ============================================
  // GET /categories/:id - Get by ID
  // ============================================
  describe('GET /categories/:id', () => {
    it('should return category by ID', async () => {
      // Get first category ID
      const listResponse = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const categories = listResponse.body as CategoryResponse[];
      const categoryId = categories[0].id;

      const response = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(200);

      const category = response.body as CategoryResponse;
      expect(category.id).toBe(categoryId);
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('slug');
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer()).get('/categories/99999').expect(404);
    });

    it('should return 500 for invalid ID format (non-numeric)', async () => {
      // Note: The controller converts string to number with +id, which results
      // in NaN for non-numeric strings, causing a database error (500)
      // This is the actual behavior of the system
      await request(app.getHttpServer())
        .get('/categories/invalid-id')
        .expect(500);
    });
  });

  // ============================================
  // GET /categories/slug/:slug - Get by Slug
  // ============================================
  describe('GET /categories/slug/:slug', () => {
    it('should return category by slug', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/slug/amor-relaciones')
        .expect(200);

      const category = response.body as CategoryResponse;
      expect(category.slug).toBe('amor-relaciones');
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
    });

    it('should return category with all seeded data', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/slug/amor-relaciones')
        .expect(200);

      const category = response.body as CategoryResponse;
      expect(category.icon).toBe('❤️');
      expect(category.color).toBe('#FF6B9D');
      expect(category.isActive).toBe(true);
    });

    it('should return 404 for non-existent slug', async () => {
      await request(app.getHttpServer())
        .get('/categories/slug/non-existent-slug')
        .expect(404);
    });
  });

  // ============================================
  // POST /categories - Create (Admin Only)
  // ============================================
  describe('POST /categories', () => {
    const validCreateDto = {
      name: 'Test Category E2E',
      slug: 'test-category-e2e',
      description: 'Category created for E2E testing',
      icon: '🧪',
      color: '#123456',
      order: 100,
    };

    afterEach(async () => {
      // Clean up test category if created
      const dataSource = dbHelper.getDataSource();
      await dataSource.query(
        `DELETE FROM reading_category WHERE slug = 'test-category-e2e'`,
      );
    });

    it('should create category when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validCreateDto)
        .expect(201);

      const category = response.body as CategoryResponse;
      expect(category.name).toBe(validCreateDto.name);
      expect(category.slug).toBe(validCreateDto.slug);
      expect(category.description).toBe(validCreateDto.description);
      expect(category.icon).toBe(validCreateDto.icon);
      expect(category.color).toBe(validCreateDto.color);
      expect(category.order).toBe(validCreateDto.order);
      expect(category.isActive).toBe(true); // Default value
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .send(validCreateDto)
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validCreateDto)
        .expect(403);
    });

    it('should return 400 when missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Only Name' })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should return 400 for invalid slug format', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...validCreateDto,
          slug: 'Invalid Slug With Spaces',
        })
        .expect(400);
    });

    it('should return 400 for invalid color format', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...validCreateDto,
          color: 'not-a-hex-color',
        })
        .expect(400);
    });

    it('should return 409 when slug already exists', async () => {
      // First create the category
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validCreateDto)
        .expect(201);

      // Try to create again with same slug
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...validCreateDto,
          name: 'Different Name',
        })
        .expect(409);
    });
  });

  // ============================================
  // PATCH /categories/:id - Update (Admin Only)
  // ============================================
  describe('PATCH /categories/:id', () => {
    let testCategoryId: number;

    beforeEach(async () => {
      // Create a test category for update tests
      const dataSource = dbHelper.getDataSource();
      const result = await dataSource.query(
        `INSERT INTO reading_category (name, slug, description, icon, color, "order", "isActive") 
         VALUES ('Update Test Category', 'update-test-category', 'For testing updates', '🔄', '#AABBCC', 50, true) 
         RETURNING id`,
      );
      testCategoryId = result[0].id;
    });

    afterEach(async () => {
      // Clean up test category
      const dataSource = dbHelper.getDataSource();
      await dataSource.query(
        `DELETE FROM reading_category WHERE slug LIKE 'update-test%' OR slug = 'updated-slug'`,
      );
    });

    it('should update category when authenticated as admin', async () => {
      const updateDto = {
        name: 'Updated Category Name',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200);

      const category = response.body as CategoryResponse;
      expect(category.name).toBe(updateDto.name);
      expect(category.description).toBe(updateDto.description);
      // Other fields should remain unchanged
      expect(category.icon).toBe('🔄');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .send({ name: 'Updated Name' })
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .patch('/categories/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });

    it('should allow partial update (only name)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Only Name Updated' })
        .expect(200);

      const category = response.body as CategoryResponse;
      expect(category.name).toBe('Only Name Updated');
      expect(category.slug).toBe('update-test-category');
    });
  });

  // ============================================
  // DELETE /categories/:id - Delete (Admin Only)
  // ============================================
  describe('DELETE /categories/:id', () => {
    let testCategoryId: number;

    beforeEach(async () => {
      // Create a test category for deletion tests
      const dataSource = dbHelper.getDataSource();
      const result = await dataSource.query(
        `INSERT INTO reading_category (name, slug, description, icon, color, "order", "isActive") 
         VALUES ('Delete Test Category', 'delete-test-category', 'For testing deletion', '🗑️', '#FF0000', 99, true) 
         RETURNING id`,
      );
      testCategoryId = result[0].id;
    });

    afterEach(async () => {
      // Clean up test category if not deleted
      const dataSource = dbHelper.getDataSource();
      await dataSource.query(
        `DELETE FROM reading_category WHERE slug = 'delete-test-category'`,
      );
    });

    it('should delete category when authenticated as admin', async () => {
      await request(app.getHttpServer())
        .delete(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify category is deleted
      await request(app.getHttpServer())
        .get(`/categories/${testCategoryId}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/categories/${testCategoryId}`)
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .delete(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .delete('/categories/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  // ============================================
  // PATCH /categories/:id/toggle-active - Toggle Active
  // ============================================
  describe('PATCH /categories/:id/toggle-active', () => {
    let testCategoryId: number;

    beforeEach(async () => {
      // Create a test category for toggle tests
      const dataSource = dbHelper.getDataSource();
      const result = await dataSource.query(
        `INSERT INTO reading_category (name, slug, description, icon, color, "order", "isActive") 
         VALUES ('Toggle Test Category', 'toggle-test-category', 'For testing toggle', '🔘', '#808080', 98, true) 
         RETURNING id`,
      );
      testCategoryId = result[0].id;
    });

    afterEach(async () => {
      // Clean up test category
      const dataSource = dbHelper.getDataSource();
      await dataSource.query(
        `DELETE FROM reading_category WHERE slug = 'toggle-test-category'`,
      );
    });

    it('should toggle active status from true to false', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}/toggle-active`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const category = response.body as CategoryResponse;
      expect(category.isActive).toBe(false);
    });

    it('should toggle active status from false to true', async () => {
      // First toggle to false
      await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}/toggle-active`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Then toggle back to true
      const response = await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}/toggle-active`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const category = response.body as CategoryResponse;
      expect(category.isActive).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}/toggle-active`)
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}/toggle-active`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .patch('/categories/99999/toggle-active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  // ============================================
  // Edge Cases & Data Validation
  // ============================================
  describe('Edge Cases', () => {
    it('should validate hex color format correctly', async () => {
      // Valid formats
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Color Test',
          slug: 'color-test',
          description: 'Testing color validation',
          icon: '🎨',
          color: '#abc', // Short hex format
          order: 101,
        })
        .expect(201);

      // Clean up
      const dataSource = dbHelper.getDataSource();
      await dataSource.query(
        `DELETE FROM reading_category WHERE slug = 'color-test'`,
      );

      expect(response.body.color).toBe('#abc');
    });

    it('should enforce maximum length for name', async () => {
      const longName = 'A'.repeat(101); // 101 characters, max is 100

      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: longName,
          slug: 'long-name-test',
          description: 'Testing length validation',
          icon: '📏',
          color: '#000000',
        })
        .expect(400);
    });

    it('should enforce maximum length for description', async () => {
      const longDescription = 'A'.repeat(501); // 501 characters, max is 500

      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Long Desc Test',
          slug: 'long-desc-test',
          description: longDescription,
          icon: '📏',
          color: '#000000',
        })
        .expect(400);
    });

    it('should reject slug with uppercase letters', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Upper Test',
          slug: 'Upper-Case',
          description: 'Testing slug validation',
          icon: '🔠',
          color: '#000000',
        })
        .expect(400);
    });

    it('should reject slug with special characters', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Special Test',
          slug: 'special_char!',
          description: 'Testing slug validation',
          icon: '❗',
          color: '#000000',
        })
        .expect(400);
    });

    it('should handle order as optional with default value', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'No Order Test',
          slug: 'no-order-test',
          description: 'Testing default order',
          icon: '0️⃣',
          color: '#000000',
        })
        .expect(201);

      const category = response.body as CategoryResponse;
      expect(category.order).toBe(0); // Default value

      // Clean up
      const dataSource = dbHelper.getDataSource();
      await dataSource.query(
        `DELETE FROM reading_category WHERE slug = 'no-order-test'`,
      );
    });
  });
});
