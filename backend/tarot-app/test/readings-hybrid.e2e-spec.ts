import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User, UserPlan } from '../src/modules/users/entities/user.entity';
import { PredefinedQuestion } from '../src/modules/predefined-questions/entities/predefined-question.entity';
import { ReadingCategory } from '../src/modules/categories/entities/reading-category.entity';
import { TarotDeck } from '../src/modules/tarot/decks/entities/tarot-deck.entity';
import { TarotSpread } from '../src/modules/tarot/spreads/entities/tarot-spread.entity';
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
  let dataSource: DataSource;
  let freeUserToken: string;
  let premiumUserToken: string;
  let freeUserId: number;
  let premiumUserId: number;
  let predefinedQuestionId: number;
  let deckId: number;
  let spreadId: number;
  let testTimestamp: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Crear datos de prueba necesarios (se reutilizarán en todos los tests)
    const timestamp = Date.now();
    const category = await dataSource.getRepository(ReadingCategory).save({
      name: `Amor-${timestamp}`,
      slug: `amor-${timestamp}`,
      description: 'Preguntas sobre relaciones',
      icon: '❤️',
      color: '#FF0000',
    });

    const predefinedQuestion = await dataSource
      .getRepository(PredefinedQuestion)
      .save({
        categoryId: category.id,
        questionText: '¿Qué me depara el amor?',
      });
    predefinedQuestionId = predefinedQuestion.id;

    const deck = await dataSource.getRepository(TarotDeck).save({
      name: `Test Deck ${timestamp}`,
      description: 'Deck de prueba',
      imageUrl: 'https://example.com/deck.jpg',
    });
    deckId = deck.id;

    const spread = await dataSource.getRepository(TarotSpread).save({
      name: 'Test Spread',
      description: 'Spread de prueba',
      cardCount: 3,
      positions: [
        { name: 'pasado', description: 'El pasado' },
        { name: 'presente', description: 'El presente' },
        { name: 'futuro', description: 'El futuro' },
      ],
      whenToUse: 'Siempre',
    });
    spreadId = spread.id;
  });

  beforeEach(async () => {
    // Crear usuarios con emails únicos por test
    testTimestamp = Date.now();
    const hashedPassword = await hash('test123', 10);

    const freeUser = await dataSource.getRepository(User).save({
      email: `free-${testTimestamp}@test.com`,
      password: hashedPassword,
      name: 'Free User',
      plan: UserPlan.FREE,
    });
    freeUserId = freeUser.id;

    const premiumUser = await dataSource.getRepository(User).save({
      email: `premium-${testTimestamp}@test.com`,
      password: hashedPassword,
      name: 'Premium User',
      plan: UserPlan.PREMIUM,
    });
    premiumUserId = premiumUser.id;

    // Obtener tokens
    const freeLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `free-${testTimestamp}@test.com`,
        password: 'test123',
      });
    freeUserToken = (freeLoginResponse.body as LoginResponse).access_token;

    const premiumLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `premium-${testTimestamp}@test.com`,
        password: 'test123',
      });
    premiumUserToken = (premiumLoginResponse.body as LoginResponse)
      .access_token;
  });

  afterEach(async () => {
    // Limpiar datos de prueba de este test
    await dataSource.query(
      'DELETE FROM tarot_reading WHERE "userId" IN ($1, $2)',
      [freeUserId, premiumUserId],
    );
    await dataSource.getRepository(User).delete({ id: freeUserId });
    await dataSource.getRepository(User).delete({ id: premiumUserId });
  });

  afterAll(async () => {
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
