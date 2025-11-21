import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';
import { ReadingCategory } from '../src/modules/categories/entities/reading-category.entity';

describe('PredefinedQuestions (e2e)', () => {
  let app: INestApplication<App>;
  let dbHelper: E2EDatabaseHelper;
  let adminToken: string;
  let userToken: string;
  let categoryId: number;

  beforeAll(async () => {
    // Initialize E2E database helper
    dbHelper = new E2EDatabaseHelper();
    await dbHelper.initialize();
    // NOTE: NO limpiar base de datos aquí - los seeders ya se ejecutaron en globalSetup

    // Get first category ID for tests (data already seeded in globalSetup)
    const dataSource = dbHelper.getDataSource();
    const categoryRepository = dataSource.getRepository(ReadingCategory);
    const category = await categoryRepository.findOne({ where: { order: 1 } });
    if (!category) {
      throw new Error(
        'No categories found in database. Make sure global setup has run correctly.',
      );
    }
    categoryId = category.id;

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

  afterEach(async () => {
    // NOTE: NO borrar preguntas aquí porque son las seeded en globalSetup
    // que necesitan otros tests. Solo borrar preguntas creadas en los tests si es necesario
    // En este test, los tests crean preguntas temporales que se deben limpiar individualmente
  });

  describe('/predefined-questions (GET)', () => {
    it('should return all active questions', async () => {
      // Usar las preguntas seeded del globalSetup (42 preguntas)
      const response = await request(app.getHttpServer())
        .get('/predefined-questions')
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(42);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter questions by categoryId', async () => {
      // Usar las preguntas seeded del globalSetup
      const response = await request(app.getHttpServer())
        .get(`/predefined-questions?categoryId=${categoryId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(5); // Al menos 5 preguntas por categoría
      response.body.forEach((question: { categoryId: number }) => {
        expect(question.categoryId).toBe(categoryId);
      });
    });
  });

  describe('/predefined-questions/:id (GET)', () => {
    it('should return a question by id', async () => {
      // Usar una pregunta seeded del globalSetup
      const dataSource = dbHelper.getDataSource();
      const seededQuestion = await dataSource.query(
        `SELECT id, question_text FROM predefined_question WHERE category_id = $1 LIMIT 1`,
        [categoryId],
      );
      const questionId = seededQuestion[0].id;

      const response = await request(app.getHttpServer())
        .get(`/predefined-questions/${questionId}`)
        .expect(200);

      expect(response.body.id).toBe(questionId);
      expect(response.body.questionText).toBeTruthy();
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

      // Limpiar la pregunta creada
      const createdId = response.body.id;
      const dataSource = dbHelper.getDataSource();
      await dataSource.query(`DELETE FROM predefined_question WHERE id = $1`, [
        createdId,
      ]);
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
      // Crear pregunta temporal para actualizar
      const dataSource = dbHelper.getDataSource();
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

      // Limpiar la pregunta creada
      await dataSource.query(`DELETE FROM predefined_question WHERE id = $1`, [
        questionId,
      ]);
    });

    it('should return 403 when non-admin tries to update', async () => {
      // Crear pregunta temporal para probar acceso
      const dataSource = dbHelper.getDataSource();
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

      // Limpiar la pregunta creada
      await dataSource.query(`DELETE FROM predefined_question WHERE id = $1`, [
        questionId,
      ]);
    });
  });

  describe('/predefined-questions/:id (DELETE)', () => {
    it('should soft delete a question when admin', async () => {
      // Crear pregunta temporal para eliminar
      const dataSource = dbHelper.getDataSource();
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
      const ds = dbHelper.getDataSource();
      const deletedQuestion = await ds.query(
        `SELECT deleted_at FROM predefined_question WHERE id = $1`,
        [questionId],
      );
      expect(deletedQuestion[0].deleted_at).not.toBeNull();

      // Limpiar completamente la pregunta (hard delete)
      await ds.query(`DELETE FROM predefined_question WHERE id = $1`, [
        questionId,
      ]);
    });

    it('should return 403 when non-admin tries to delete', async () => {
      // Crear pregunta temporal para probar acceso
      const dataSource = dbHelper.getDataSource();
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

      // Limpiar la pregunta creada
      await dataSource.query(`DELETE FROM predefined_question WHERE id = $1`, [
        questionId,
      ]);
    });
  });
});
