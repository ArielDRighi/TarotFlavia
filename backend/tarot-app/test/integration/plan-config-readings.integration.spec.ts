import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

// Services
import { UsersService } from '../../src/modules/users/users.service';
import { AuthOrchestratorService } from '../../src/modules/auth/application/services/auth-orchestrator.service';
import { PlanConfigService } from '../../src/modules/plan-config/plan-config.service';

// Entities
import { User, UserPlan } from '../../src/modules/users/entities/user.entity';
import { Tarotista } from '../../src/modules/tarotistas/entities/tarotista.entity';
import { TarotDeck } from '../../src/modules/tarot/decks/entities/tarot-deck.entity';
import { TarotCard } from '../../src/modules/tarot/cards/entities/tarot-card.entity';
import { TarotSpread } from '../../src/modules/tarot/spreads/entities/tarot-spread.entity';

// Helpers
import { setupDefaultTarotista } from '../helpers/setup-default-tarotista';

/**
 * Integration Tests: PlanConfig + Readings
 * Tests how dynamic plan limits affect reading creation and validation
 * Following TESTING_PHILOSOPHY.md: Finding REAL bugs in limit enforcement
 */
describe('PlanConfig + Readings Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersService: UsersService;
  let authService: AuthOrchestratorService;
  let planConfigService: PlanConfigService;

  // Test data
  let guestUser: User;
  let freeUser: User;
  let premiumUser: User;
  let guestToken: string;
  let freeToken: string;
  let premiumToken: string;
  let tarotista: Tarotista;
  let testDeck: TarotDeck;
  let testCards: TarotCard[];
  let testSpread: TarotSpread;

  // Repositories
  let userRepository: any;
  let planRepository: any;

  const testPassword = 'TestPass123!';

  // Helper function to create reading payload
  const createReadingPayload = (customQuestion?: string) => ({
    ...(customQuestion ? { customQuestion } : { predefinedQuestionId: 1 }), // Use predefined question for non-premium
    deckId: testDeck.id,
    spreadId: testSpread.id,
    cardIds: testCards.map((c) => c.id),
    cardPositions: [
      { cardId: testCards[0].id, position: 'past', isReversed: false },
      { cardId: testCards[1].id, position: 'present', isReversed: false },
      { cardId: testCards[2].id, position: 'future', isReversed: false },
    ],
    generateInterpretation: false,
  });

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
    authService = moduleFixture.get<AuthOrchestratorService>(
      AuthOrchestratorService,
    );
    planConfigService = moduleFixture.get<PlanConfigService>(PlanConfigService);

    // Initialize repositories
    userRepository = dataSource.getRepository(User);
    planRepository = dataSource.getRepository('Plan');

    // Seed plans if they don't exist
    const plansCount = await planRepository.count();
    if (plansCount === 0) {
      const { seedPlans } = await import(
        '../../src/database/seeds/plans.seeder'
      );
      await seedPlans(planRepository);
    }

    // Setup default tarotista
    await setupDefaultTarotista(dataSource, usersService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up previous test data (delete readings first due to FK constraint)
    await dataSource.query(
      'DELETE FROM tarot_reading WHERE "userId" IN (SELECT id FROM "user" WHERE email LIKE $1)',
      ['%plan-config-integration%'],
    );
    await dataSource.query('DELETE FROM "user" WHERE email LIKE $1', [
      '%plan-config-integration%',
    ]);

    // Create GUEST user
    const guestEmail = `guest-${Date.now()}@plan-config-integration.com`;
    const guestUserWithoutPassword = await usersService.create({
      email: guestEmail,
      password: testPassword,
      name: 'Guest User',
    });
    await usersService.updatePlan(guestUserWithoutPassword.id, {
      plan: UserPlan.GUEST,
    });
    guestUser = (await userRepository.findOne({
      where: { id: guestUserWithoutPassword.id },
    }))!;

    // Create FREE user
    const freeEmail = `free-${Date.now()}@plan-config-integration.com`;
    const freeUserWithoutPassword = await usersService.create({
      email: freeEmail,
      password: testPassword,
      name: 'Free User',
    });
    await usersService.updatePlan(freeUserWithoutPassword.id, {
      plan: UserPlan.FREE,
    });
    freeUser = (await userRepository.findOne({
      where: { id: freeUserWithoutPassword.id },
    }))!;

    // Create PREMIUM user
    const premiumEmail = `premium-${Date.now()}@plan-config-integration.com`;
    const premiumUserWithoutPassword = await usersService.create({
      email: premiumEmail,
      password: testPassword,
      name: 'Premium User',
    });
    await usersService.updatePlan(premiumUserWithoutPassword.id, {
      plan: UserPlan.PREMIUM,
    });
    premiumUser = (await userRepository.findOne({
      where: { id: premiumUserWithoutPassword.id },
    }))!;

    // Get auth tokens
    const guestLogin = await authService.login(
      guestUser.id,
      guestUser.email,
      '127.0.0.1',
      'test-user-agent',
    );
    guestToken = guestLogin.access_token;

    const freeLogin = await authService.login(
      freeUser.id,
      freeUser.email,
      '127.0.0.1',
      'test-user-agent',
    );
    freeToken = freeLogin.access_token;

    const premiumLogin = await authService.login(
      premiumUser.id,
      premiumUser.email,
      '127.0.0.1',
      'test-user-agent',
    );
    premiumToken = premiumLogin.access_token;

    // Setup tarotista and subscription
    const tarotistaRepo = dataSource.getRepository(Tarotista);
    tarotista = (await tarotistaRepo.findOne({
      where: { nombrePublico: 'Flavia' },
    }))!;

    const subscriptionRepo = dataSource.getRepository(
      'UserTarotistaSubscription',
    );
    for (const user of [guestUser, freeUser, premiumUser]) {
      await subscriptionRepo.save({
        userId: user.id,
        subscriptionType: 'favorite',
        status: 'active',
        tarotistaId: tarotista.id,
        startDate: new Date(),
      });
    }

    // Setup tarot deck and cards
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

    const cardRepo = dataSource.getRepository(TarotCard);
    testCards = await cardRepo.find({ take: 3 });

    if (testCards.length < 3) {
      testCards = await cardRepo.save([
        {
          name: 'The Fool',
          number: 0,
          arcana: 'major',
          suit: null,
          uprightMeaning: 'New beginnings',
          reversedMeaning: 'Recklessness',
          symbolism: 'A young person on a journey',
          imageUrl: 'https://example.com/fool.png',
          deckId: testDeck.id,
        },
        {
          name: 'The Magician',
          number: 1,
          arcana: 'major',
          suit: null,
          uprightMeaning: 'Manifestation',
          reversedMeaning: 'Manipulation',
          symbolism: 'A figure with tools',
          imageUrl: 'https://example.com/magician.png',
          deckId: testDeck.id,
        },
        {
          name: 'The High Priestess',
          number: 2,
          arcana: 'major',
          suit: null,
          uprightMeaning: 'Intuition',
          reversedMeaning: 'Secrets',
          symbolism: 'A seated figure',
          imageUrl: 'https://example.com/priestess.png',
          deckId: testDeck.id,
        },
      ]);
    }

    const spreadRepo = dataSource.getRepository(TarotSpread);
    testSpread = (await spreadRepo.findOne({ where: {} }))!;

    if (!testSpread) {
      testSpread = await spreadRepo.save({
        name: 'Three Card Spread',
        description: 'Past, Present, Future',
        numberOfCards: 3,
        imageUrl: 'https://example.com/spread.png',
        positions: [
          { position: 1, name: 'Past', description: 'What has been' },
          { position: 2, name: 'Present', description: 'What is' },
          { position: 3, name: 'Future', description: 'What will be' },
        ],
        isActive: true,
      });
    }
  });

  afterEach(async () => {
    // Restore original plan limits after each test to ensure test isolation
    await planRepository.update(
      { planType: UserPlan.GUEST },
      { readingsLimit: 3 },
    );
    await planRepository.update(
      { planType: UserPlan.FREE },
      { readingsLimit: 10 },
    );
  });

  describe('Reading Limits Based on Plan Config', () => {
    it('should enforce GUEST plan limit (3 readings)', async () => {
      const guestPlan = await planConfigService.findByPlanType(UserPlan.GUEST);
      expect(guestPlan.readingsLimit).toBe(3);

      // BUG HUNT: Can GUEST create 3 readings?
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/readings')
          .set('Authorization', `Bearer ${guestToken}`)
          .send(createReadingPayload())
          .expect(201);
      }

      // BUG HUNT: 4th reading should be blocked
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send(createReadingPayload())
        .expect(403);
    }, 10000); // Increased timeout

    it('should enforce FREE plan limit (10 readings)', async () => {
      const freePlan = await planConfigService.findByPlanType(UserPlan.FREE);
      expect(freePlan.readingsLimit).toBe(10);

      // BUG HUNT: Can FREE create 10 readings?
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post('/readings')
          .set('Authorization', `Bearer ${freeToken}`)
          .send(createReadingPayload())
          .expect(201);
      }

      // BUG HUNT: 11th reading should be blocked
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(createReadingPayload())
        .expect(403);
    }, 20000); // Increased timeout for creating 10 readings

    it('should allow unlimited readings for PREMIUM plan', async () => {
      const premiumPlan = await planConfigService.findByPlanType(
        UserPlan.PREMIUM,
      );
      expect(premiumPlan.readingsLimit).toBe(-1);

      // BUG HUNT: Can PREMIUM create more than FREE limit?
      for (let i = 0; i < 15; i++) {
        await request(app.getHttpServer())
          .post('/readings')
          .set('Authorization', `Bearer ${premiumToken}`)
          .send(createReadingPayload('What does the future hold?'))
          .expect(201);
      }
    }, 25000); // Increased timeout for creating 15 readings
  });

  describe('Dynamic Plan Limit Updates - Reading Impact', () => {
    it('should enforce new limits after plan update', async () => {
      // Update FREE plan to have 5 readings instead of 10
      await planRepository.update(
        { planType: UserPlan.FREE },
        { readingsLimit: 5 },
      );

      // BUG HUNT: Are new limits enforced immediately?
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/readings')
          .set('Authorization', `Bearer ${freeToken}`)
          .send(createReadingPayload())
          .expect(201);
      }

      // 6th reading should fail with new limit
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(createReadingPayload())
        .expect(403);

      // Restore original limit
      await planRepository.update(
        { planType: UserPlan.FREE },
        { readingsLimit: 10 },
      );
    }, 15000); // Increased timeout for creating multiple readings

    it('should allow more readings after increasing limit', async () => {
      // Create 3 readings for GUEST (reaches limit)
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/readings')
          .set('Authorization', `Bearer ${guestToken}`)
          .send(createReadingPayload())
          .expect(201);
      }

      // 4th reading fails
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send(createReadingPayload())
        .expect(403);

      // Increase GUEST limit to 5
      await planRepository.update(
        { planType: UserPlan.GUEST },
        { readingsLimit: 5 },
      );

      // BUG HUNT: Can user now create more readings?
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send(createReadingPayload())
        .expect(201);

      // Restore original limit
      await planRepository.update(
        { planType: UserPlan.GUEST },
        { readingsLimit: 3 },
      );
    }, 15000); // Increased timeout for creating multiple readings
  });

  describe('Feature Flags - Custom Questions', () => {
    it('should respect allowCustomQuestions flag', async () => {
      // VERIFY: GUEST should not have allowCustomQuestions
      const guestPlan = await planConfigService.findByPlanType(UserPlan.GUEST);
      expect(guestPlan.allowCustomQuestions).toBe(false);

      // VERIFY: PREMIUM should have allowCustomQuestions
      const premiumPlan = await planConfigService.findByPlanType(
        UserPlan.PREMIUM,
      );
      expect(premiumPlan.allowCustomQuestions).toBe(true);

      // BUG HUNT: Does hasFeature method work correctly?
      const guestHasCustom = await planConfigService.hasFeature(
        UserPlan.GUEST,
        'allowCustomQuestions',
      );
      expect(guestHasCustom).toBe(false);

      const premiumHasCustom = await planConfigService.hasFeature(
        UserPlan.PREMIUM,
        'allowCustomQuestions',
      );
      expect(premiumHasCustom).toBe(true);
    });
  });
});
