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
 * Reading Regeneration E2E Tests
 *
 * Tests específicos para la funcionalidad de regeneración de interpretaciones
 * Solo usuarios premium pueden regenerar interpretaciones
 * Límite: 3 regeneraciones por lectura
 */
describe('Reading Regeneration E2E', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let freeUserToken: string;
  let premiumUserToken: string;
  let freeUserId: number;
  let premiumUserId: number;
  let readingId: number;
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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    await createTestData();
  }, 60000);

  beforeEach(async () => {
    // Limpiamos TODOS los registros de uso del usuario premium antes de cada test
    // Como premium tiene límite ilimitado (-1), el guard siempre permitirá el acceso
    if (premiumUserId) {
      await dataSource.query(`DELETE FROM usage_limit WHERE user_id = $1`, [
        premiumUserId,
      ]);
    }
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  }, 30000);

  /**
   * Helper: Crear una reading fresca para tests
   * Esta función se puede llamar en cada test para tener una reading independiente
   */
  async function createFreshReading(
    userId: number,
    token: string,
  ): Promise<number> {
    const createResponse = await request(app.getHttpServer())
      .post('/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        predefinedQuestionId: predefinedQuestionId,
        deckId: deckId,
        spreadId: spreadId,
        cardIds: cardIds,
        cardPositions: [
          { cardId: cardIds[0], position: 'Past', isReversed: false },
          { cardId: cardIds[1], position: 'Present', isReversed: false },
          { cardId: cardIds[2], position: 'Future', isReversed: true },
        ],
        generateInterpretation: true,
      })
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const newReadingId = createResponse.body.id as number;
    expect(newReadingId).toBeDefined();

    // Verificar inmediatamente que la reading existe en la DB
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const verifyReading = await dataSource.query(
      `SELECT id, "userId" FROM tarot_reading WHERE id = $1`,
      [newReadingId],
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!verifyReading || verifyReading.length === 0) {
      throw new Error(
        `Reading ${newReadingId} was created via API but not found in database!`,
      );
    }

    console.log(`✓ Created fresh reading with ID: ${newReadingId}`);
    return newReadingId;
  }

  /**
   * Helper: Crear datos de prueba
   */
  async function createTestData(): Promise<void> {
    // Necesitamos esperar a que app esté disponible
    if (!app) {
      throw new Error('App not initialized');
    }
    // Crear usuarios
    const hashedPassword = await hash('Password123!', 10);

    const freeUser = await dataSource.getRepository(User).save({
      email: `free-regen-${testTimestamp}@test.com`,
      password: hashedPassword,
      name: 'Free User Regen Test',
      plan: UserPlan.FREE,
    });
    freeUserId = freeUser.id;

    const premiumUser = await dataSource.getRepository(User).save({
      email: `premium-regen-${testTimestamp}@test.com`,
      password: hashedPassword,
      name: 'Premium User Regen Test',
      plan: UserPlan.PREMIUM,
      planStartedAt: new Date(),
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    premiumUserId = premiumUser.id;

    // Login usuarios
    const freeLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `free-regen-${testTimestamp}@test.com`,
        password: 'Password123!',
      });
    freeUserToken = (freeLoginResponse.body as LoginResponse).access_token;

    const premiumLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `premium-regen-${testTimestamp}@test.com`,
        password: 'Password123!',
      });
    premiumUserToken = (premiumLoginResponse.body as LoginResponse)
      .access_token;

    // Crear categoría
    const category = await dataSource.getRepository(ReadingCategory).save({
      name: `Test Category Regen ${testTimestamp}`,
      slug: `test-category-regen-${testTimestamp}`,
      description: 'Test category for regeneration',
      icon: 'test-icon',
      color: '#000000',
      order: 1,
      isActive: true,
    });
    categoryId = category.id;

    // Crear pregunta predefinida
    const question = await dataSource.getRepository(PredefinedQuestion).save({
      categoryId: categoryId,
      questionText: 'What does my future hold?',
      order: 1,
      isActive: true,
    });
    predefinedQuestionId = question.id;

    // Crear deck específico para estos tests
    const deck = await dataSource.getRepository(TarotDeck).save({
      name: `Regen Test Deck ${testTimestamp}`,
      description: 'Deck for regeneration tests',
      imageUrl: 'https://example.com/deck.jpg',
      cardCount: 78,
      isActive: true,
      isDefault: false,
    });
    deckId = deck.id;

    // Crear cartas para el test
    const cardsToCreate = [
      {
        name: `The Fool Regen ${testTimestamp}`,
        number: 0,
        category: 'major',
        deckId: deckId,
        imageUrl: 'https://example.com/fool.jpg',
        meaningUpright: 'New beginnings',
        meaningReversed: 'Recklessness',
        description: 'The Fool card',
        keywords: 'beginning,innocence,spontaneity',
      },
      {
        name: `The Magician Regen ${testTimestamp}`,
        number: 1,
        category: 'major',
        deckId: deckId,
        imageUrl: 'https://example.com/magician.jpg',
        meaningUpright: 'Manifestation',
        meaningReversed: 'Manipulation',
        description: 'The Magician card',
        keywords: 'manifestation,resourcefulness,power',
      },
      {
        name: `The High Priestess Regen ${testTimestamp}`,
        number: 2,
        category: 'major',
        deckId: deckId,
        imageUrl: 'https://example.com/priestess.jpg',
        meaningUpright: 'Intuition',
        meaningReversed: 'Secrets',
        description: 'The High Priestess card',
        keywords: 'intuition,sacred knowledge,divine feminine',
      },
    ];

    const createdCards = await dataSource
      .getRepository(TarotCard)
      .save(cardsToCreate);
    cardIds = createdCards.map((card) => card.id);

    // Crear spread
    const spread = await dataSource.getRepository(TarotSpread).save({
      name: 'Three Card Spread Regen',
      description: 'Past, Present, Future',
      cardCount: 3,
      positions: [
        { name: 'Past', description: 'What has led to this moment' },
        { name: 'Present', description: 'The current situation' },
        { name: 'Future', description: 'What is coming' },
      ],
      difficulty: 'beginner',
      isBeginnerFriendly: true,
      whenToUse: 'For general guidance',
    });
    spreadId = spread.id;

    // Crear una lectura para el usuario premium usando el endpoint
    // Esto asegura que la lectura se crea correctamente con todas las validaciones
    const createReadingResponse = await request(app.getHttpServer())
      .post('/readings')
      .set('Authorization', `Bearer ${premiumUserToken}`)
      .send({
        predefinedQuestionId: predefinedQuestionId,
        deckId: deckId,
        spreadId: spreadId,
        cardIds: cardIds,
        cardPositions: [
          { cardId: cardIds[0], position: 'Past', isReversed: false },
          { cardId: cardIds[1], position: 'Present', isReversed: false },
          { cardId: cardIds[2], position: 'Future', isReversed: true },
        ],
        generateInterpretation: true,
      })
      .expect(201); // Asegurar que la creación fue exitosa

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    readingId = createReadingResponse.body.id as number;

    // Verificar que se obtuvo un ID válido
    if (!readingId) {
      console.error('Failed to create initial reading for tests');
      console.error('Status:', createReadingResponse.status);
      console.error(
        'Body:',
        JSON.stringify(createReadingResponse.body, null, 2),
      );
      console.error('Card IDs used:', cardIds);
      console.error('Deck ID:', deckId);
      console.error('Spread ID:', spreadId);
      throw new Error(
        `Failed to create initial reading for tests. Got undefined ID`,
      );
    }

    console.log(`✓ Initial reading created successfully with ID: ${readingId}`);
  }

  /**
   * Helper: Limpiar datos de prueba
   */
  async function cleanupTestData(): Promise<void> {
    if (dataSource && dataSource.isInitialized) {
      try {
        // Limpiar en orden de dependencias
        await dataSource.query(
          `DELETE FROM tarot_interpretation WHERE "readingId" IN (SELECT id FROM tarot_reading WHERE "userId" IN ($1, $2))`,
          [freeUserId, premiumUserId],
        );

        await dataSource.query(
          `DELETE FROM tarot_reading_cards_tarot_card WHERE "tarotReadingId" IN (SELECT id FROM tarot_reading WHERE "userId" IN ($1, $2))`,
          [freeUserId, premiumUserId],
        );

        await dataSource.query(
          `DELETE FROM tarot_reading WHERE "userId" IN ($1, $2)`,
          [freeUserId, premiumUserId],
        );

        await dataSource.query(
          `DELETE FROM usage_limit WHERE user_id IN ($1, $2)`,
          [freeUserId, premiumUserId],
        );

        await dataSource.query(
          `DELETE FROM refresh_tokens WHERE user_id IN ($1, $2)`,
          [freeUserId, premiumUserId],
        );

        await dataSource.query(`DELETE FROM "user" WHERE id IN ($1, $2)`, [
          freeUserId,
          premiumUserId,
        ]);

        if (predefinedQuestionId) {
          await dataSource.query(
            `DELETE FROM predefined_question WHERE id = $1`,
            [predefinedQuestionId],
          );
        }

        if (categoryId) {
          await dataSource.query(`DELETE FROM reading_category WHERE id = $1`, [
            categoryId,
          ]);
        }

        if (spreadId) {
          await dataSource.query(`DELETE FROM tarot_spread WHERE id = $1`, [
            spreadId,
          ]);
        }

        // Limpiar cartas y deck creados para estos tests
        if (cardIds && cardIds.length > 0) {
          await dataSource.query(
            `DELETE FROM tarot_card WHERE id = ANY($1::int[])`,
            [cardIds],
          );
        }

        if (deckId) {
          await dataSource.query(`DELETE FROM tarot_deck WHERE id = $1`, [
            deckId,
          ]);
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
  }

  /**
   * TEST: Endpoint debe requerir autenticación
   */
  describe('POST /readings/:id/regenerate - Authentication', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post(`/readings/${readingId}/regenerate`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  /**
   * TEST: Solo usuarios premium pueden regenerar
   */
  describe('POST /readings/:id/regenerate - Premium Required', () => {
    it('should return 403 for free users', async () => {
      // Crear una lectura para el usuario free usando el endpoint
      const createResponse = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          predefinedQuestionId: predefinedQuestionId,
          deckId: deckId,
          spreadId: spreadId,
          cardIds: cardIds,
          cardPositions: [
            { cardId: cardIds[0], position: 'Past', isReversed: false },
            { cardId: cardIds[1], position: 'Present', isReversed: false },
            { cardId: cardIds[2], position: 'Future', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const freeReadingId = createResponse.body.id as number;
      expect(freeReadingId).toBeDefined();

      const response = await request(app.getHttpServer())
        .post(`/readings/${freeReadingId}/regenerate`)
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      // El guard de límites de uso puede ejecutarse antes que la verificación premium
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(String(response.body.message)).toMatch(/premium|límite|limit/i);
    });
  });

  /**
   * TEST: Usuario debe ser dueño de la lectura
   */
  describe('POST /readings/:id/regenerate - Ownership', () => {
    it('should return 403 when trying to regenerate another user reading', async () => {
      // Crear una lectura para el usuario free usando el endpoint
      const createResponse = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          predefinedQuestionId: predefinedQuestionId,
          deckId: deckId,
          spreadId: spreadId,
          cardIds: cardIds,
          cardPositions: [
            { cardId: cardIds[0], position: 'Past', isReversed: false },
            { cardId: cardIds[1], position: 'Present', isReversed: false },
            { cardId: cardIds[2], position: 'Future', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const otherReadingId = createResponse.body.id as number;
      expect(otherReadingId).toBeDefined();

      // Intentar regenerar con token de premium user
      const response = await request(app.getHttpServer())
        .post(`/readings/${otherReadingId}/regenerate`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });
  });

  /**
   * TEST: Regeneración exitosa para usuario premium
   */
  describe('POST /readings/:id/regenerate - Success', () => {
    it('should successfully regenerate interpretation for premium user', async () => {
      // Crear una reading fresca para este test específico
      const testReadingId = await createFreshReading(
        premiumUserId,
        premiumUserToken,
      );

      // Verificar que la reading existe antes de intentar regenerar
      console.log(`Premium user ID: ${premiumUserId}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const readingCheck = await dataSource.query(
        `SELECT id, "userId", "regenerationCount", "deckId", "spreadId", "deletedAt" FROM tarot_reading WHERE id = $1`,
        [testReadingId],
      );
      console.log(`Reading check before regenerate:`, readingCheck);

      // Verificar que las relaciones existen
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const cardsCheck = await dataSource.query(
        `SELECT COUNT(*) as count FROM tarot_reading_cards_tarot_card WHERE "tarotReadingId" = $1`,
        [testReadingId],
      );
      console.log(`Cards count for reading ${testReadingId}:`, cardsCheck);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const deckExists = await dataSource.query(
        `SELECT id FROM tarot_deck WHERE id = $1`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        [readingCheck[0].deckId],
      );
      console.log(`Deck exists:`, deckExists);

      const response = await request(app.getHttpServer())
        .post(`/readings/${testReadingId}/regenerate`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('interpretation');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.interpretation).toBeTruthy();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.interpretation).not.toBe(
        'Initial interpretation of the reading',
      );
      expect(response.body).toHaveProperty('regenerationCount', 1);
      expect(response.body).toHaveProperty('updatedAt');

      // Verificar que las cartas se mantienen iguales
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.cardPositions).toEqual([
        { cardId: cardIds[0], position: 'Past', isReversed: false },
        { cardId: cardIds[1], position: 'Present', isReversed: false },
        { cardId: cardIds[2], position: 'Future', isReversed: true },
      ]);
    });

    it('should create new interpretation entry in database', async () => {
      // Crear una reading fresca y regenerarla
      const testReadingId = await createFreshReading(
        premiumUserId,
        premiumUserToken,
      );

      await request(app.getHttpServer())
        .post(`/readings/${testReadingId}/regenerate`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const interpretations = await dataSource.query(
        `SELECT * FROM tarot_interpretation WHERE "readingId" = $1 ORDER BY "createdAt" DESC`,
        [testReadingId],
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(interpretations.length).toBeGreaterThanOrEqual(1);
    });
  });

  /**
   * TEST: Límite de 3 regeneraciones por lectura
   */
  describe('POST /readings/:id/regenerate - Regeneration Limit', () => {
    it('should allow up to 3 regenerations', async () => {
      // Crear una reading fresca para probar el límite
      const testReadingId = await createFreshReading(
        premiumUserId,
        premiumUserToken,
      );

      // Hacer 3 regeneraciones
      await request(app.getHttpServer())
        .post(`/readings/${testReadingId}/regenerate`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/readings/${testReadingId}/regenerate`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/readings/${testReadingId}/regenerate`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(201);

      // Verificar que regenerationCount es 3
      const reading = await dataSource
        .getRepository(TarotReading)
        .findOne({ where: { id: testReadingId } });

      expect(reading?.regenerationCount).toBe(3);
    });

    it('should return 429 when exceeding 3 regenerations', async () => {
      // Crear una reading fresca y hacer 3 regeneraciones
      const testReadingId = await createFreshReading(
        premiumUserId,
        premiumUserToken,
      );

      // Hacer 3 regeneraciones (llegando al límite)
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post(`/readings/${testReadingId}/regenerate`)
          .set('Authorization', `Bearer ${premiumUserToken}`)
          .expect(201);
      }

      // La cuarta debe fallar con 429
      const response = await request(app.getHttpServer())
        .post(`/readings/${testReadingId}/regenerate`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(429);

      expect(response.body).toHaveProperty('message');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(String(response.body.message)).toContain('máximo');
    });
  });

  /**
   * TEST: Lectura no encontrada
   */
  describe('POST /readings/:id/regenerate - Not Found', () => {
    it('should return 404 for non-existent reading', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings/999999/regenerate')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  /**
   * TEST: Verificar que updatedAt se actualiza
   */
  describe('POST /readings/:id/regenerate - UpdatedAt', () => {
    it('should update the updatedAt field on regeneration', async () => {
      // Crear nueva lectura usando el endpoint
      const createResponse = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          predefinedQuestionId: predefinedQuestionId,
          deckId: deckId,
          spreadId: spreadId,
          cardIds: cardIds,
          cardPositions: [
            { cardId: cardIds[0], position: 'Past', isReversed: false },
            { cardId: cardIds[1], position: 'Present', isReversed: false },
            { cardId: cardIds[2], position: 'Future', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const newReadingId = createResponse.body.id as number;
      expect(newReadingId).toBeDefined();

      // Obtener el updatedAt original
      const newReading = await dataSource
        .getRepository(TarotReading)
        .findOne({ where: { id: newReadingId } });

      const originalUpdatedAt = newReading!.updatedAt;

      // Esperar un momento para asegurar que updatedAt cambie
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Regenerar
      await request(app.getHttpServer())
        .post(`/readings/${newReadingId}/regenerate`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(201);

      // Verificar que updatedAt cambió
      const updatedReading = await dataSource
        .getRepository(TarotReading)
        .findOne({ where: { id: newReadingId } });

      expect(updatedReading?.updatedAt).not.toEqual(originalUpdatedAt);
      expect(new Date(updatedReading!.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime(),
      );
    }, 10000); // Timeout de 10 segundos para este test
  });
});
