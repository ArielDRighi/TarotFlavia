/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('PredefinedQuestions (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let adminToken: string;
  let userToken: string;
  let categoryId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Crear categoría de prueba
    const categoryResult = await dataSource.query(
      `INSERT INTO reading_category (name, slug, description, icon, color, "order", "isActive") 
       VALUES ('Test Category', 'test-category', 'Test description', '🧪', '#000000', 1, true) 
       RETURNING id`,
    );
    categoryId = categoryResult[0].id;

    // Crear usuarios de prueba
    const adminResult = await dataSource.query(
      `INSERT INTO "user" (email, password, name, "isAdmin") 
       VALUES ('admin@test.com', '$2b$10$test', 'Admin', true) 
       RETURNING id`,
    );

    const userResult = await dataSource.query(
      `INSERT INTO "user" (email, password, name, "isAdmin") 
       VALUES ('user@test.com', '$2b$10$test', 'User', false) 
       RETURNING id`,
    );

    // Obtener tokens (simulando login)
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'test123' });

    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@test.com', password: 'test123' });

    adminToken = adminLoginResponse.body.accessToken;
    userToken = userLoginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await dataSource.query(
      `DELETE FROM predefined_question WHERE category_id = $1`,
      [categoryId],
    );
    await dataSource.query(`DELETE FROM reading_category WHERE id = $1`, [
      categoryId,
    ]);
    await dataSource.query(
      `DELETE FROM "user" WHERE email IN ('admin@test.com', 'user@test.com')`,
    );
    await app.close();
  });

  describe('/predefined-questions (GET)', () => {
    it('should return all active questions', async () => {
      // Crear preguntas de prueba
      await dataSource.query(
        `INSERT INTO predefined_question (category_id, question_text, "order", is_active) 
         VALUES ($1, 'Test question 1', 1, true), 
                ($1, 'Test question 2', 2, true)`,
        [categoryId],
      );

      const response = await request(app.getHttpServer())
        .get('/predefined-questions')
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter questions by categoryId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/predefined-questions?categoryId=${categoryId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((question: { categoryId: number }) => {
        expect(question.categoryId).toBe(categoryId);
      });
    });
  });

  describe('/predefined-questions/:id (GET)', () => {
    it('should return a question by id', async () => {
      const questionResult = await dataSource.query(
        `INSERT INTO predefined_question (category_id, question_text, "order", is_active) 
         VALUES ($1, 'Specific question', 1, true) 
         RETURNING id`,
        [categoryId],
      );
      const questionId = questionResult[0].id;

      const response = await request(app.getHttpServer())
        .get(`/predefined-questions/${questionId}`)
        .expect(200);

      expect(response.body.id).toBe(questionId);
      expect(response.body.questionText).toBe('Specific question');
    });

    it('should return 404 when question not found', async () => {
      await request(app.getHttpServer())
        .get('/predefined-questions/99999')
        .expect(404);
    });
  });

  describe('/predefined-questions (POST)', () => {
    it('should create a new question when admin', async () => {
      const createDto = {
        categoryId,
        questionText: '¿Nueva pregunta de prueba?',
        order: 10,
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/predefined-questions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body.questionText).toBe(createDto.questionText);
      expect(response.body.categoryId).toBe(categoryId);
    });

    it('should return 403 when non-admin tries to create', async () => {
      const createDto = {
        categoryId,
        questionText: '¿Pregunta no autorizada?',
        order: 10,
        isActive: true,
      };

      await request(app.getHttpServer())
        .post('/predefined-questions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createDto)
        .expect(403);
    });

    it('should return 400 when question text exceeds 200 characters', async () => {
      const createDto = {
        categoryId,
        questionText: 'a'.repeat(201),
        order: 10,
        isActive: true,
      };

      await request(app.getHttpServer())
        .post('/predefined-questions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto)
        .expect(400);
    });
  });

  describe('/predefined-questions/:id (PATCH)', () => {
    it('should update a question when admin', async () => {
      const questionResult = await dataSource.query(
        `INSERT INTO predefined_question (category_id, question_text, "order", is_active) 
         VALUES ($1, 'Original question', 1, true) 
         RETURNING id`,
        [categoryId],
      );
      const questionId = questionResult[0].id;

      const updateDto = {
        questionText: '¿Pregunta actualizada?',
      };

      const response = await request(app.getHttpServer())
        .patch(`/predefined-questions/${questionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.questionText).toBe(updateDto.questionText);
    });

    it('should return 403 when non-admin tries to update', async () => {
      const questionResult = await dataSource.query(
        `INSERT INTO predefined_question (category_id, question_text, "order", is_active) 
         VALUES ($1, 'Question to update', 1, true) 
         RETURNING id`,
        [categoryId],
      );
      const questionId = questionResult[0].id;

      await request(app.getHttpServer())
        .patch(`/predefined-questions/${questionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ questionText: 'Updated' })
        .expect(403);
    });
  });

  describe('/predefined-questions/:id (DELETE)', () => {
    it('should soft delete a question when admin', async () => {
      const questionResult = await dataSource.query(
        `INSERT INTO predefined_question (category_id, question_text, "order", is_active) 
         VALUES ($1, 'Question to delete', 1, true) 
         RETURNING id`,
        [categoryId],
      );
      const questionId = questionResult[0].id;

      await request(app.getHttpServer())
        .delete(`/predefined-questions/${questionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verificar que fue soft-deleted
      const deletedQuestion = await dataSource.query(
        `SELECT deleted_at FROM predefined_question WHERE id = $1`,
        [questionId],
      );
      expect(deletedQuestion[0].deleted_at).not.toBeNull();
    });

    it('should return 403 when non-admin tries to delete', async () => {
      const questionResult = await dataSource.query(
        `INSERT INTO predefined_question (category_id, question_text, "order", is_active) 
         VALUES ($1, 'Question to delete', 1, true) 
         RETURNING id`,
        [categoryId],
      );
      const questionId = questionResult[0].id;

      await request(app.getHttpServer())
        .delete(`/predefined-questions/${questionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
