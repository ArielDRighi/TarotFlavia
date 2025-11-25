import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

// Services
import { UsersService } from '../../src/modules/users/users.service';
import { AuthService } from '../../src/modules/auth/auth.service';

// Entities
import { User, UserPlan } from '../../src/modules/users/entities/user.entity';
import { Tarotista } from '../../src/modules/tarotistas/entities/tarotista.entity';
import { TarotDeck } from '../../src/modules/tarot/decks/entities/tarot-deck.entity';
import { TarotCard } from '../../src/modules/tarot/cards/entities/tarot-card.entity';
import { TarotSpread } from '../../src/modules/tarot/spreads/entities/tarot-spread.entity';

// Helpers
import { setupDefaultTarotista } from '../helpers/setup-default-tarotista';
import {
  UsageLimit,
  UsageFeature,
} from '../../src/modules/usage-limits/entities/usage-limit.entity';

describe('UsageLimits + Readings Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersService: UsersService;
  let authService: AuthService;

  // Test data
  let testUser: User;
  let authToken: string;
  let tarotista: Tarotista;
  let testDeck: TarotDeck;
  let testCards: TarotCard[];
  let testSpread: TarotSpread;

  // Repositories
  let userRepository: any;
  let usageLimitRepository: any;

  const testUserData = {
    password: 'TestPass123!',
    name: 'Usage Limits Test User',
  };

  beforeAll(async () => {
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

    dataSource = moduleFixture.get<DataSource>(DataSource);
    usersService = moduleFixture.get<UsersService>(UsersService);
    authService = moduleFixture.get<AuthService>(AuthService);

    // Inicializar repositorios
    userRepository = dataSource.getRepository(User);
    usageLimitRepository = dataSource.getRepository(UsageLimit);

    // Crear tarotista Flavia por defecto si no existe
    await setupDefaultTarotista(dataSource, usersService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Crear usuario de prueba con email único
    const uniqueEmail = `usage-limits-test-${Date.now()}-${Math.random()}@example.com`;

    const userWithoutPassword = await usersService.create({
      email: uniqueEmail,
      password: testUserData.password,
      name: testUserData.name,
    });

    testUser = (await userRepository.findOne({
      where: { id: userWithoutPassword.id },
    }))!;

    // Cambiar usuario a PREMIUM para permitir customQuestion
    testUser.plan = UserPlan.PREMIUM;
    await userRepository.save(testUser);

    // Buscar tarotista Flavia
    const tarotistaRepo = dataSource.getRepository(Tarotista);
    tarotista = (await tarotistaRepo.findOne({
      where: { nombrePublico: 'Flavia' },
    }))!;

    // Crear suscripción FREE
    const subscriptionRepo = dataSource.getRepository(
      'UserTarotistaSubscription',
    );
    await subscriptionRepo.save({
      userId: testUser.id,
      subscriptionType: 'favorite',
      status: 'active',
      tarotistaId: tarotista.id,
      startDate: new Date(),
    });

    // Obtener auth token
    const loginResponse = await authService.login(
      testUser,
      'test-user-agent',
      '127.0.0.1',
    );
    authToken = loginResponse.access_token;

    // Buscar deck existente
    const deckRepo = dataSource.getRepository(TarotDeck);
    testDeck = (await deckRepo.findOne({ where: {} }))!;

    if (!testDeck) {
      testDeck = await deckRepo.save({
        name: 'Test Deck',
        description: 'Deck for integration tests',
        imageUrl: 'https://example.com/test-deck.png',
        isActive: true,
      });
    }

    // Buscar cartas existentes
    const cardRepo = dataSource.getRepository(TarotCard);
    testCards = await cardRepo.find({ take: 3 });

    if (testCards.length < 3) {
      testCards = await cardRepo.save([
        {
          name: 'The Fool',
          number: 0,
          arcana: 'major',
          category: 'major',
          meaningUpright: 'New beginnings, innocence',
          meaningReversed: 'Recklessness, fear',
          deckId: testDeck.id,
        },
        {
          name: 'The Magician',
          number: 1,
          arcana: 'major',
          category: 'major',
          meaningUpright: 'Manifestation, resourcefulness',
          meaningReversed: 'Manipulation, poor planning',
          deckId: testDeck.id,
        },
        {
          name: 'The High Priestess',
          number: 2,
          arcana: 'major',
          category: 'major',
          meaningUpright: 'Intuition, sacred knowledge',
          meaningReversed: 'Secrets, disconnected from intuition',
          deckId: testDeck.id,
        },
      ]);
    }

    // Buscar spread existente
    const spreadRepo = dataSource.getRepository(TarotSpread);
    testSpread = (await spreadRepo.findOne({ where: {} }))!;

    if (!testSpread) {
      testSpread = await spreadRepo.save({
        name: 'Three Card Spread',
        description: 'Past, Present, Future',
        cardCount: 3,
        positions: [
          { name: 'Past', description: 'What has led to this moment' },
          { name: 'Present', description: 'The current situation' },
          { name: 'Future', description: 'What lies ahead' },
        ],
      });
    }
  });

  afterEach(async () => {
    if (testUser?.id) {
      const readingRepo = dataSource.getRepository('TarotReading');
      await readingRepo.delete({ user: { id: testUser.id } });

      await userRepository.delete({ id: testUser.id });
    }
  });

  describe('Reading Counter Increment', () => {
    it('should increment user reading counter when creating reading', async () => {
      // ARRANGE
      const createReadingPayload = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: testSpread.positions[idx]?.name || `Position ${idx + 1}`,
          isReversed: false,
        })),
        customQuestion: 'Test question for usage limits',
        generateInterpretation: true,
      };

      const userBefore = await userRepository.findOne({
        where: { id: testUser.id },
      });
      const initialCounter = userBefore!.aiRequestsUsedMonth;

      // ACT
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createReadingPayload)
        .expect(201);

      // ASSERT
      const userAfter = await userRepository.findOne({
        where: { id: testUser.id },
      });
      expect(userAfter!.aiRequestsUsedMonth).toBe(initialCounter + 1);
    });

    it('should increment counter multiple times for multiple readings', async () => {
      // ARRANGE
      const createReadingPayload = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: testSpread.positions[idx]?.name || `Position ${idx + 1}`,
          isReversed: false,
        })),
        customQuestion: 'Test question for usage limits',
        generateInterpretation: true,
      };

      // ACT: Crear 3 lecturas
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/readings')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createReadingPayload)
          .expect(201);
      }

      // ASSERT
      const userAfter = await userRepository.findOne({
        where: { id: testUser.id },
      });
      expect(userAfter!.aiRequestsUsedMonth).toBe(3);
    }, 30000); // 30s timeout para 3 lecturas

    it.skip('should enforce daily limit for FREE users (3 readings/day)', async () => {
      // ARRANGE: Cambiar a FREE para este test
      testUser.plan = UserPlan.FREE;
      await userRepository.save(testUser);

      const createReadingPayload = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: testSpread.positions[idx]?.name || `Position ${idx + 1}`,
          isReversed: false,
        })),
        // FREE users no pueden usar customQuestion, omitir
        generateInterpretation: true,
      };

      // ACT: Crear 3 lecturas (límite para FREE)
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/readings')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createReadingPayload)
          .expect(201);
      }

      // ASSERT: La 4ta lectura debe ser rechazada
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createReadingPayload)
        .expect(403);

      expect(response.body.message).toContain('límite diario');
    }, 40000); // 40s timeout para 3 lecturas + 1 rechazo
  });

  describe('Daily Usage Limits', () => {
    it.skip('should track daily usage in usage_limit table', async () => {
      // ARRANGE
      const createReadingPayload = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: testSpread.positions[idx]?.name || `Position ${idx + 1}`,
          isReversed: false,
        })),
        customQuestion: 'Test question for usage limits',
        generateInterpretation: true,
      };

      // ACT
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createReadingPayload)
        .expect(201);

      // ASSERT
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usageRecord = await usageLimitRepository.findOne({
        where: {
          userId: testUser.id,
          feature: UsageFeature.TAROT_READING,
          date: today,
        },
      });

      expect(usageRecord).toBeDefined();
      expect(usageRecord!.count).toBe(1);
    });

    it.skip('should increment daily usage count for multiple readings', async () => {
      // ARRANGE
      const createReadingPayload = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: testSpread.positions[idx]?.name || `Position ${idx + 1}`,
          isReversed: false,
        })),
        customQuestion: 'Test question for usage limits',
        generateInterpretation: true,
      };

      // ACT: Crear 3 lecturas
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/readings')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createReadingPayload)
          .expect(201);
      }

      // ASSERT
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usageRecord = await usageLimitRepository.findOne({
        where: {
          userId: testUser.id,
          feature: UsageFeature.TAROT_READING,
          date: today,
        },
      });

      expect(usageRecord).toBeDefined();
      expect(usageRecord!.count).toBe(3);
    }, 30000); // 30s timeout
  });

  describe('Premium Plan Benefits', () => {
    it('should allow unlimited readings for PREMIUM users', async () => {
      // ARRANGE: Usuario ya es PREMIUM del beforeEach
      const createReadingPayload = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: testSpread.positions[idx]?.name || `Position ${idx + 1}`,
          isReversed: false,
        })),
        customQuestion: 'Test question for usage limits',
        generateInterpretation: true,
      };

      // ACT: Crear 5 lecturas (más del límite FREE de 3)
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/readings')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createReadingPayload)
          .expect(201);
      }

      // ASSERT: Todas deben pasar sin error
      const userAfter = await userRepository.findOne({
        where: { id: testUser.id },
      });
      expect(userAfter!.aiRequestsUsedMonth).toBe(5);
    }, 50000); // 50s timeout para 5 lecturas
  });
});
