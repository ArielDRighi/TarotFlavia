import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateReadingUseCase } from './create-reading.use-case';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';
import { DeckShufflerService } from '../services/deck-shuffler.service';
import { InterpretationsService } from '../../../interpretations/interpretations.service';
import { CardsService } from '../../../cards/cards.service';
import { SpreadsService } from '../../../spreads/spreads.service';
import { DecksService } from '../../../decks/decks.service';
import { PredefinedQuestionsService } from '../../../../predefined-questions/predefined-questions.service';
import { SubscriptionsService } from '../../../../subscriptions/subscriptions.service';
import { RevenueCalculationService } from '../../../../tarotistas/services/revenue-calculation.service';
import { CardFreeInterpretationService } from '../../../cards/card-free-interpretation.service';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { User, UserPlan } from '../../../../users/entities/user.entity';
import { CreateReadingDto } from '../../dto/create-reading.dto';
import { TarotDeck } from '../../../decks/entities/tarot-deck.entity';
import { TarotSpread } from '../../../spreads/entities/tarot-spread.entity';
import { PredefinedQuestion } from '../../../../predefined-questions/entities/predefined-question.entity';
import { TarotCard } from '../../../cards/entities/tarot-card.entity';

describe('CreateReadingUseCase', () => {
  let useCase: CreateReadingUseCase;
  let readingRepo: jest.Mocked<IReadingRepository>;
  let validator: jest.Mocked<ReadingValidatorService>;
  let deckShuffler: jest.Mocked<DeckShufflerService>;
  let interpretationsService: jest.Mocked<InterpretationsService>;
  let cardsService: jest.Mocked<CardsService>;
  let spreadsService: jest.Mocked<SpreadsService>;
  let decksService: jest.Mocked<DecksService>;
  let predefinedQuestionsService: jest.Mocked<PredefinedQuestionsService>;
  let subscriptionsService: jest.Mocked<SubscriptionsService>;
  let cardFreeInterpretationService: jest.Mocked<CardFreeInterpretationService>;

  const mockUser: User = {
    id: 100,
    email: 'test@example.com',
    plan: UserPlan.PREMIUM,
  } as User;

  const mockFreeUser: User = {
    id: 200,
    email: 'free@example.com',
    plan: UserPlan.FREE,
  } as User;

  const mockDeck = { id: 1, name: 'Test Deck' } as unknown as TarotDeck;

  const mockSpread = {
    id: 1,
    name: 'Test Spread',
    requiredPlan: UserPlan.FREE,
    cardCount: 3,
    positions: [
      { name: 'Pasado', description: 'Pasado' },
      { name: 'Presente', description: 'Presente' },
      { name: 'Futuro', description: 'Futuro' },
    ],
  } as unknown as TarotSpread;

  // Cartas que el backend "reparte" tras mezclar (identidad decidida server-side)
  const mockCards = [
    { id: 1, name: 'Card 1', category: 'arcanos_mayores' },
    { id: 2, name: 'Card 2', category: 'arcanos_mayores' },
    { id: 3, name: 'Card 3', category: 'arcanos_mayores' },
  ] as unknown as TarotCard[];

  // Posiciones esperadas: cartas sorteadas asignadas a las posiciones del spread,
  // con isReversed=false (decideReversed mockeado a false por defecto).
  const expectedCardPositions = [
    { cardId: 1, position: 'Pasado', isReversed: false },
    { cardId: 2, position: 'Presente', isReversed: false },
    { cardId: 3, position: 'Futuro', isReversed: false },
  ];

  // Nuevo contrato: el cliente ya NO envía la identidad de las cartas.
  const mockDto: CreateReadingDto = {
    deckId: 1,
    spreadId: 1,
    customQuestion: 'What is my future?',
    useAI: false,
  };

  const mockDtoFree: CreateReadingDto = {
    deckId: 1,
    spreadId: 1,
    useAI: false,
  };

  const createMockReading = (
    overrides: Partial<TarotReading> = {},
  ): TarotReading =>
    ({
      id: 1,
      question: 'Test',
      predefinedQuestionId: null,
      predefinedQuestion: null,
      customQuestion: mockDto.customQuestion,
      questionType: 'custom',
      user: mockUser,
      deck: mockDeck,
      tarotista: null,
      tarotistaId: 1,
      category: null,
      cards: mockCards,
      cardPositions: expectedCardPositions,
      interpretation: null,
      freeInterpretations: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      regenerationCount: 0,
      interpretations: [],
      sharedToken: null,
      isPublic: false,
      viewCount: 0,
      deletedAt: undefined,
      ...overrides,
    }) as TarotReading;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReadingUseCase,
        {
          provide: 'IReadingRepository',
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ReadingValidatorService,
          useValue: {
            validateUser: jest.fn(),
            validateSpreadAccess: jest.fn(),
            validateCategoryAccess: jest.fn(),
            validateDeckAccess: jest.fn(),
          },
        },
        {
          provide: DeckShufflerService,
          useValue: {
            shuffle: jest.fn(),
            draw: jest.fn(),
            decideReversed: jest.fn(),
          },
        },
        {
          provide: InterpretationsService,
          useValue: {
            generateInterpretation: jest.fn(),
          },
        },
        {
          provide: CardsService,
          useValue: {
            findByIds: jest.fn(),
            findByDeck: jest.fn(),
          },
        },
        {
          provide: SpreadsService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: DecksService,
          useValue: {
            findDeckById: jest.fn(),
          },
        },
        {
          provide: PredefinedQuestionsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: SubscriptionsService,
          useValue: {
            resolveTarotistaForReading: jest.fn().mockResolvedValue(1), // Default to Flavia
            getSubscriptionInfo: jest.fn().mockResolvedValue({
              subscriptionType: 'favorite',
              tarotistaId: 1,
              status: 'active',
            }),
          },
        },
        {
          provide: RevenueCalculationService,
          useValue: {
            calculateRevenue: jest.fn().mockResolvedValue({
              totalRevenueUsd: 1.0,
              revenueShareUsd: 0.7,
              platformFeeUsd: 0.3,
              commissionPercentage: 30,
            }),
            recordRevenue: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: CardFreeInterpretationService,
          useValue: {
            findByCardsAndCategory: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateReadingUseCase>(CreateReadingUseCase);
    readingRepo = module.get('IReadingRepository');
    validator = module.get(ReadingValidatorService);
    deckShuffler = module.get(DeckShufflerService);
    interpretationsService = module.get(InterpretationsService);
    cardsService = module.get(CardsService);
    spreadsService = module.get(SpreadsService);
    decksService = module.get(DecksService);
    predefinedQuestionsService = module.get(PredefinedQuestionsService);
    subscriptionsService = module.get(SubscriptionsService);
    cardFreeInterpretationService = module.get(CardFreeInterpretationService);

    // Defaults del sorteo server-side: pool completo, reparte mockCards, orientación normal.
    cardsService.findByDeck.mockResolvedValue(mockCards);
    deckShuffler.draw.mockReturnValue(mockCards);
    deckShuffler.decideReversed.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - without interpretation', () => {
    it('should create reading successfully with custom question', async () => {
      const mockReading = createMockReading();
      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);

      const result = await useCase.execute(mockUser, mockDto);

      expect(validator.validateUser).toHaveBeenCalledWith(mockUser.id);
      expect(
        subscriptionsService.resolveTarotistaForReading,
      ).toHaveBeenCalledWith(mockUser.id);
      expect(decksService.findDeckById).toHaveBeenCalledWith(1);
      expect(spreadsService.findById).toHaveBeenCalledWith(1);
      expect(cardsService.findByDeck).toHaveBeenCalledWith(1);
      expect(deckShuffler.draw).toHaveBeenCalledWith(
        mockCards,
        mockSpread.cardCount,
      );
      expect(readingRepo.create).toHaveBeenCalledWith({
        predefinedQuestionId: null,
        customQuestion: mockDto.customQuestion,
        questionType: 'custom',
        user: mockUser,
        tarotistaId: 1,
        spreadId: 1,
        spreadName: 'Test Spread',
        deck: mockDeck,
        cards: mockCards,
        cardPositions: expectedCardPositions,
        interpretation: null,
      });
      expect(result).toEqual(mockReading);
    });

    it('should create reading with predefined question', async () => {
      const dtoWithPredefined: CreateReadingDto = {
        ...mockDto,
        predefinedQuestionId: 5,
        customQuestion: undefined,
        useAI: false,
      };
      const mockReading = createMockReading({
        predefinedQuestionId: 5,
        customQuestion: null,
        questionType: 'predefined',
      });

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);

      const result = await useCase.execute(mockUser, dtoWithPredefined);

      expect(readingRepo.create).toHaveBeenCalledWith({
        predefinedQuestionId: 5,
        customQuestion: null,
        questionType: 'predefined',
        user: mockUser,
        tarotistaId: 1,
        spreadId: 1,
        spreadName: 'Test Spread',
        deck: mockDeck,
        cards: mockCards,
        cardPositions: expectedCardPositions,
        interpretation: null,
      });
      expect(result).toEqual(mockReading);
    });

    it('should throw NotFoundException when deck not found', async () => {
      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(null as unknown as TarotDeck);

      await expect(useCase.execute(mockUser, mockDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(mockUser, mockDto)).rejects.toThrow(
        'Deck with ID 1 not found',
      );
      expect(spreadsService.findById).not.toHaveBeenCalled();
      expect(readingRepo.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when spread not found', async () => {
      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(null as unknown as TarotSpread);

      await expect(useCase.execute(mockUser, mockDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(mockUser, mockDto)).rejects.toThrow(
        'Spread with ID 1 not found',
      );
      expect(cardsService.findByDeck).not.toHaveBeenCalled();
      expect(readingRepo.create).not.toHaveBeenCalled();
    });

    it('should propagate validation errors from validator', async () => {
      validator.validateUser.mockRejectedValue(
        new Error('User validation failed'),
      );

      await expect(useCase.execute(mockUser, mockDto)).rejects.toThrow(
        'User validation failed',
      );
      expect(decksService.findDeckById).not.toHaveBeenCalled();
    });

    it('should propagate errors from repository create', async () => {
      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(mockUser, mockDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('mezcla server-side (T-PROD-006)', () => {
    it('reparte cartas mezcladas por el backend, no las que envía el cliente', async () => {
      // Un cliente malicioso inyecta cardIds; el contrato ya no los reconoce.
      const maliciousDto = {
        ...mockDto,
        cardIds: [77, 78, 79],
      } as unknown as CreateReadingDto;

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(createMockReading());

      await useCase.execute(mockUser, maliciousDto);

      // Nunca se cargan cartas por id enviado por el cliente.
      expect(cardsService.findByIds).not.toHaveBeenCalled();
      // Las cartas persistidas son las sorteadas por el backend (ids 1,2,3).
      expect(readingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ cards: mockCards }),
      );
    });

    it('asigna la orientación (isReversed) que decide el backend', async () => {
      deckShuffler.decideReversed
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(createMockReading());

      await useCase.execute(mockUser, mockDto);

      expect(readingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cardPositions: [
            { cardId: 1, position: 'Pasado', isReversed: true },
            { cardId: 2, position: 'Presente', isReversed: false },
            { cardId: 3, position: 'Futuro', isReversed: true },
          ],
        }),
      );
    });

    it('vuelve a barajar en cada lectura (variabilidad entre tiradas)', async () => {
      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(createMockReading());

      await useCase.execute(mockUser, mockDto);
      await useCase.execute(mockUser, mockDto);

      expect(deckShuffler.draw).toHaveBeenCalledTimes(2);
    });

    it('para usuarios FREE solo baraja Arcanos Mayores (nunca un Arcano Menor)', async () => {
      const mixedPool = [
        { id: 1, category: 'arcanos_mayores' },
        { id: 2, category: 'arcanos_mayores' },
        { id: 3, category: 'arcanos_mayores' },
        { id: 40, category: 'copas' },
        { id: 50, category: 'bastos' },
      ] as unknown as TarotCard[];

      validator.validateUser.mockResolvedValue(mockFreeUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      cardsService.findByDeck.mockResolvedValue(mixedPool);
      deckShuffler.draw.mockReturnValue([
        mixedPool[0],
        mixedPool[1],
        mixedPool[2],
      ]);
      readingRepo.create.mockResolvedValue(
        createMockReading({ user: mockFreeUser }),
      );

      await useCase.execute(mockFreeUser, mockDtoFree);

      const poolArg = deckShuffler.draw.mock.calls[0][0] as TarotCard[];
      expect(poolArg).toHaveLength(3);
      expect(poolArg.every((c) => c.category === 'arcanos_mayores')).toBe(true);
    });

    it('para usuarios PREMIUM baraja el mazo completo (sin filtrar Arcanos Menores)', async () => {
      const fullPool = [
        { id: 1, category: 'arcanos_mayores' },
        { id: 2, category: 'arcanos_mayores' },
        { id: 3, category: 'arcanos_mayores' },
        { id: 40, category: 'copas' },
        { id: 50, category: 'bastos' },
      ] as unknown as TarotCard[];

      validator.validateUser.mockResolvedValue(mockUser); // PREMIUM
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      cardsService.findByDeck.mockResolvedValue(fullPool);
      deckShuffler.draw.mockReturnValue([
        fullPool[0],
        fullPool[3],
        fullPool[4],
      ]);
      readingRepo.create.mockResolvedValue(createMockReading());

      await useCase.execute(mockUser, mockDto);

      const poolArg = deckShuffler.draw.mock.calls[0][0] as TarotCard[];
      expect(poolArg).toHaveLength(fullPool.length);
    });

    it('lanza error si el pool no alcanza para la cantidad de cartas de la tirada', async () => {
      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue({
        ...mockSpread,
        cardCount: 5,
      } as unknown as TarotSpread);
      cardsService.findByDeck.mockResolvedValue(mockCards); // solo 3

      await expect(useCase.execute(mockUser, mockDto)).rejects.toThrow();
      expect(readingRepo.create).not.toHaveBeenCalled();
    });

    it('usa un nombre de posición por defecto cuando el spread tiene menos posiciones que cartas', async () => {
      const spreadWithFewerPositions = {
        ...mockSpread,
        cardCount: 3,
        positions: [{ name: 'Pasado', description: 'Pasado' }], // solo 1 posición
      } as unknown as TarotSpread;

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(spreadWithFewerPositions);
      readingRepo.create.mockResolvedValue(createMockReading());

      await useCase.execute(mockUser, mockDto);

      expect(readingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cardPositions: [
            { cardId: 1, position: 'Pasado', isReversed: false },
            { cardId: 2, position: 'Posición 2', isReversed: false },
            { cardId: 3, position: 'Posición 3', isReversed: false },
          ],
        }),
      );
    });
  });

  describe('execute - with interpretation', () => {
    const dtoWithInterpretation: CreateReadingDto = {
      ...mockDto,
      useAI: true,
    };

    it('should generate interpretation for custom question', async () => {
      const mockReading = createMockReading();
      const mockUpdatedReading = createMockReading({
        interpretation: 'AI generated interpretation',
      });

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);
      interpretationsService.generateInterpretation.mockResolvedValue({
        interpretation: 'AI generated interpretation',
        fromCache: false,
      });
      readingRepo.update.mockResolvedValue(mockUpdatedReading);

      const result = await useCase.execute(mockUser, dtoWithInterpretation);

      expect(
        interpretationsService.generateInterpretation,
      ).toHaveBeenCalledWith(
        mockCards,
        expectedCardPositions,
        mockDto.customQuestion,
        mockSpread,
        undefined,
        mockUser.id,
        mockReading.id,
        1,
      );
      expect(readingRepo.update).toHaveBeenCalledWith(mockReading.id, {
        interpretation: 'AI generated interpretation',
      });
      expect(result).toEqual(mockUpdatedReading);
    });

    it('should generate interpretation for predefined question', async () => {
      const dtoWithPredefined: CreateReadingDto = {
        ...mockDto,
        predefinedQuestionId: 5,
        customQuestion: undefined,
        useAI: true,
      };
      const mockReading = createMockReading({
        predefinedQuestionId: 5,
        customQuestion: null,
      });
      const mockPredefinedQuestion = {
        id: 5,
        questionText: 'What does the future hold?',
      } as unknown as PredefinedQuestion;
      const mockUpdatedReading = createMockReading({
        interpretation: 'AI interpretation',
      });

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);
      predefinedQuestionsService.findOne.mockResolvedValue(
        mockPredefinedQuestion,
      );
      interpretationsService.generateInterpretation.mockResolvedValue({
        interpretation: 'AI interpretation',
        fromCache: false,
      });
      readingRepo.update.mockResolvedValue(mockUpdatedReading);

      const result = await useCase.execute(mockUser, dtoWithPredefined);

      expect(predefinedQuestionsService.findOne).toHaveBeenCalledWith(5);
      expect(
        interpretationsService.generateInterpretation,
      ).toHaveBeenCalledWith(
        mockCards,
        expectedCardPositions,
        'What does the future hold?',
        mockSpread,
        undefined,
        mockUser.id,
        mockReading.id,
        1,
      );
      expect(result).toEqual(mockUpdatedReading);
    });

    it('should handle cached interpretation', async () => {
      const mockReading = createMockReading();
      const mockUpdatedReading = createMockReading({
        interpretation: 'Cached interpretation',
      });

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);
      interpretationsService.generateInterpretation.mockResolvedValue({
        interpretation: 'Cached interpretation',
        fromCache: true,
        cacheHitRate: 75.5,
      });
      readingRepo.update.mockResolvedValue(mockUpdatedReading);

      const result = await useCase.execute(mockUser, dtoWithInterpretation);

      expect(result).toEqual(mockUpdatedReading);
    });

    it('should handle interpretation generation failure gracefully', async () => {
      const mockReading = createMockReading();
      const mockFallbackReading = createMockReading({
        interpretation:
          'No se pudo generar la interpretación automáticamente. El error ha sido registrado. Por favor, intenta regenerar más tarde.',
      });

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);
      interpretationsService.generateInterpretation.mockRejectedValue(
        new Error('AI service unavailable'),
      );
      readingRepo.update.mockResolvedValue(mockFallbackReading);

      const result = await useCase.execute(mockUser, dtoWithInterpretation);

      expect(readingRepo.update).toHaveBeenCalledWith(mockReading.id, {
        interpretation:
          'No se pudo generar la interpretación automáticamente. El error ha sido registrado. Por favor, intenta regenerar más tarde.',
      });
      expect(result).toEqual(mockFallbackReading);
    });

    it('should handle predefinedQuestion not found error', async () => {
      const dtoWithPredefined: CreateReadingDto = {
        ...mockDto,
        predefinedQuestionId: 999,
        customQuestion: undefined,
        useAI: true,
      };
      const mockReading = createMockReading();
      const mockFallbackReading = createMockReading({
        interpretation:
          'No se pudo generar la interpretación automáticamente. El error ha sido registrado. Por favor, intenta regenerar más tarde.',
      });

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);
      predefinedQuestionsService.findOne.mockResolvedValue(
        null as unknown as PredefinedQuestion,
      );
      readingRepo.update.mockResolvedValue(mockFallbackReading);

      const result = await useCase.execute(mockUser, dtoWithPredefined);

      expect(result.interpretation).toBe(
        'No se pudo generar la interpretación automáticamente. El error ha sido registrado. Por favor, intenta regenerar más tarde.',
      );
      expect(readingRepo.update).toHaveBeenCalledWith(mockReading.id, {
        interpretation:
          'No se pudo generar la interpretación automáticamente. El error ha sido registrado. Por favor, intenta regenerar más tarde.',
      });
    });

    it('should handle update failure after successful interpretation', async () => {
      const mockReading = createMockReading();

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);
      interpretationsService.generateInterpretation.mockResolvedValue({
        interpretation: 'AI generated',
        fromCache: false,
      });
      readingRepo.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        useCase.execute(mockUser, dtoWithInterpretation),
      ).rejects.toThrow('Update failed');
    });
  });

  describe('useAI flag - dual flow (TASK-005)', () => {
    describe('when useAI is false', () => {
      it('should create reading without AI interpretation', async () => {
        const dtoWithoutAI: CreateReadingDto = {
          ...mockDto,
          useAI: false,
        };
        const mockReading = createMockReading({ interpretation: null });

        validator.validateUser.mockResolvedValue(mockUser);
        decksService.findDeckById.mockResolvedValue(mockDeck);
        spreadsService.findById.mockResolvedValue(mockSpread);
        readingRepo.create.mockResolvedValue(mockReading);

        const result = await useCase.execute(mockUser, dtoWithoutAI);

        expect(
          interpretationsService.generateInterpretation,
        ).not.toHaveBeenCalled();
        expect(result.interpretation).toBeNull();
        expect(readingRepo.create).toHaveBeenCalledWith({
          predefinedQuestionId: null,
          customQuestion: mockDto.customQuestion,
          questionType: 'custom',
          user: mockUser,
          tarotistaId: 1,
          spreadId: 1,
          spreadName: 'Test Spread',
          deck: mockDeck,
          cards: mockCards,
          cardPositions: expectedCardPositions,
          interpretation: null,
        });
      });

      it('should return only card information from database when useAI is false', async () => {
        const dtoWithoutAI: CreateReadingDto = {
          ...mockDto,
          useAI: false,
        };
        const mockReading = createMockReading({
          interpretation: null,
          cards: mockCards,
        });

        validator.validateUser.mockResolvedValue(mockUser);
        decksService.findDeckById.mockResolvedValue(mockDeck);
        spreadsService.findById.mockResolvedValue(mockSpread);
        readingRepo.create.mockResolvedValue(mockReading);

        const result = await useCase.execute(mockUser, dtoWithoutAI);

        expect(result.cards).toEqual(mockCards);
        expect(result.interpretation).toBeNull();
        expect(cardsService.findByDeck).toHaveBeenCalledWith(1);
      });

      it('should still increment usage counter when useAI is false', async () => {
        const dtoWithoutAI: CreateReadingDto = {
          ...mockDto,
          useAI: false,
        };
        const mockReading = createMockReading();

        validator.validateUser.mockResolvedValue(mockUser);
        decksService.findDeckById.mockResolvedValue(mockDeck);
        spreadsService.findById.mockResolvedValue(mockSpread);
        readingRepo.create.mockResolvedValue(mockReading);

        await useCase.execute(mockUser, dtoWithoutAI);

        expect(readingRepo.create).toHaveBeenCalled();
      });
    });

    describe('when useAI is true', () => {
      it('should generate AI interpretation when useAI is true', async () => {
        const dtoWithAI: CreateReadingDto = {
          ...mockDto,
          useAI: true,
        };
        const mockReading = createMockReading();
        const mockUpdatedReading = createMockReading({
          interpretation: 'AI-powered interpretation in Markdown format',
        });

        validator.validateUser.mockResolvedValue(mockUser);
        decksService.findDeckById.mockResolvedValue(mockDeck);
        spreadsService.findById.mockResolvedValue(mockSpread);
        readingRepo.create.mockResolvedValue(mockReading);
        interpretationsService.generateInterpretation.mockResolvedValue({
          interpretation: 'AI-powered interpretation in Markdown format',
          fromCache: false,
        });
        readingRepo.update.mockResolvedValue(mockUpdatedReading);

        const result = await useCase.execute(mockUser, dtoWithAI);

        expect(
          interpretationsService.generateInterpretation,
        ).toHaveBeenCalledWith(
          mockCards,
          expectedCardPositions,
          mockDto.customQuestion,
          mockSpread,
          undefined,
          mockUser.id,
          mockReading.id,
          1,
        );
        expect(result.interpretation).toContain('AI-powered interpretation');
      });

      it('should return Markdown formatted interpretation when useAI is true', async () => {
        const dtoWithAI: CreateReadingDto = {
          ...mockDto,
          useAI: true,
        };
        const markdownInterpretation = `## Interpretación General\n\nTu lectura revela...`;
        const mockReading = createMockReading();
        const mockUpdatedReading = createMockReading({
          interpretation: markdownInterpretation,
        });

        validator.validateUser.mockResolvedValue(mockUser);
        decksService.findDeckById.mockResolvedValue(mockDeck);
        spreadsService.findById.mockResolvedValue(mockSpread);
        readingRepo.create.mockResolvedValue(mockReading);
        interpretationsService.generateInterpretation.mockResolvedValue({
          interpretation: markdownInterpretation,
          fromCache: false,
        });
        readingRepo.update.mockResolvedValue(mockUpdatedReading);

        const result = await useCase.execute(mockUser, dtoWithAI);

        expect(result.interpretation).toContain('## Interpretación General');
      });

      it('should increment usage counter when useAI is true', async () => {
        const dtoWithAI: CreateReadingDto = {
          ...mockDto,
          useAI: true,
        };
        const mockReading = createMockReading();
        const mockUpdatedReading = createMockReading({
          interpretation: 'AI interpretation',
        });

        validator.validateUser.mockResolvedValue(mockUser);
        decksService.findDeckById.mockResolvedValue(mockDeck);
        spreadsService.findById.mockResolvedValue(mockSpread);
        readingRepo.create.mockResolvedValue(mockReading);
        interpretationsService.generateInterpretation.mockResolvedValue({
          interpretation: 'AI interpretation',
          fromCache: false,
        });
        readingRepo.update.mockResolvedValue(mockUpdatedReading);

        await useCase.execute(mockUser, dtoWithAI);

        expect(readingRepo.create).toHaveBeenCalled();
        expect(readingRepo.update).toHaveBeenCalled();
      });
    });

    describe('when useAI is undefined', () => {
      it('should default to no AI interpretation when useAI is undefined', async () => {
        const dtoUndefinedAI: CreateReadingDto = {
          ...mockDto,
          useAI: undefined,
        };
        const mockReading = createMockReading({ interpretation: null });

        validator.validateUser.mockResolvedValue(mockUser);
        decksService.findDeckById.mockResolvedValue(mockDeck);
        spreadsService.findById.mockResolvedValue(mockSpread);
        readingRepo.create.mockResolvedValue(mockReading);

        const result = await useCase.execute(mockUser, dtoUndefinedAI);

        expect(
          interpretationsService.generateInterpretation,
        ).not.toHaveBeenCalled();
        expect(result.interpretation).toBeNull();
      });
    });

    describe('both readings saved in tarot_readings table', () => {
      it('should save reading with useAI:false in tarot_readings table', async () => {
        const dtoWithoutAI: CreateReadingDto = {
          ...mockDto,
          useAI: false,
        };
        const mockReading = createMockReading();

        validator.validateUser.mockResolvedValue(mockUser);
        decksService.findDeckById.mockResolvedValue(mockDeck);
        spreadsService.findById.mockResolvedValue(mockSpread);
        readingRepo.create.mockResolvedValue(mockReading);

        await useCase.execute(mockUser, dtoWithoutAI);

        expect(readingRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            user: mockUser,
            deck: mockDeck,
            cards: mockCards,
          }),
        );
      });

      it('should save reading with useAI:true in tarot_readings table', async () => {
        const dtoWithAI: CreateReadingDto = {
          ...mockDto,
          useAI: true,
        };
        const mockReading = createMockReading();
        const mockUpdatedReading = createMockReading({
          interpretation: 'AI interpretation',
        });

        validator.validateUser.mockResolvedValue(mockUser);
        decksService.findDeckById.mockResolvedValue(mockDeck);
        spreadsService.findById.mockResolvedValue(mockSpread);
        readingRepo.create.mockResolvedValue(mockReading);
        interpretationsService.generateInterpretation.mockResolvedValue({
          interpretation: 'AI interpretation',
          fromCache: false,
        });
        readingRepo.update.mockResolvedValue(mockUpdatedReading);

        await useCase.execute(mockUser, dtoWithAI);

        expect(readingRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            user: mockUser,
            deck: mockDeck,
            cards: mockCards,
          }),
        );
      });
    });
  });

  describe('edge cases', () => {
    it('should handle null user', async () => {
      await expect(
        useCase.execute(null as unknown as User, mockDto),
      ).rejects.toThrow('Invalid user: user object or user.id is missing');
    });

    it('should handle undefined customQuestion and no predefinedQuestionId', async () => {
      const dtoWithNoQuestion: CreateReadingDto = {
        ...mockDto,
        customQuestion: undefined,
        predefinedQuestionId: undefined,
        useAI: false,
      };
      const mockReading = createMockReading({
        customQuestion: null,
        predefinedQuestionId: null,
        questionType: 'custom',
      });

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);

      const result = await useCase.execute(mockUser, dtoWithNoQuestion);

      expect(result.questionType).toBe('custom');
      expect(result.customQuestion).toBeNull();
    });

    it('should handle deckId 0', async () => {
      const dtoWithZeroDeck: CreateReadingDto = {
        ...mockDto,
        deckId: 0,
      };

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(null as unknown as TarotDeck);

      await expect(useCase.execute(mockUser, dtoWithZeroDeck)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(mockUser, dtoWithZeroDeck)).rejects.toThrow(
        'Deck with ID 0 not found',
      );
    });

    it('should handle spreadId 0', async () => {
      const dtoWithZeroSpread: CreateReadingDto = {
        ...mockDto,
        spreadId: 0,
      };

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(null as unknown as TarotSpread);

      await expect(
        useCase.execute(mockUser, dtoWithZeroSpread),
      ).rejects.toThrow(NotFoundException);
      await expect(
        useCase.execute(mockUser, dtoWithZeroSpread),
      ).rejects.toThrow('Spread with ID 0 not found');
    });

    it('should handle interpretation with undefined question', async () => {
      const dtoNoQuestionWithInterpretation: CreateReadingDto = {
        ...mockDto,
        customQuestion: undefined,
        predefinedQuestionId: undefined,
        useAI: true,
      };
      const mockReading = createMockReading();
      const mockUpdatedReading = createMockReading({
        interpretation: 'Generated',
      });

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);
      interpretationsService.generateInterpretation.mockResolvedValue({
        interpretation: 'Generated',
        fromCache: false,
      });
      readingRepo.update.mockResolvedValue(mockUpdatedReading);

      await useCase.execute(mockUser, dtoNoQuestionWithInterpretation);

      expect(
        interpretationsService.generateInterpretation,
      ).toHaveBeenCalledWith(
        mockCards,
        expectedCardPositions,
        undefined,
        mockSpread,
        undefined,
        mockUser.id,
        mockReading.id,
        1,
      );
    });
  });

  describe('FREE flow with categoryId (T-FR-B02)', () => {
    const mockFreeDtoWithCategory: CreateReadingDto = {
      deckId: 1,
      spreadId: 1,
      customQuestion: '¿Cómo va mi relación?',
      useAI: false,
      categoryId: 1,
    };

    const mockFreeInterpretationsMap = {
      0: { content: 'Interpretación para carta 1 upright en amor' },
      1: { content: 'Interpretación para carta 2 upright en amor' },
      2: { content: 'Interpretación para carta 3 reversed en amor' },
    };

    it('should call validateCategoryAccess when categoryId is provided', async () => {
      const mockReading = createMockReading({ user: mockFreeUser });
      const mockUpdatedReading = createMockReading({
        user: mockFreeUser,
        freeInterpretations: mockFreeInterpretationsMap,
      });

      validator.validateUser.mockResolvedValue(mockFreeUser);
      validator.validateCategoryAccess.mockResolvedValue(undefined);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);
      cardFreeInterpretationService.findByCardsAndCategory.mockResolvedValue(
        mockFreeInterpretationsMap,
      );
      readingRepo.update.mockResolvedValue(mockUpdatedReading);

      await useCase.execute(mockFreeUser, mockFreeDtoWithCategory);

      expect(validator.validateCategoryAccess).toHaveBeenCalledWith(
        UserPlan.FREE,
        1,
      );
    });

    it('should call cardFreeInterpretationService and persist freeInterpretations', async () => {
      const mockReading = createMockReading({ user: mockFreeUser });
      const mockUpdatedReading = createMockReading({
        user: mockFreeUser,
        freeInterpretations: mockFreeInterpretationsMap,
      });

      validator.validateUser.mockResolvedValue(mockFreeUser);
      validator.validateCategoryAccess.mockResolvedValue(undefined);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);
      cardFreeInterpretationService.findByCardsAndCategory.mockResolvedValue(
        mockFreeInterpretationsMap,
      );
      readingRepo.update.mockResolvedValue(mockUpdatedReading);

      const result = await useCase.execute(
        mockFreeUser,
        mockFreeDtoWithCategory,
      );

      expect(
        cardFreeInterpretationService.findByCardsAndCategory,
      ).toHaveBeenCalledWith(mockCards, expectedCardPositions, 1);
      expect(readingRepo.update).toHaveBeenCalledWith(mockReading.id, {
        freeInterpretations: mockFreeInterpretationsMap,
      });
      expect(result).toEqual(mockUpdatedReading);
    });

    it('should NOT call cardFreeInterpretationService when categoryId is absent', async () => {
      const dtoCategoryAbsent: CreateReadingDto = {
        ...mockFreeDtoWithCategory,
        categoryId: undefined,
      };
      const mockReading = createMockReading({ user: mockFreeUser });

      validator.validateUser.mockResolvedValue(mockFreeUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);

      await useCase.execute(mockFreeUser, dtoCategoryAbsent);

      expect(
        cardFreeInterpretationService.findByCardsAndCategory,
      ).not.toHaveBeenCalled();
      expect(validator.validateCategoryAccess).not.toHaveBeenCalled();
      expect(readingRepo.update).not.toHaveBeenCalled();
    });

    it('should NOT call cardFreeInterpretationService when useAI is true (PREMIUM flow takes precedence)', async () => {
      const dtoPremiumAI: CreateReadingDto = {
        ...mockFreeDtoWithCategory,
        useAI: true,
        categoryId: 1,
      };
      const mockReading = createMockReading();
      const mockUpdatedReading = createMockReading({
        interpretation: 'AI interpretation',
      });

      validator.validateUser.mockResolvedValue(mockUser);
      validator.validateCategoryAccess.mockResolvedValue(undefined);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);
      interpretationsService.generateInterpretation.mockResolvedValue({
        interpretation: 'AI interpretation',
        fromCache: false,
      });
      readingRepo.update.mockResolvedValue(mockUpdatedReading);

      await useCase.execute(mockUser, dtoPremiumAI);

      expect(
        cardFreeInterpretationService.findByCardsAndCategory,
      ).not.toHaveBeenCalled();
      expect(interpretationsService.generateInterpretation).toHaveBeenCalled();
    });

    it('should propagate ForbiddenException from validateCategoryAccess', async () => {
      validator.validateUser.mockResolvedValue(mockFreeUser);
      validator.validateCategoryAccess.mockRejectedValue(
        new ForbiddenException(
          'Los usuarios free solo pueden acceder a las categorías: amor, salud, dinero',
        ),
      );
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);

      await expect(
        useCase.execute(mockFreeUser, mockFreeDtoWithCategory),
      ).rejects.toThrow(ForbiddenException);

      expect(readingRepo.create).not.toHaveBeenCalled();
    });

    it('should NOT call cardFreeInterpretationService when PREMIUM user sends categoryId (guard plan)', async () => {
      const premiumDtoWithCategory: CreateReadingDto = {
        ...mockDto,
        useAI: false,
        categoryId: 1,
      };
      const mockReading = createMockReading();

      validator.validateUser.mockResolvedValue(mockUser);
      validator.validateCategoryAccess.mockResolvedValue(undefined);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);

      const result = await useCase.execute(mockUser, premiumDtoWithCategory);

      expect(
        cardFreeInterpretationService.findByCardsAndCategory,
      ).not.toHaveBeenCalled();
      expect(readingRepo.update).not.toHaveBeenCalled();
      expect(result).toEqual(mockReading);
    });

    it('should NOT touch the interpretation field in the FREE flow', async () => {
      const mockReading = createMockReading({
        user: mockFreeUser,
        interpretation: null,
      });
      const mockUpdatedReading = createMockReading({
        user: mockFreeUser,
        interpretation: null,
        freeInterpretations: mockFreeInterpretationsMap,
      });

      validator.validateUser.mockResolvedValue(mockFreeUser);
      validator.validateCategoryAccess.mockResolvedValue(undefined);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      readingRepo.create.mockResolvedValue(mockReading);
      cardFreeInterpretationService.findByCardsAndCategory.mockResolvedValue(
        mockFreeInterpretationsMap,
      );
      readingRepo.update.mockResolvedValue(mockUpdatedReading);

      const result = await useCase.execute(
        mockFreeUser,
        mockFreeDtoWithCategory,
      );

      expect(readingRepo.update).toHaveBeenCalledWith(
        mockReading.id,
        expect.not.objectContaining({ interpretation: expect.anything() }),
      );
      expect(result.interpretation).toBeNull();
    });
  });

  describe('execute - deck access validation (T-FR-B03)', () => {
    const majorArcanaCards = [
      { id: 1, name: 'El Loco', category: 'arcanos_mayores' },
      { id: 2, name: 'El Mago', category: 'arcanos_mayores' },
      { id: 3, name: 'La Sacerdotisa', category: 'arcanos_mayores' },
    ] as unknown as TarotCard[];

    it('should call validateDeckAccess with user plan and the drawn cards', async () => {
      const mockReading = createMockReading({ user: mockFreeUser });
      validator.validateUser.mockResolvedValue(mockFreeUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      cardsService.findByDeck.mockResolvedValue(majorArcanaCards);
      deckShuffler.draw.mockReturnValue(majorArcanaCards);
      readingRepo.create.mockResolvedValue(mockReading);

      await useCase.execute(mockFreeUser, mockDtoFree);

      expect(validator.validateDeckAccess).toHaveBeenCalledWith(
        UserPlan.FREE,
        majorArcanaCards,
      );
    });

    it('should throw ForbiddenException if the defensive deck access check fails', async () => {
      validator.validateUser.mockResolvedValue(mockFreeUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      cardsService.findByDeck.mockResolvedValue(majorArcanaCards);
      deckShuffler.draw.mockReturnValue(majorArcanaCards);
      validator.validateDeckAccess.mockImplementation(() => {
        throw new ForbiddenException(
          'El plan FREE solo permite cartas de Arcanos Mayores',
        );
      });

      const executionPromise = useCase.execute(mockFreeUser, mockDtoFree);
      await expect(executionPromise).rejects.toThrow(ForbiddenException);
      await expect(executionPromise).rejects.toThrow(
        'El plan FREE solo permite cartas de Arcanos Mayores',
      );
      expect(readingRepo.create).not.toHaveBeenCalled();
    });

    it('should call validateDeckAccess before creating the reading', async () => {
      const callOrder: string[] = [];
      validator.validateUser.mockResolvedValue(mockFreeUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      cardsService.findByDeck.mockResolvedValue(majorArcanaCards);
      deckShuffler.draw.mockReturnValue(majorArcanaCards);
      validator.validateDeckAccess.mockImplementation(() => {
        callOrder.push('validateDeckAccess');
      });
      readingRepo.create.mockImplementation(() => {
        callOrder.push('repoCreate');
        return Promise.resolve(createMockReading({ user: mockFreeUser }));
      });

      await useCase.execute(mockFreeUser, mockDtoFree);

      const deckIdx = callOrder.indexOf('validateDeckAccess');
      const createIdx = callOrder.indexOf('repoCreate');
      expect(deckIdx).toBeGreaterThanOrEqual(0);
      expect(createIdx).toBeGreaterThan(deckIdx);
    });

    it('should still call validateDeckAccess for PREMIUM users (no restriction expected)', async () => {
      const mockReading = createMockReading();
      validator.validateUser.mockResolvedValue(mockUser); // PREMIUM
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      cardsService.findByDeck.mockResolvedValue(majorArcanaCards);
      deckShuffler.draw.mockReturnValue(majorArcanaCards);
      readingRepo.create.mockResolvedValue(mockReading);

      await useCase.execute(mockUser, mockDto);

      expect(validator.validateDeckAccess).toHaveBeenCalledWith(
        UserPlan.PREMIUM,
        majorArcanaCards,
      );
    });
  });
});
