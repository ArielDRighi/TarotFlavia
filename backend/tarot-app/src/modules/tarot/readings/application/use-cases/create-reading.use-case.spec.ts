import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreateReadingUseCase } from './create-reading.use-case';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';
import { InterpretationsService } from '../../../interpretations/interpretations.service';
import { CardsService } from '../../../cards/cards.service';
import { SpreadsService } from '../../../spreads/spreads.service';
import { DecksService } from '../../../decks/decks.service';
import { PredefinedQuestionsService } from '../../../../predefined-questions/predefined-questions.service';
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

  const mockUser: User = {
    id: 100,
    email: 'test@example.com',
    plan: UserPlan.PREMIUM,
  } as User;

  const mockDeck = { id: 1, name: 'Test Deck' } as unknown as TarotDeck;
  const mockSpread = {
    id: 1,
    name: 'Test Spread',
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
    generateInterpretation: false,
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
      expect(decksService.findDeckById).toHaveBeenCalledWith(1);
      expect(spreadsService.findById).toHaveBeenCalledWith(1);
      expect(cardsService.findByIds).toHaveBeenCalledWith([1, 2, 3]);
      expect(readingRepo.create).toHaveBeenCalledWith({
        predefinedQuestionId: null,
        customQuestion: mockDto.customQuestion,
        questionType: 'custom',
        user: mockUser,
        tarotistaId: 1,
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
        generateInterpretation: false,
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
      generateInterpretation: true,
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
        generateInterpretation: true,
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
        generateInterpretation: true,
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await expect(useCase.execute(null as any, mockDto)).rejects.toThrow(
        'User is required',
      );
    });

    it('should handle undefined customQuestion and no predefinedQuestionId', async () => {
      const dtoWithNoQuestion: CreateReadingDto = {
        ...mockDto,
        customQuestion: undefined,
        predefinedQuestionId: undefined,
        generateInterpretation: false,
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
        generateInterpretation: true,
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
});
