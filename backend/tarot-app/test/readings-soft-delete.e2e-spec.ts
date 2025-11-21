import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User, UserPlan } from '../src/modules/users/entities/user.entity';
import { TarotReading } from '../src/modules/tarot/readings/entities/tarot-reading.entity';
import { TarotDeck } from '../src/modules/tarot/decks/entities/tarot-deck.entity';
import { TarotSpread } from '../src/modules/tarot/spreads/entities/tarot-spread.entity';
import { TarotCard } from '../src/modules/tarot/cards/entities/tarot-card.entity';
import { ReadingCategory } from '../src/modules/categories/entities/reading-category.entity';
import { PredefinedQuestion } from '../src/modules/predefined-questions/entities/predefined-question.entity';
import { hash } from 'bcrypt';

interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    isAdmin: boolean;
    plan: string;
  };
  access_token: string;
}

/**
 * Readings Soft Delete E2E Tests
 *
 * Tests para la funcionalidad de eliminación lógica (soft delete) de lecturas:
 * - DELETE /readings/:id - Soft delete básico
 * - GET /readings/trash - Ver lecturas eliminadas (últimos 30 días)
 * - POST /readings/:id/restore - Restaurar lecturas eliminadas
 * - Tarea cron para hard delete automático (lecturas +30 días)
 * - GET /admin/readings?includeDeleted=true - Endpoint admin
 */
describe('Readings Soft Delete E2E', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let userToken: string;
  let userId: number;
  let adminToken: string;
  let adminId: number;
  let otherUserToken: string;
  let otherUserId: number;
  let categoryId: number;
  let predefinedQuestionId: number;
  let deckId: number;
  let spreadId: number;
  let cardIds: number[];
  const testTimestamp = Date.now();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    await createTestData();
  }, 60000);

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  }, 30000);

  /**
   * Helper: Crear datos de prueba
   */
  async function createTestData(): Promise<void> {
    // Crear usuarios
    const hashedPassword = await hash('Password123!', 10);

    const regularUser = await dataSource.getRepository(User).save({
      email: `user-softdelete-${testTimestamp}@example.com`,
      password: hashedPassword,
      name: 'Regular User',
      plan: UserPlan.PREMIUM,
    });
    userId = regularUser.id;

    const adminUser = await dataSource.getRepository(User).save({
      email: `admin-softdelete-${testTimestamp}@example.com`,
      password: hashedPassword,
      name: 'Admin User',
      plan: UserPlan.PREMIUM,
      isAdmin: true,
    });
    adminId = adminUser.id;

    const otherUser = await dataSource.getRepository(User).save({
      email: `other-softdelete-${testTimestamp}@example.com`,
      password: hashedPassword,
      name: 'Other User',
      plan: UserPlan.PREMIUM,
    });
    otherUserId = otherUser.id;

    // Login usuarios
    const userLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: regularUser.email, password: 'Password123!' })
      .expect(200);
    userToken = (userLoginRes.body as LoginResponse).access_token;

    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminUser.email, password: 'Password123!' })
      .expect(200);
    adminToken = (adminLoginRes.body as LoginResponse).access_token;

    const otherLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: otherUser.email, password: 'Password123!' })
      .expect(200);
    otherUserToken = (otherLoginRes.body as LoginResponse).access_token;

    // Crear categoría
    const category = await dataSource.getRepository(ReadingCategory).save({
      name: `Test Category SoftDelete ${testTimestamp}`,
      slug: `test-category-softdelete-${testTimestamp}`,
      description: 'Test category',
      icon: 'test-icon',
      color: '#000000',
      order: 1,
    });
    categoryId = category.id;

    // Crear pregunta predefinida
    const question = await dataSource.getRepository(PredefinedQuestion).save({
      categoryId: categoryId,
      questionText: 'Test question for soft delete?',
      order: 1,
    });
    predefinedQuestionId = question.id;

    // Crear deck
    const deck = await dataSource.getRepository(TarotDeck).save({
      name: `Test Deck SoftDelete ${testTimestamp}`,
      description: 'Test deck',
      imageUrl: 'http://example.com/deck.jpg',
      isDefault: true,
    });
    deckId = deck.id;

    // Crear cartas
    const cardsToCreate = [
      {
        name: 'The Fool',
        number: 0,
        category: 'major',
        imageUrl: 'http://example.com/fool.jpg',
        meaningUpright: 'New beginnings',
        meaningReversed: 'Recklessness',
        description: 'The Fool card',
        keywords: 'beginnings, innocence',
        deckId: deck.id,
      },
      {
        name: 'The Magician',
        number: 1,
        category: 'major',
        imageUrl: 'http://example.com/magician.jpg',
        meaningUpright: 'Manifestation',
        meaningReversed: 'Manipulation',
        description: 'The Magician card',
        keywords: 'power, action',
        deckId: deck.id,
      },
      {
        name: 'The High Priestess',
        number: 2,
        category: 'major',
        imageUrl: 'http://example.com/priestess.jpg',
        meaningUpright: 'Intuition',
        meaningReversed: 'Secrets',
        description: 'The High Priestess card',
        keywords: 'intuition, mystery',
        deckId: deck.id,
      },
    ];

    const cards = await dataSource.getRepository(TarotCard).save(cardsToCreate);
    cardIds = cards.map((c) => c.id);

    // Crear spread
    const spread = await dataSource.getRepository(TarotSpread).save({
      name: 'Test Spread SoftDelete',
      description: 'Test spread',
      cardCount: 3,
      positions: [
        { name: 'Past', description: 'Past' },
        { name: 'Present', description: 'Present' },
        { name: 'Future', description: 'Future' },
      ],
      difficulty: 'beginner',
      whenToUse: 'Test',
    });
    spreadId = spread.id;
  }

  /**
   * Helper: Limpiar datos de prueba
   */
  async function cleanupTestData(): Promise<void> {
    // Delete readings from test users (respects foreign keys)
    await dataSource
      .createQueryBuilder()
      .delete()
      .from(TarotReading)
      .where('userId IN (:...userIds)', {
        userIds: [userId, adminId, otherUserId],
      })
      .execute();

    await dataSource.getRepository(TarotCard).delete({ deckId });
    await dataSource.getRepository(TarotSpread).delete({ id: spreadId });
    await dataSource.getRepository(PredefinedQuestion).delete({
      id: predefinedQuestionId,
    });
    await dataSource.getRepository(ReadingCategory).delete({ id: categoryId });
    await dataSource.getRepository(TarotDeck).delete({ id: deckId });
    await dataSource.getRepository(User).delete([userId, adminId, otherUserId]);
  }

  /**
   * Helper: Crear una lectura de prueba
   */
  async function createTestReading(token: string): Promise<number> {
    const response = await request(app.getHttpServer())
      .post('/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        deckId,
        spreadId,
        predefinedQuestionId,
        cardIds,
        cardPositions: [
          { cardId: cardIds[0], position: 'Past', isReversed: false },
          { cardId: cardIds[1], position: 'Present', isReversed: false },
          { cardId: cardIds[2], position: 'Future', isReversed: true },
        ],
        generateInterpretation: false,
      })
      .expect(201);

    return (response.body as TarotReading).id;
  }

  describe('DELETE /readings/:id - Soft Delete Básico', () => {
    it('debe hacer soft delete de una lectura propia', async () => {
      const readingId = await createTestReading(userToken);

      await request(app.getHttpServer())
        .delete(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verificar que la lectura tiene deletedAt
      const reading = await dataSource
        .getRepository(TarotReading)
        .findOne({ where: { id: readingId }, withDeleted: true });

      expect(reading).toBeDefined();
      expect(reading?.deletedAt).toBeDefined();
      expect(reading?.deletedAt).toBeInstanceOf(Date);
    });

    it('no debe permitir eliminar lectura de otro usuario', async () => {
      const readingId = await createTestReading(userToken);

      await request(app.getHttpServer())
        .delete(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      // Verificar que la lectura NO fue eliminada
      const reading = await dataSource
        .getRepository(TarotReading)
        .findOne({ where: { id: readingId } });

      expect(reading).toBeDefined();
      expect(reading?.deletedAt).toBeNull();
    });

    it('debe retornar 404 si la lectura no existe', async () => {
      await request(app.getHttpServer())
        .delete('/readings/999999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('debe retornar 401 si no está autenticado', async () => {
      const readingId = await createTestReading(userToken);

      await request(app.getHttpServer())
        .delete(`/readings/${readingId}`)
        .expect(401);
    });

    it('las lecturas eliminadas no deben aparecer en GET /readings', async () => {
      const readingId = await createTestReading(userToken);

      // Eliminar la lectura
      await request(app.getHttpServer())
        .delete(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verificar que no aparece en el listado
      const response = await request(app.getHttpServer())
        .get('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const readings = response.body.data as TarotReading[];
      const deletedReading = readings.find((r) => r.id === readingId);

      expect(deletedReading).toBeUndefined();
    });

    it('las lecturas eliminadas no deben ser accesibles con GET /readings/:id', async () => {
      const readingId = await createTestReading(userToken);

      // Eliminar la lectura
      await request(app.getHttpServer())
        .delete(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Intentar acceder a la lectura eliminada
      await request(app.getHttpServer())
        .get(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('GET /readings/trash - Ver Lecturas Eliminadas', () => {
    it('debe retornar lecturas eliminadas del usuario autenticado', async () => {
      const readingId1 = await createTestReading(userToken);
      const readingId2 = await createTestReading(userToken);

      // Eliminar ambas lecturas
      await request(app.getHttpServer())
        .delete(`/readings/${readingId1}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/readings/${readingId2}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Obtener papelera
      const response = await request(app.getHttpServer())
        .get('/readings/trash')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const trashedReadings = response.body as TarotReading[];

      expect(trashedReadings).toBeInstanceOf(Array);
      expect(trashedReadings.length).toBeGreaterThanOrEqual(2);
      expect(trashedReadings.some((r) => r.id === readingId1)).toBeTruthy();
      expect(trashedReadings.some((r) => r.id === readingId2)).toBeTruthy();
    });

    it('no debe retornar lecturas eliminadas de otros usuarios', async () => {
      const readingId = await createTestReading(otherUserToken);

      // Otro usuario elimina su lectura
      await request(app.getHttpServer())
        .delete(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      // El usuario actual no debe verla en su papelera
      const response = await request(app.getHttpServer())
        .get('/readings/trash')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const trashedReadings = response.body as TarotReading[];
      const otherUserReading = trashedReadings.find((r) => r.id === readingId);

      expect(otherUserReading).toBeUndefined();
    });

    it('no debe retornar lecturas eliminadas hace más de 30 días', async () => {
      // Crear lectura y marcarla como eliminada hace 31 días
      const readingId = await createTestReading(userToken);

      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);

      await dataSource
        .getRepository(TarotReading)
        .update({ id: readingId }, { deletedAt: oldDate });

      // Verificar que no aparece en la papelera
      const response = await request(app.getHttpServer())
        .get('/readings/trash')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const trashedReadings = response.body as TarotReading[];
      const oldReading = trashedReadings.find((r) => r.id === readingId);

      expect(oldReading).toBeUndefined();
    });

    it('debe retornar 401 si no está autenticado', async () => {
      await request(app.getHttpServer()).get('/readings/trash').expect(401);
    });
  });

  describe('POST /readings/:id/restore - Restaurar Lecturas', () => {
    it('debe restaurar una lectura eliminada propia', async () => {
      const readingId = await createTestReading(userToken);

      // Eliminar la lectura
      await request(app.getHttpServer())
        .delete(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Restaurar la lectura
      await request(app.getHttpServer())
        .post(`/readings/${readingId}/restore`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verificar que la lectura fue restaurada
      const reading = await dataSource
        .getRepository(TarotReading)
        .findOne({ where: { id: readingId } });

      expect(reading).toBeDefined();
      expect(reading?.deletedAt).toBeFalsy();
    });

    it('no debe permitir restaurar lectura de otro usuario', async () => {
      const readingId = await createTestReading(userToken);

      // Eliminar la lectura
      await request(app.getHttpServer())
        .delete(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Otro usuario intenta restaurar
      await request(app.getHttpServer())
        .post(`/readings/${readingId}/restore`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      // Verificar que la lectura NO fue restaurada
      const reading = await dataSource
        .getRepository(TarotReading)
        .findOne({ where: { id: readingId }, withDeleted: true });

      expect(reading?.deletedAt).toBeDefined();
    });

    it('debe retornar 404 si la lectura no existe', async () => {
      await request(app.getHttpServer())
        .post('/readings/999999/restore')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('debe retornar 400 si la lectura no está eliminada', async () => {
      const readingId = await createTestReading(userToken);

      await request(app.getHttpServer())
        .post(`/readings/${readingId}/restore`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });

    it('debe retornar 401 si no está autenticado', async () => {
      const readingId = await createTestReading(userToken);

      await request(app.getHttpServer())
        .post(`/readings/${readingId}/restore`)
        .expect(401);
    });

    it('la lectura restaurada debe estar disponible en la base de datos', async () => {
      const readingId = await createTestReading(userToken);

      // Eliminar
      await request(app.getHttpServer())
        .delete(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Restaurar
      await request(app.getHttpServer())
        .post(`/readings/${readingId}/restore`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verificar directamente en la base de datos que deletedAt es null
      const readingInDb = await dataSource
        .getRepository(TarotReading)
        .findOne({ where: { id: readingId } });

      expect(readingInDb).toBeDefined();
      expect(readingInDb?.deletedAt).toBeFalsy();

      // Verificar que es accesible mediante GET /readings/:id
      await request(app.getHttpServer())
        .get(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });

  describe('GET /admin/readings - Endpoint Admin con includeDeleted', () => {
    it('admin debe poder ver todas las lecturas incluyendo eliminadas', async () => {
      const readingId = await createTestReading(userToken);

      // Eliminar la lectura
      await request(app.getHttpServer())
        .delete(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Admin solicita con includeDeleted=true
      const response = await request(app.getHttpServer())
        .get('/admin/readings?includeDeleted=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const readings = response.body.data as TarotReading[];
      const deletedReading = readings.find((r) => r.id === readingId);

      expect(deletedReading).toBeDefined();
      expect(deletedReading?.deletedAt).toBeDefined();
    });

    it('admin debe poder ver solo lecturas activas sin includeDeleted', async () => {
      const readingId = await createTestReading(userToken);

      // Eliminar la lectura
      await request(app.getHttpServer())
        .delete(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Admin solicita sin includeDeleted
      const response = await request(app.getHttpServer())
        .get('/admin/readings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const readings = response.body.data as TarotReading[];
      const deletedReading = readings.find((r) => r.id === readingId);

      expect(deletedReading).toBeUndefined();
    });

    it('usuario no admin no debe poder acceder al endpoint admin', async () => {
      await request(app.getHttpServer())
        .get('/admin/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('debe retornar 401 si no está autenticado', async () => {
      await request(app.getHttpServer()).get('/admin/readings').expect(401);
    });
  });
});
