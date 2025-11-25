/**
 * READINGS + INTERPRETATIONS + AI INTEGRATION TESTS
 *
 * Objetivo: Validar la integración entre CreateReadingUseCase, InterpretationsService y AIProviderService
 * Diferencia con E2E: No prueba endpoints HTTP, sino la integración directa de servicios con BD real
 *
 * REGLA DE ORO: Estos tests deben BUSCAR ERRORES REALES, no asumir que todo funciona
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { CreateReadingUseCase } from '../../src/modules/tarot/readings/application/use-cases/create-reading.use-case';
import { UsersService } from '../../src/modules/users/users.service';
import { User } from '../../src/modules/users/entities/user.entity';
import { TarotCard } from '../../src/modules/tarot/cards/entities/tarot-card.entity';
import { TarotSpread } from '../../src/modules/tarot/spreads/entities/tarot-spread.entity';
import { TarotDeck } from '../../src/modules/tarot/decks/entities/tarot-deck.entity';
import { TarotInterpretation } from '../../src/modules/tarot/interpretations/entities/tarot-interpretation.entity';
import { Tarotista } from '../../src/modules/tarotistas/entities/tarotista.entity';
import { setupDefaultTarotista } from '../helpers/setup-default-tarotista';

describe('Readings + Interpretations + AI Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createReadingUseCase: CreateReadingUseCase;
  let usersService: UsersService;

  let testUser: User;
  let testCards: TarotCard[];
  let testSpread: TarotSpread;
  let testDeck: TarotDeck;
  let tarotista: Tarotista;

  const testUserData = {
    email: 'readings-integration-test@example.com',
    password: 'SecurePassword123!',
    name: 'Readings Integration User',
  };

  // Helper para obtener posición de spread de forma segura
  const getPositionName = (idx: number): string => {
    if (testSpread?.positions && testSpread.positions[idx]) {
      return testSpread.positions[idx].name;
    }
    return `Position ${idx + 1}`;
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
    createReadingUseCase =
      moduleFixture.get<CreateReadingUseCase>(CreateReadingUseCase);
    usersService = moduleFixture.get<UsersService>(UsersService);

    // Crear tarotista Flavia por defecto si no existe
    await setupDefaultTarotista(dataSource, usersService);
  });

  afterAll(async () => {
    // Cleanup - use Repository to avoid column name issues
    await app.close();
  });

  beforeEach(async () => {
    // Crear usuario de prueba con email único
    const uniqueEmail = `readings-test-${Date.now()}-${Math.random()}@example.com`;

    const userWithoutPassword = await usersService.create({
      email: uniqueEmail,
      password: testUserData.password,
      name: testUserData.name,
    });

    const userRepo = dataSource.getRepository(User);
    testUser = (await userRepo.findOne({
      where: { id: userWithoutPassword.id },
    }))!;

    // Buscar tarotista Flavia (creada en beforeAll)
    const tarotistaRepo = dataSource.getRepository(Tarotista);
    tarotista = (await tarotistaRepo.findOne({
      where: { nombrePublico: 'Flavia' },
    }))!;

    // Crear suscripción FREE para el usuario con Flavia
    // Esto hace que resolveTarotistaForReading() retorne el ID correcto
    const subscriptionRepo = dataSource.getRepository(
      'UserTarotistaSubscription',
    );
    await subscriptionRepo.save({
      userId: testUser.id,
      subscriptionType: 'favorite', // FREE usa FAVORITE enum
      status: 'active',
      tarotistaId: tarotista.id,
      startDate: new Date(),
    });

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
      // Crear cartas si no existen
      testCards = await cardRepo.save([
        {
          name: 'The Fool',
          number: 0,
          arcana: 'major',
          meaningUpright: 'New beginnings, innocence',
          meaningReversed: 'Recklessness, fear',
          deckId: testDeck.id,
        },
        {
          name: 'The Magician',
          number: 1,
          arcana: 'major',
          meaningUpright: 'Manifestation, resourcefulness',
          meaningReversed: 'Manipulation, poor planning',
          deckId: testDeck.id,
        },
        {
          name: 'The High Priestess',
          number: 2,
          arcana: 'major',
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
    // Limpiar usando repositories para evitar problemas de nombres de columnas
    if (testUser?.id) {
      // Delete readings first (foreign key)
      const readingRepo = dataSource.getRepository('TarotReading');
      await readingRepo.delete({ user: { id: testUser.id } });

      // Delete user
      const userRepo = dataSource.getRepository(User);
      await userRepo.delete({ id: testUser.id });
    }
  });

  describe('Reading Creation with AI Interpretation', () => {
    it('should create reading and generate interpretation with AI', async () => {
      // ARRANGE
      const createReadingDto = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: getPositionName(idx),
          isReversed: false,
        })),
        customQuestion: 'What does the future hold for my career?',
        generateInterpretation: true,
      };

      // ACT
      const reading = await createReadingUseCase.execute(
        testUser,
        createReadingDto,
      );

      // ASSERT
      expect(reading).toBeDefined();
      expect(reading.id).toBeDefined();
      expect(reading.user.id).toBe(testUser.id);
      expect(reading.interpretation).toBeDefined();
      expect(reading.interpretation).not.toBeNull();
      expect(typeof reading.interpretation).toBe('string');
      expect(reading.interpretation!.length).toBeGreaterThan(0);

      // Verify reading is in database using repository
      const readingRepo = dataSource.getRepository('TarotReading');
      const readingFromDb = await readingRepo.findOne({
        where: { id: reading.id },
      });
      expect(readingFromDb).toBeDefined();
      expect(readingFromDb!.interpretation).toBeDefined();
    });

    it('should store interpretation with AI metadata in database', async () => {
      // ARRANGE
      const createReadingDto = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: getPositionName(idx),
          isReversed: false,
        })),
        customQuestion: 'Should I make a career change?',
        generateInterpretation: true,
      };

      // ACT
      await createReadingUseCase.execute(testUser, createReadingDto);

      // ASSERT - Verificar que se guardó metadata de IA
      const interpretations = await dataSource
        .getRepository(TarotInterpretation)
        .find();

      expect(interpretations.length).toBeGreaterThan(0);
      const interpretation = interpretations[0];
      expect(interpretation.content).toBeDefined();
      expect(interpretation.modelUsed).toBeDefined();
      expect(interpretation.aiConfig).toBeDefined();
    });

    it('should create reading without interpretation when generateInterpretation is false', async () => {
      // ARRANGE
      const createReadingDto = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: getPositionName(idx),
          isReversed: false,
        })),
        customQuestion: 'What about love?',
        generateInterpretation: false, // NO interpretation
      };

      // ACT
      const reading = await createReadingUseCase.execute(
        testUser,
        createReadingDto,
      );

      // ASSERT
      expect(reading).toBeDefined();
      expect(reading.id).toBeDefined();
      expect(reading.interpretation).toBeNull();
    });

    it('should link cards correctly to reading', async () => {
      // ARRANGE
      const createReadingDto = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: getPositionName(idx),
          isReversed: false,
        })),
        customQuestion: 'What is my path?',
        generateInterpretation: false,
      };

      // ACT
      const reading = await createReadingUseCase.execute(
        testUser,
        createReadingDto,
      );

      // ASSERT
      expect(reading.cards).toBeDefined();
      expect(reading.cards).toHaveLength(3);
      expect(reading.cardPositions).toHaveLength(3);

      // Verificar que las posiciones están correctas
      reading.cardPositions.forEach((pos, idx) => {
        expect(pos.cardId).toBe(testCards[idx].id);
        expect(pos.position).toBe(getPositionName(idx));
        expect(pos.isReversed).toBe(false);
      });
    });
  });

  describe('Cache Functionality', () => {
    // SKIP: Estos tests requieren AI provider configurado (OpenAI API key)
    // En ambiente de test el AI falla y usa fallback, que no se cachea
    // TODO: Configurar mock de AI provider o API key de test
    it.skip('should cache interpretation for same card combination', async () => {
      // ARRANGE
      const createReadingDto = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: getPositionName(idx),
          isReversed: false,
        })),
        customQuestion: 'What is my destiny?',
        generateInterpretation: true,
      };

      // ACT - Primera lectura (genera caché)
      const reading1 = await createReadingUseCase.execute(
        testUser,
        createReadingDto,
      );

      // ACT - Segunda lectura (debería usar caché)
      const reading2 = await createReadingUseCase.execute(
        testUser,
        createReadingDto,
      );

      // ASSERT
      expect(reading1.interpretation).toBeDefined();
      expect(reading2.interpretation).toBeDefined();

      // Esperar a que el cache se guarde (operación asíncrona)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verificar que el caché fue poblado usando repository
      const cacheRepo = dataSource.getRepository('CachedInterpretation');
      const cacheEntries = await cacheRepo.find();
      expect(cacheEntries.length).toBeGreaterThan(0);
    });

    // SKIP: Mismo motivo que el anterior - requiere AI provider real
    it.skip('should NOT use cache when card positions are different', async () => {
      // ARRANGE - Primera lectura con cartas normales
      const baseDto = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: getPositionName(idx),
          isReversed: false,
        })),
        customQuestion: 'What is my future?',
        generateInterpretation: true,
      };

      // Segunda lectura con cartas invertidas
      const reversedDto = {
        ...baseDto,
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: getPositionName(idx),
          isReversed: true, // REVERSED
        })),
      };

      // ACT
      const reading1 = await createReadingUseCase.execute(testUser, baseDto);
      const reading2 = await createReadingUseCase.execute(
        testUser,
        reversedDto,
      );

      // ASSERT - Las interpretaciones deben ser diferentes
      expect(reading1.interpretation).toBeDefined();
      expect(reading2.interpretation).toBeDefined();
      expect(reading1.interpretation).not.toBe(reading2.interpretation);
    });
  });

  describe('Integration with Tarotista System', () => {
    it('should use tarotista configuration for interpretation', async () => {
      // ARRANGE
      const createReadingDto = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: getPositionName(idx),
          isReversed: false,
        })),
        customQuestion: 'What should I know today?',
        generateInterpretation: true,
      };

      // ACT
      const reading = await createReadingUseCase.execute(
        testUser,
        createReadingDto,
      );

      // ASSERT
      expect(reading.tarotistaId).toBeDefined();
      expect(reading.tarotistaId).toBe(tarotista.id);
      expect(reading.interpretation).toBeDefined();
    });

    it('should record reading for tarotista metrics', async () => {
      // ARRANGE
      const createReadingDto = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: getPositionName(idx),
          isReversed: false,
        })),
        customQuestion: 'Tell me about my journey',
        generateInterpretation: true,
      };

      // ACT
      const reading = await createReadingUseCase.execute(
        testUser,
        createReadingDto,
      );

      // ASSERT
      const readingRepo = dataSource.getRepository('TarotReading');
      const readingFromDb = await readingRepo.findOne({
        where: { id: reading.id },
      });

      expect(readingFromDb!.tarotistaId).toBe(tarotista.id);
    });
  });

  describe('Error Handling', () => {
    it('should fail when spread does not exist', async () => {
      // ARRANGE
      const createReadingDto = {
        spreadId: 99999, // Non-existent
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, _idx) => ({
          cardId: card.id,
          position: 'Position',
          isReversed: false,
        })),
        customQuestion: 'Invalid spread test',
        generateInterpretation: true,
      };

      // ACT & ASSERT
      await expect(
        createReadingUseCase.execute(testUser, createReadingDto),
      ).rejects.toThrow();
    });

    it('should fail when cards do not exist', async () => {
      // ARRANGE
      const createReadingDto = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: [99999, 99998, 99997], // Non-existent
        cardPositions: [
          { cardId: 99999, position: 'Past', isReversed: false },
          { cardId: 99998, position: 'Present', isReversed: false },
          { cardId: 99997, position: 'Future', isReversed: false },
        ],
        customQuestion: 'Invalid cards test',
        generateInterpretation: true,
      };

      // ACT & ASSERT
      await expect(
        createReadingUseCase.execute(testUser, createReadingDto),
      ).rejects.toThrow();
    });

    it('should handle AI provider errors gracefully', async () => {
      // ARRANGE
      const createReadingDto = {
        spreadId: testSpread.id,
        deckId: testDeck.id,
        cardIds: testCards.map((card) => card.id),
        cardPositions: testCards.map((card, idx) => ({
          cardId: card.id,
          position: getPositionName(idx),
          isReversed: false,
        })),
        customQuestion: 'Test AI error handling',
        generateInterpretation: true,
      };

      // ACT - Even if AI fails, reading should be created with fallback
      const reading = await createReadingUseCase.execute(
        testUser,
        createReadingDto,
      );

      // ASSERT
      expect(reading).toBeDefined();
      expect(reading.interpretation).toBeDefined();
      expect(reading.interpretation).not.toBeNull();
      // Should have some interpretation (even if fallback)
      expect(reading.interpretation!.length).toBeGreaterThan(0);
    });
  });
});
