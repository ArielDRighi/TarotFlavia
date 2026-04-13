import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateReadingUseCase } from './create-reading.use-case';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';
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
  let interpretationsService: jest.Mocked<InterpretationsService>;
  let cardsService: jest.Mocked<CardsService>;
  let spreadsService: jest.Mocked<SpreadsService>;
  let decksService: jest.Mocked<DecksService>;
  let predefinedQuestionsService: jest.Mocked<PredefinedQuestionsService>;
  let subscriptionsService: jest.Mocked<SubscriptionsService>;
  let _revenueCalculationService: jest.Mocked<RevenueCalculationService>;
  let cardFreeInterpretationService: jest.Mocked<CardFreeInterpretationService>;

  const mockUser: User = {
    id: 100,
    email: 'test@example.com',
    plan: UserPlan.PREMIUM,
  } as User;

  const mockDeck = { id: 1, name: 'Test Deck' } as unknown as TarotDeck;
  const mockSpread = {
    id: 1,
    name: 'Test Spread',
    requiredPlan: UserPlan.FREE,
  } as unknown as TarotSpread;
  const mockCards = [
    { id: 1, name: 'Card 1' },
    { id: 2, name: 'Card 2' },
    { id: 3, name: 'Card 3' },
  ] as unknown as TarotCard[];

  const mockDto: CreateReadingDto = {
    deckId: 1,
    spreadId: 1,
    cardIds: [1, 2, 3],
    cardPositions: [
      { cardId: 1, position: 'past', isReversed: false },
      { cardId: 2, position: 'present', isReversed: false },
      { cardId: 3, position: 'future', isReversed: true },
    ],
    customQuestion: 'What is my future?',
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
      cardPositions: mockDto.cardPositions,
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
          provide: InterpretationsService,
          useValue: {
            generateInterpretation: jest.fn(),
          },
        },
        {
          provide: CardsService,
          useValue: {
            findByIds: jest.fn(),
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
    interpretationsService = module.get(InterpretationsService);
    cardsService = module.get(CardsService);
    spreadsService = module.get(SpreadsService);
    decksService = module.get(DecksService);
    predefinedQuestionsService = module.get(PredefinedQuestionsService);
    subscriptionsService = module.get(SubscriptionsService);
    cardFreeInterpretationService = module.get(CardFreeInterpretationService);
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
      cardsService.findByIds.mockResolvedValue(mockCards);
      readingRepo.create.mockResolvedValue(mockReading);

      const result = await useCase.execute(mockUser, mockDto);

      expect(validator.validateUser).toHaveBeenCalledWith(mockUser.id);
      expect(
        subscriptionsService.resolveTarotistaForReading,
      ).toHaveBeenCalledWith(mockUser.id);
      expect(decksService.findDeckById).toHaveBeenCalledWith(1);
      expect(spreadsService.findById).toHaveBeenCalledWith(1);
      expect(cardsService.findByIds).toHaveBeenCalledWith([1, 2, 3]);
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
        cardPositions: mockDto.cardPositions,
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
      cardsService.findByIds.mockResolvedValue(mockCards);
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
        cardPositions: mockDto.cardPositions,
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
      expect(cardsService.findByIds).not.toHaveBeenCalled();
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

    it('should propagate errors from cardsService', async () => {
      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      cardsService.findByIds.mockRejectedValue(new Error('Cards not found'));

      await expect(useCase.execute(mockUser, mockDto)).rejects.toThrow(
        'Cards not found',
      );
      expect(readingRepo.create).not.toHaveBeenCalled();
    });

    it('should propagate errors from repository create', async () => {
      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      cardsService.findByIds.mockResolvedValue(mockCards);
      readingRepo.create.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(mockUser, mockDto)).rejects.toThrow(
        'Database error',
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
      cardsService.findByIds.mockResolvedValue(mockCards);
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
        mockDto.cardPositions,
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
      cardsService.findByIds.mockResolvedValue(mockCards);
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
        mockDto.cardPositions,
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
      cardsService.findByIds.mockResolvedValue(mockCards);
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
      cardsService.findByIds.mockResolvedValue(mockCards);
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
      cardsService.findByIds.mockResolvedValue(mockCards);
      readingRepo.create.mockResolvedValue(mockReading);
      predefinedQuestionsService.findOne.mockResolvedValue(
        null as unknown as PredefinedQuestion,
      );
      readingRepo.update.mockResolvedValue(mockFallbackReading);

      const result = await useCase.execute(mockUser, dtoWithPredefined);

      // Should create reading but with fallback interpretation due to NotFoundException
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
      cardsService.findByIds.mockResolvedValue(mockCards);
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
        cardsService.findByIds.mockResolvedValue(mockCards);
        readingRepo.create.mockResolvedValue(mockReading);

        const result = await useCase.execute(mockUser, dtoWithoutAI);

        // No debe llamar a generateInterpretation
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
          cardPositions: mockDto.cardPositions,
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
        cardsService.findByIds.mockResolvedValue(mockCards);
        readingRepo.create.mockResolvedValue(mockReading);

        const result = await useCase.execute(mockUser, dtoWithoutAI);

        expect(result.cards).toEqual(mockCards);
        expect(result.interpretation).toBeNull();
        expect(cardsService.findByIds).toHaveBeenCalledWith([1, 2, 3]);
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
        cardsService.findByIds.mockResolvedValue(mockCards);
        readingRepo.create.mockResolvedValue(mockReading);

        await useCase.execute(mockUser, dtoWithoutAI);

        // Verifica que se guardó en DB (contador se incrementa)
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
        cardsService.findByIds.mockResolvedValue(mockCards);
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
          mockDto.cardPositions,
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
        cardsService.findByIds.mockResolvedValue(mockCards);
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
        cardsService.findByIds.mockResolvedValue(mockCards);
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
        cardsService.findByIds.mockResolvedValue(mockCards);
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
        cardsService.findByIds.mockResolvedValue(mockCards);
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
        cardsService.findByIds.mockResolvedValue(mockCards);
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
    it('should handle empty cardIds array', async () => {
      const dtoWithEmptyCards: CreateReadingDto = {
        ...mockDto,
        cardIds: [],
        cardPositions: [],
      };

      validator.validateUser.mockResolvedValue(mockUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      cardsService.findByIds.mockResolvedValue([]);
      readingRepo.create.mockResolvedValue(createMockReading({ cards: [] }));

      const result = await useCase.execute(mockUser, dtoWithEmptyCards);

      expect(cardsService.findByIds).toHaveBeenCalledWith([]);
      expect(result.cards).toEqual([]);
    });

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
      cardsService.findByIds.mockResolvedValue(mockCards);
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
      cardsService.findByIds.mockResolvedValue(mockCards);
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
        mockDto.cardPositions,
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
    const mockFreeUser: User = {
      id: 200,
      email: 'free@example.com',
      plan: UserPlan.FREE,
    } as User;

    const mockFreeDto: CreateReadingDto = {
      deckId: 1,
      spreadId: 1,
      cardIds: [1, 2, 3],
      cardPositions: [
        { cardId: 1, position: 'past', isReversed: false },
        { cardId: 2, position: 'present', isReversed: false },
        { cardId: 3, position: 'future', isReversed: true },
      ],
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
      cardsService.findByIds.mockResolvedValue(mockCards);
      readingRepo.create.mockResolvedValue(mockReading);
      cardFreeInterpretationService.findByCardsAndCategory.mockResolvedValue(
        mockFreeInterpretationsMap,
      );
      readingRepo.update.mockResolvedValue(mockUpdatedReading);

      await useCase.execute(mockFreeUser, mockFreeDto);

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
      cardsService.findByIds.mockResolvedValue(mockCards);
      readingRepo.create.mockResolvedValue(mockReading);
      cardFreeInterpretationService.findByCardsAndCategory.mockResolvedValue(
        mockFreeInterpretationsMap,
      );
      readingRepo.update.mockResolvedValue(mockUpdatedReading);

      const result = await useCase.execute(mockFreeUser, mockFreeDto);

      expect(
        cardFreeInterpretationService.findByCardsAndCategory,
      ).toHaveBeenCalledWith(mockCards, mockFreeDto.cardPositions, 1);
      expect(readingRepo.update).toHaveBeenCalledWith(mockReading.id, {
        freeInterpretations: mockFreeInterpretationsMap,
      });
      expect(result).toEqual(mockUpdatedReading);
    });

    it('should NOT call cardFreeInterpretationService when categoryId is absent', async () => {
      const dtoCategoryAbsent: CreateReadingDto = {
        ...mockFreeDto,
        categoryId: undefined,
      };
      const mockReading = createMockReading({ user: mockFreeUser });

      validator.validateUser.mockResolvedValue(mockFreeUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      cardsService.findByIds.mockResolvedValue(mockCards);
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
        ...mockFreeDto,
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
      cardsService.findByIds.mockResolvedValue(mockCards);
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
      cardsService.findByIds.mockResolvedValue(mockCards);

      await expect(useCase.execute(mockFreeUser, mockFreeDto)).rejects.toThrow(
        ForbiddenException,
      );

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
      cardsService.findByIds.mockResolvedValue(mockCards);
      readingRepo.create.mockResolvedValue(mockReading);

      const result = await useCase.execute(mockUser, premiumDtoWithCategory);

      // PREMIUM nunca debe recibir freeInterpretations aunque envíe categoryId
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
      cardsService.findByIds.mockResolvedValue(mockCards);
      readingRepo.create.mockResolvedValue(mockReading);
      cardFreeInterpretationService.findByCardsAndCategory.mockResolvedValue(
        mockFreeInterpretationsMap,
      );
      readingRepo.update.mockResolvedValue(mockUpdatedReading);

      const result = await useCase.execute(mockFreeUser, mockFreeDto);

      // Only freeInterpretations should be updated — not interpretation
      expect(readingRepo.update).toHaveBeenCalledWith(
        mockReading.id,
        expect.not.objectContaining({ interpretation: expect.anything() }),
      );
      expect(result.interpretation).toBeNull();
    });
  });

  describe('execute - deck access validation (T-FR-B03)', () => {
    const mockFreeUser: User = {
      id: 200,
      email: 'free@example.com',
      plan: UserPlan.FREE,
    } as User;

    const majorArcanaCards = [
      { id: 1, name: 'El Loco', category: 'arcanos_mayores' },
      { id: 2, name: 'El Mago', category: 'arcanos_mayores' },
    ] as unknown as TarotCard[];

    const mixedCards = [
      { id: 1, name: 'El Loco', category: 'arcanos_mayores' },
      { id: 22, name: 'As de Bastos', category: 'bastos' },
    ] as unknown as TarotCard[];

    const mockDtoFree: CreateReadingDto = {
      deckId: 1,
      spreadId: 1,
      cardIds: [1, 2],
      cardPositions: [
        { cardId: 1, position: 'past', isReversed: false },
        { cardId: 2, position: 'present', isReversed: false },
      ],
      useAI: false,
    };

    it('should call validateDeckAccess with user plan and cards', async () => {
      const mockReading = createMockReading({ user: mockFreeUser });
      validator.validateUser.mockResolvedValue(mockFreeUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      cardsService.findByIds.mockResolvedValue(majorArcanaCards);
      readingRepo.create.mockResolvedValue(mockReading);

      await useCase.execute(mockFreeUser, mockDtoFree);

      expect(validator.validateDeckAccess).toHaveBeenCalledWith(
        UserPlan.FREE,
        majorArcanaCards,
      );
    });

    it('should throw ForbiddenException when FREE user sends minor arcana cards', async () => {
      validator.validateUser.mockResolvedValue(mockFreeUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      cardsService.findByIds.mockResolvedValue(mixedCards);
      validator.validateDeckAccess.mockImplementation(() => {
        throw new ForbiddenException(
          'El plan FREE solo permite cartas de Arcanos Mayores',
        );
      });

      await expect(useCase.execute(mockFreeUser, mockDtoFree)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(useCase.execute(mockFreeUser, mockDtoFree)).rejects.toThrow(
        'El plan FREE solo permite cartas de Arcanos Mayores',
      );
    });

    it('should call validateDeckAccess before creating the reading', async () => {
      const callOrder: string[] = [];
      validator.validateUser.mockResolvedValue(mockFreeUser);
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      cardsService.findByIds.mockResolvedValue(majorArcanaCards);
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
      const premiumDto: CreateReadingDto = { ...mockDtoFree, useAI: false };
      const mockReading = createMockReading();
      validator.validateUser.mockResolvedValue(mockUser); // PREMIUM
      decksService.findDeckById.mockResolvedValue(mockDeck);
      spreadsService.findById.mockResolvedValue(mockSpread);
      cardsService.findByIds.mockResolvedValue(majorArcanaCards);
      readingRepo.create.mockResolvedValue(mockReading);

      await useCase.execute(mockUser, premiumDto);

      expect(validator.validateDeckAccess).toHaveBeenCalledWith(
        UserPlan.PREMIUM,
        majorArcanaCards,
      );
    });
  });
});
