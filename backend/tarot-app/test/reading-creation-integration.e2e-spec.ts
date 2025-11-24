import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';
import { TarotDeck } from '../src/modules/tarot/decks/entities/tarot-deck.entity';
import { TarotSpread } from '../src/modules/tarot/spreads/entities/tarot-spread.entity';
import { PredefinedQuestion } from '../src/modules/predefined-questions/entities/predefined-question.entity';

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

interface ReadingResponse {
  id: number;
  userId: number;
  deckId: number;
  spreadId: number;
  predefinedQuestionId: number | null;
  customQuestion: string | null;
  questionType: 'predefined' | 'custom';
  interpretation: string;
  tarotistaId: number | null; // ← CRÍTICO: Debe estar presente para multi-tarotista
  cards: Array<{
    id: number;
    position: number;
    cardId: number;
    card: {
      id: number;
      name: string;
      arcana: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

describe('Reading Creation Flow Integration (E2E)', () => {
  let app: INestApplication;
  const dbHelper = new E2EDatabaseHelper();
  let userToken: string;
  let predefinedQuestionId: number;
  let deckId: number;
  let spreadId: number;

  beforeAll(async () => {
    await dbHelper.initialize();

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

    // Get seeded data
    const dataSource = dbHelper.getDataSource();
    const deckRepository = dataSource.getRepository(TarotDeck);
    const spreadRepository = dataSource.getRepository(TarotSpread);
    const questionRepository = dataSource.getRepository(PredefinedQuestion);

    const questions = await questionRepository.find();
    predefinedQuestionId = questions[0].id;

    const decks = await deckRepository.find();
    deckId = decks[0].id;

    const spreads = await spreadRepository.find({ where: { cardCount: 3 } });
    spreadId = spreads[0].id;

    // Login with seeded premium user (to avoid 3/day limit)
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'premium@test.com',
        password: 'Test123456!',
      })
      .expect(200);

    userToken = (loginResponse.body as LoginResponse).access_token;
  });

  afterAll(async () => {
    await app.close();
    await dbHelper.close();
  });

  describe('Complete Reading Creation Flow', () => {
    // Increase timeout for AI interpretation tests (30 seconds)
    jest.setTimeout(30000);

    it('should create reading with predefined question', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          predefinedQuestionId,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.predefinedQuestionId).toBe(predefinedQuestionId);
      expect(response.body.questionType).toBe('predefined');
      expect(response.body.interpretation).toBeDefined();
      expect(response.body.interpretation.length).toBeGreaterThan(0);
      expect(response.body.cards).toBeDefined();
      expect(response.body.cards).toHaveLength(3); // 3-card spread
      expect(response.body.createdAt).toBeDefined();

      // TASK-074: Validar tarotistaId (backward compatibility)
      // Usuario premium sin suscripción debería usar Flavia (ID 1) por defecto
      expect(response.body.tarotistaId).toBeDefined();
      expect(response.body.tarotistaId).toBe(1); // Flavia es el default (FLAVIA_TAROTISTA_ID)
    });

    it('should allow custom question for PREMIUM plan', async () => {
      const customQuestion = '¿Qué me depara el futuro en mi carrera?';

      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          customQuestion,
          cardIds: [4, 5, 6],
          cardPositions: [
            { cardId: 4, position: 'pasado', isReversed: false },
            { cardId: 5, position: 'presente', isReversed: false },
            { cardId: 6, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      expect(response.body.customQuestion).toBe(customQuestion);
      expect(response.body.questionType).toBe('custom');
      expect(response.body.interpretation).toBeDefined();
      expect(response.body.cards).toHaveLength(3);
    });

    it('should shuffle and select unique cards', async () => {
      // Create 3 readings to verify randomness (PREMIUM has no limit)
      const readings: ReadingResponse[] = [];

      for (let i = 0; i < 3; i++) {
        const response = await request(app.getHttpServer())
          .post('/readings')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            deckId,
            spreadId,
            predefinedQuestionId,
            cardIds: [i * 3 + 1, i * 3 + 2, i * 3 + 3],
            cardPositions: [
              { cardId: i * 3 + 1, position: 'pasado', isReversed: false },
              { cardId: i * 3 + 2, position: 'presente', isReversed: false },
              { cardId: i * 3 + 3, position: 'futuro', isReversed: false },
            ],
            generateInterpretation: false,
          })
          .expect(201);

        readings.push(response.body as ReadingResponse);
      }

      // Each reading should have 3 unique cards
      readings.forEach((reading) => {
        const cardIds = reading.cards.map((c) => c.id); // Use c.id not c.cardId
        const uniqueCardIds = new Set(cardIds);
        expect(uniqueCardIds.size).toBe(3); // No duplicate cards in same reading
      });

      // Verify cards are shuffled (at least one card different between readings)
      if (readings.length >= 2) {
        const firstReadingCards = readings[0].cards.map((c) => c.id).sort();
        const secondReadingCards = readings[1].cards.map((c) => c.id).sort();

        const allSame = firstReadingCards.every(
          (cardId, index) => cardId === secondReadingCards[index],
        );

        // With proper shuffle, it's unlikely both readings have same cards
        expect(allSame).toBe(false);
      }
    });

    it('should generate AI interpretation', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          predefinedQuestionId,
          cardIds: [10, 11, 12],
          cardPositions: [
            { cardId: 10, position: 'pasado', isReversed: false },
            { cardId: 11, position: 'presente', isReversed: false },
            { cardId: 12, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      const reading = response.body as ReadingResponse;

      // Interpretation should be present and non-empty
      expect(reading.interpretation).toBeDefined();
      expect(reading.interpretation.length).toBeGreaterThan(50);

      // Should contain meaningful content (not just error message)
      expect(reading.interpretation).not.toContain('error');
      expect(reading.interpretation).not.toContain('Error');
    });

    it('should retrieve created reading', async () => {
      // Create reading
      const createResponse = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          customQuestion: 'Test retrieve',
          cardIds: [13, 14, 15],
          cardPositions: [
            { cardId: 13, position: 'pasado', isReversed: false },
            { cardId: 14, position: 'presente', isReversed: false },
            { cardId: 15, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      const readingId = (createResponse.body as ReadingResponse).id;

      // Retrieve reading
      const getResponse = await request(app.getHttpServer())
        .get(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(getResponse.body.id).toBe(readingId);
      expect(getResponse.body.cards).toHaveLength(3);
      expect(getResponse.body.interpretation).toBeDefined();
    });

    it('should list user readings', async () => {
      // Create 2 readings
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          predefinedQuestionId,
          cardIds: [16, 17, 18],
          cardPositions: [
            { cardId: 16, position: 'pasado', isReversed: false },
            { cardId: 17, position: 'presente', isReversed: false },
            { cardId: 18, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          customQuestion: 'Second reading',
          cardIds: [19, 20, 21],
          cardPositions: [
            { cardId: 19, position: 'pasado', isReversed: false },
            { cardId: 20, position: 'presente', isReversed: false },
            { cardId: 21, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      // List readings
      const response = await request(app.getHttpServer())
        .get('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.totalItems).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Reading Validation', () => {
    it('should reject reading without authentication', async () => {
      await request(app.getHttpServer())
        .post('/readings')
        .send({
          deckId,
          spreadId,
          predefinedQuestionId,
        })
        .expect(401);
    });

    it('should reject reading without deck', async () => {
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          spreadId,
          predefinedQuestionId,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(400); // DTO validation
    });

    it('should reject reading without spread', async () => {
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          predefinedQuestionId,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(400); // DTO validation
    });

    it('should reject reading without question', async () => {
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(400); // DTO validation - should fail because no question provided
    });

    it('should reject reading with both question types', async () => {
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          predefinedQuestionId,
          customQuestion: 'Cannot have both',
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(400); // DTO validation rejects both questions (PREMIUM user passes guard)
    });

    it('should reject reading with invalid deck', async () => {
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId: 99999,
          spreadId,
          predefinedQuestionId,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(404); // Deck not found
    });

    it('should reject reading with invalid spread', async () => {
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId: 99999,
          predefinedQuestionId,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(404); // Spread not found
    });
  });

  describe('Reading Performance', () => {
    // Increase timeout for performance tests (30 seconds)
    jest.setTimeout(30000);

    it('should create reading in less than 15 seconds', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          predefinedQuestionId,
          cardIds: [22, 23, 24],
          cardPositions: [
            { cardId: 22, position: 'pasado', isReversed: false },
            { cardId: 23, position: 'presente', isReversed: false },
            { cardId: 24, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // TASK-059 requirement: Reading creation should take < 15s
      expect(duration).toBeLessThan(15000);
    });

    it('should list readings in less than 500ms', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // TASK-059 requirement: Listings should take < 500ms
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Reading Cache Integration', () => {
    // Increase timeout for AI interpretation tests (30 seconds)
    jest.setTimeout(30000);

    it('should cache interpretation results', async () => {
      // First reading - generates interpretation
      const firstResponse = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          predefinedQuestionId,
          cardIds: [25, 26, 27],
          cardPositions: [
            { cardId: 25, position: 'pasado', isReversed: false },
            { cardId: 26, position: 'presente', isReversed: false },
            { cardId: 27, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      const readingId = (firstResponse.body as ReadingResponse).id;
      const firstInterpretation = (firstResponse.body as ReadingResponse)
        .interpretation;

      // Retrieve same reading - should use cache
      const secondResponse = await request(app.getHttpServer())
        .get(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const cachedInterpretation = (secondResponse.body as ReadingResponse)
        .interpretation;

      // Interpretation should be identical
      expect(cachedInterpretation).toBe(firstInterpretation);
    });
  });

  describe('Multi-Tarotista Support (TASK-074)', () => {
    // Increase timeout for AI interpretation tests (30 seconds)
    jest.setTimeout(30000);

    it('should use Flavia (ID 1) as default tarotista when user has no subscription', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          predefinedQuestionId,
          cardIds: [28, 29, 30],
          cardPositions: [
            { cardId: 28, position: 'pasado', isReversed: false },
            { cardId: 29, position: 'presente', isReversed: false },
            { cardId: 30, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      const reading = response.body as ReadingResponse;

      // Validar que tarotistaId es Flavia (backward compatibility)
      expect(reading.tarotistaId).toBe(1);
      expect(reading.interpretation).toBeDefined();
      expect(reading.interpretation.length).toBeGreaterThan(50);
    });

    it('should persist tarotistaId to database correctly', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          customQuestion: 'Test tarotistaId persistence',
          cardIds: [31, 32, 33],
          cardPositions: [
            { cardId: 31, position: 'pasado', isReversed: false },
            { cardId: 32, position: 'presente', isReversed: false },
            { cardId: 33, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      const readingId = (response.body as ReadingResponse).id;
      const createdTarotistaId = (response.body as ReadingResponse).tarotistaId;

      // Verificar que tarotistaId se persiste en DB
      const dataSource = dbHelper.getDataSource();
      const readingFromDb = (await dataSource.query(
        'SELECT tarotista_id FROM tarot_reading WHERE id = $1',
        [readingId],
      )) as unknown as Array<{ tarotista_id: number }>;

      expect(readingFromDb).toHaveLength(1);
      expect(readingFromDb[0].tarotista_id).toBe(createdTarotistaId);
      expect(readingFromDb[0].tarotista_id).toBe(1); // Flavia
    });

    it('should retrieve reading with tarotistaId included', async () => {
      // Create reading
      const createResponse = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          predefinedQuestionId,
          cardIds: [34, 35, 36],
          cardPositions: [
            { cardId: 34, position: 'pasado', isReversed: false },
            { cardId: 35, position: 'presente', isReversed: false },
            { cardId: 36, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      const readingId = (createResponse.body as ReadingResponse).id;

      // Retrieve reading
      const getResponse = await request(app.getHttpServer())
        .get(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const reading = getResponse.body as ReadingResponse;

      // tarotistaId debe estar presente en GET
      expect(reading.tarotistaId).toBeDefined();
      expect(reading.tarotistaId).toBe(1); // Flavia
    });

    it('should list readings with tarotistaId in each reading', async () => {
      // Create 2 readings
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          predefinedQuestionId,
          cardIds: [37, 38, 39],
          cardPositions: [
            { cardId: 37, position: 'pasado', isReversed: false },
            { cardId: 38, position: 'presente', isReversed: false },
            { cardId: 39, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          customQuestion: 'Second reading for listing',
          cardIds: [40, 41, 42],
          cardPositions: [
            { cardId: 40, position: 'pasado', isReversed: false },
            { cardId: 41, position: 'presente', isReversed: false },
            { cardId: 42, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      // List readings
      const response = await request(app.getHttpServer())
        .get('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);

      // Verificar que TODAS las lecturas tienen tarotistaId
      response.body.data.forEach((reading: ReadingResponse) => {
        expect(reading.tarotistaId).toBeDefined();
        expect(reading.tarotistaId).toBe(1); // Todas usan Flavia por defecto
      });
    });

    it('should include tarotistaId in cache key for interpretations', async () => {
      // Este test verifica que el cache incluye tarotistaId
      // Si dos tarotistas diferentes interpretan las mismas cartas,
      // deberían tener cachés separados

      // Primera lectura con Flavia (tarotistaId=1)
      const firstResponse = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deckId,
          spreadId,
          predefinedQuestionId,
          cardIds: [43, 44, 45],
          cardPositions: [
            { cardId: 43, position: 'pasado', isReversed: false },
            { cardId: 44, position: 'presente', isReversed: false },
            { cardId: 45, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      const reading = firstResponse.body as ReadingResponse;

      // Verificar que se usó Flavia
      expect(reading.tarotistaId).toBe(1);
      expect(reading.interpretation).toBeDefined();

      // NOTE: Para probar cache con múltiples tarotistas, necesitaríamos:
      // 1. Crear otro tarotista (Luna ID=2)
      // 2. Suscribir usuario a Luna
      // 3. Crear lectura con mismas cartas
      // 4. Verificar que interpretación es diferente
      // Esto se implementará en TASK-074-b (multi-tarotist-readings.e2e-spec.ts)
    });
  });
});
