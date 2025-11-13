import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TarotDeck } from '../src/modules/tarot/decks/entities/tarot-deck.entity';
import { TarotSpread } from '../src/modules/tarot/spreads/entities/tarot-spread.entity';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';
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

  beforeAll(async () => {
    await dbHelper.initialize();
    // NOTE: NO limpiar base de datos aquí - los seeders ya se ejecutaron en globalSetup

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // NOTE: NO hacer seeding aquí - los seeders ya se ejecutaron en globalSetup
    // Solo obtener IDs de datos existentes
    const dataSource = dbHelper.getDataSource();
    const deckRepository = dataSource.getRepository(TarotDeck);
    const spreadRepository = dataSource.getRepository(TarotSpread);
    const questionRepository = dataSource.getRepository(PredefinedQuestion);

    // Get seeded data for tests
    const questions = await questionRepository.find();
    predefinedQuestionId = questions[0].id;

    const decks = await deckRepository.find();
    deckId = decks[0].id;

    const spreads = await spreadRepository.find();
    spreadId = spreads[0].id;
  });

  beforeAll(async () => {
    // Usar los usuarios seeded del globalSetup en lugar de crear nuevos
    // Los usuarios seeded son: free@test.com, premium@test.com y admin@test.com

    // Login con usuario FREE seeded
    const freeLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'free@test.com',
        password: 'Test123456!',
      })
      .expect(200);

    freeUserToken = (freeLoginResponse.body as LoginResponse).access_token;
    freeUserId = (freeLoginResponse.body as LoginResponse).user.id;

    // Login con usuario PREMIUM seeded
    const premiumLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'premium@test.com',
        password: 'Test123456!',
      })
      .expect(200);

    premiumUserToken = (premiumLoginResponse.body as LoginResponse)
      .access_token;
    premiumUserId = (premiumLoginResponse.body as LoginResponse).user.id;

    // Verificar que obtuvimos los tokens correctamente
    if (!freeUserToken || !premiumUserToken) {
      throw new Error(
        'Failed to obtain authentication tokens from seeded users',
      );
    }
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
    // Limpiar lecturas de los usuarios seeded
    const ds = dbHelper.getDataSource();
    await ds.query('DELETE FROM tarot_reading WHERE "userId" IN ($1, $2)', [
      freeUserId,
      premiumUserId,
    ]);
    // NO eliminar los usuarios porque son seeded y los necesitan otros tests
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
          generateInterpretation: false,
        })
        .expect(201);

      const body = response.body as ReadingResponse;
      expect(body).toHaveProperty('id');
      expect(body.predefinedQuestionId).toBe(predefinedQuestionId);
      expect(body.customQuestion).toBeNull();
      expect(body.questionType).toBe('predefined');
    }, 10000);

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
          generateInterpretation: false,
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
          generateInterpretation: false,
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
          generateInterpretation: false,
        })
        .expect(201);

      const body = response.body as ReadingResponse;
      expect(body).toHaveProperty('id');
      expect(body.predefinedQuestionId).toBeNull();
      expect(body.customQuestion).toBe('¿Cuál es mi propósito en la vida?');
      expect(body.questionType).toBe('custom');
    }, 10000);

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
          generateInterpretation: false,
        })
        .expect(201);

      const body = response.body as ReadingResponse;
      expect(body).toHaveProperty('id');
      expect(body.predefinedQuestionId).toBe(predefinedQuestionId);
      expect(body.customQuestion).toBeNull();
      expect(body.questionType).toBe('predefined');
    }, 10000);

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
          generateInterpretation: false,
        })
        .expect(400);

      const body = response.body as ErrorResponse;
      const messageText = Array.isArray(body.message)
        ? body.message.join(' ')
        : body.message;
      expect(messageText).toContain('solo una');
    });
  });

  describe('Plan upgrade flow (FREE → PREMIUM)', () => {
    it('debe rechazar pregunta custom antes de upgrade, permitirla después de upgrade', async () => {
      // 1. Login como admin para poder actualizar el plan
      const adminLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'Test123456!',
        })
        .expect(200);

      const adminToken = (adminLoginResponse.body as LoginResponse)
        .access_token;

      // 2. Intentar crear lectura con pregunta custom como FREE (debe fallar)
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          customQuestion: '¿Cuál es mi destino?',
          deckId: deckId,
          spreadId: spreadId,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(403);

      // 3. Admin actualiza el plan del usuario FREE a PREMIUM
      await request(app.getHttpServer())
        .patch(`/users/${freeUserId}/plan`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plan: 'premium',
        })
        .expect(200);

      // 4. Usuario FREE debe hacer re-login para obtener nuevo token
      const newLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'free@test.com',
          password: 'Test123456!',
        })
        .expect(200);

      const newToken = (newLoginResponse.body as LoginResponse).access_token;

      // 5. Ahora con el nuevo token (con plan=premium) puede crear lectura con pregunta custom
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${newToken}`)
        .send({
          customQuestion: '¿Cuál es mi destino?',
          deckId: deckId,
          spreadId: spreadId,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      const body = response.body as ReadingResponse;
      expect(body).toHaveProperty('id');
      expect(body.customQuestion).toBe('¿Cuál es mi destino?');
      expect(body.questionType).toBe('custom');

      // 6. Revertir el cambio de plan para no afectar otros tests
      await request(app.getHttpServer())
        .patch(`/users/${freeUserId}/plan`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plan: 'free',
        })
        .expect(200);

      // Actualizar el token FREE para futuros tests
      const revertLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'free@test.com',
          password: 'Test123456!',
        })
        .expect(200);

      freeUserToken = (revertLoginResponse.body as LoginResponse).access_token;
    }, 60000);
  });
});
