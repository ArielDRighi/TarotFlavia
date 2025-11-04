import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { UserPlan } from '../src/modules/users/entities/user.entity';
import { ReadingCategory } from '../src/modules/categories/entities/reading-category.entity';
import { TarotDeck } from '../src/modules/tarot/decks/entities/tarot-deck.entity';
import { TarotSpread } from '../src/modules/tarot/spreads/entities/tarot-spread.entity';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';
import { seedReadingCategories } from '../src/database/seeds/reading-categories.seeder';
import { seedTarotDecks } from '../src/database/seeds/tarot-decks.seeder';
import { seedTarotCards } from '../src/database/seeds/tarot-cards.seeder';
import { seedTarotSpreads } from '../src/database/seeds/tarot-spreads.seeder';
import { seedPredefinedQuestions } from '../src/database/seeds/predefined-questions.seeder';
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
  predefinedQuestionId: number | null;
  customQuestion: string | null;
  questionType: 'predefined' | 'custom';
  [key: string]: unknown;
}

interface ErrorResponse {
  message: string | string[];
  [key: string]: unknown;
}

describe('Readings Hybrid Questions (E2E)', () => {
  let app: INestApplication<App>;
  const dbHelper = new E2EDatabaseHelper();
  let freeUserToken: string;
  let premiumUserToken: string;
  let freeUserId: number;
  let premiumUserId: number;
  let predefinedQuestionId: number;
  let deckId: number;
  let spreadId: number;
  let testTimestamp: number;

  beforeAll(async () => {
    await dbHelper.initialize();
    await dbHelper.cleanDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Seed all necessary data
    const dataSource = dbHelper.getDataSource();
    const categoryRepository = dataSource.getRepository(ReadingCategory);
    const deckRepository = dataSource.getRepository(TarotDeck);
    const cardRepository = dataSource.getRepository('TarotCard');
    const spreadRepository = dataSource.getRepository(TarotSpread);
    const questionRepository = dataSource.getRepository(PredefinedQuestion);

    await seedReadingCategories(categoryRepository);
    await seedTarotDecks(deckRepository);
    await seedTarotCards(cardRepository as any, deckRepository);
    await seedTarotSpreads(dataSource);
    await seedPredefinedQuestions(questionRepository, categoryRepository);

    // Get seeded data for tests

    const questions = await questionRepository.find();
    predefinedQuestionId = questions[0].id;

    const decks = await deckRepository.find();
    deckId = decks[0].id;

    const spreads = await spreadRepository.find();
    spreadId = spreads[0].id;
  });

  beforeAll(async () => {
    // Crear usuarios para pruebas
    testTimestamp = Date.now();

    // Register users via API
    const freeResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `free-${testTimestamp}@test.com`,
        password: 'Test123456!',
        name: 'Free User',
      });
    freeUserToken = (freeResponse.body as LoginResponse).access_token;
    freeUserId = (freeResponse.body as LoginResponse).user.id;

    const premiumResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `premium-${testTimestamp}@test.com`,
        password: 'Test123456!',
        name: 'Premium User',
      });
    premiumUserToken = (premiumResponse.body as LoginResponse).access_token;
    premiumUserId = (premiumResponse.body as LoginResponse).user.id;

    // Update premium user to PREMIUM plan
    const ds = dbHelper.getDataSource();
    await ds.query(`UPDATE "user" SET plan = $1 WHERE id = $2`, [
      UserPlan.PREMIUM,
      premiumUserId,
    ]);
  }, 30000);

  afterEach(async () => {
    // Limpiar solo las readings de este test, no los usuarios
    const ds = dbHelper.getDataSource();
    await ds.query('DELETE FROM tarot_reading WHERE "userId" IN ($1, $2)', [
      freeUserId,
      premiumUserId,
    ]);
  });

  afterAll(async () => {
    // Limpiar usuarios al finalizar todos los tests
    const ds = dbHelper.getDataSource();
    await ds.query('DELETE FROM tarot_reading WHERE "userId" IN ($1, $2)', [
      freeUserId,
      premiumUserId,
    ]);
    await ds.query('DELETE FROM "user" WHERE id IN ($1, $2)', [
      freeUserId,
      premiumUserId,
    ]);
    await dbHelper.close();
    await app.close();
  });

  describe('POST /readings - Usuario FREE', () => {
    it('debe crear lectura con pregunta predefinida (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          predefinedQuestionId: predefinedQuestionId,
          deckId: deckId,
          spreadId: spreadId,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      const body = response.body as ReadingResponse;
      expect(body).toHaveProperty('id');
      expect(body.predefinedQuestionId).toBe(predefinedQuestionId);
      expect(body.customQuestion).toBeNull();
      expect(body.questionType).toBe('predefined');
    });

    it('debe rechazar pregunta custom (403)', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          customQuestion: '¿Cuál es mi propósito en la vida?',
          deckId: deckId,
          spreadId: spreadId,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(403);

      const body = response.body as ErrorResponse;
      expect(body.message).toContain('plan premium');
    });

    it('debe rechazar si no proporciona ninguna pregunta (400)', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          deckId: deckId,
          spreadId: spreadId,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(400);

      const body = response.body as ErrorResponse;
      const messageText = Array.isArray(body.message)
        ? body.message.join(' ')
        : body.message;
      expect(messageText).toContain('pregunta');
    });
  });

  describe('POST /readings - Usuario PREMIUM', () => {
    it('debe crear lectura con pregunta custom (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          customQuestion: '¿Cuál es mi propósito en la vida?',
          deckId: deckId,
          spreadId: spreadId,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      const body = response.body as ReadingResponse;
      expect(body).toHaveProperty('id');
      expect(body.predefinedQuestionId).toBeNull();
      expect(body.customQuestion).toBe('¿Cuál es mi propósito en la vida?');
      expect(body.questionType).toBe('custom');
    });

    it('debe crear lectura con pregunta predefinida también (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          predefinedQuestionId: predefinedQuestionId,
          deckId: deckId,
          spreadId: spreadId,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      const body = response.body as ReadingResponse;
      expect(body).toHaveProperty('id');
      expect(body.predefinedQuestionId).toBe(predefinedQuestionId);
      expect(body.customQuestion).toBeNull();
      expect(body.questionType).toBe('predefined');
    });

    it('debe rechazar si proporciona ambas preguntas (400)', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          predefinedQuestionId: predefinedQuestionId,
          customQuestion: '¿Cuál es mi futuro?',
          deckId: deckId,
          spreadId: spreadId,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(400);

      const body = response.body as ErrorResponse;
      const messageText = Array.isArray(body.message)
        ? body.message.join(' ')
        : body.message;
      expect(messageText).toContain('solo una');
    });
  });
});
