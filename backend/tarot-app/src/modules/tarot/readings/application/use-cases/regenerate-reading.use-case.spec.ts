import { Test, TestingModule } from '@nestjs/testing';
import { RegenerateReadingUseCase } from './regenerate-reading.use-case';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';
import { InterpretationsService } from '../../../interpretations/interpretations.service';
import { CardsService } from '../../../cards/cards.service';
import { SpreadsService } from '../../../spreads/spreads.service';
import { PredefinedQuestionsService } from '../../../../predefined-questions/predefined-questions.service';
import { Repository } from 'typeorm';
import { TarotInterpretation } from '../../../interpretations/entities/tarot-interpretation.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { TarotCard } from '../../../cards/entities/tarot-card.entity';
import { TarotSpread } from '../../../spreads/entities/tarot-spread.entity';
import { PredefinedQuestion } from '../../../../predefined-questions/entities/predefined-question.entity';
import { NotFoundException } from '@nestjs/common';
import { User, UserPlan } from '../../../../users/entities/user.entity';

describe('RegenerateReadingUseCase', () => {
  let useCase: RegenerateReadingUseCase;
  let readingRepo: jest.Mocked<IReadingRepository>;
  let interpretationsRepo: jest.Mocked<Repository<TarotInterpretation>>;
  let validator: jest.Mocked<ReadingValidatorService>;
  let interpretationsService: jest.Mocked<InterpretationsService>;
  let cardsService: jest.Mocked<CardsService>;
  let spreadsService: jest.Mocked<SpreadsService>;
  let predefinedQuestionsService: jest.Mocked<PredefinedQuestionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegenerateReadingUseCase,
        {
          provide: 'IReadingRepository',
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TarotInterpretation),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ReadingValidatorService,
          useValue: {
            validateUserIsPremium: jest.fn(),
            validateReadingOwnership: jest.fn(),
            validateRegenerationCount: jest.fn(),
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
          provide: PredefinedQuestionsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RegenerateReadingUseCase>(RegenerateReadingUseCase);
    readingRepo = module.get('IReadingRepository');
    interpretationsRepo = module.get(getRepositoryToken(TarotInterpretation));
    validator = module.get(ReadingValidatorService);
    interpretationsService = module.get(InterpretationsService);
    cardsService = module.get(CardsService);
    spreadsService = module.get(SpreadsService);
    predefinedQuestionsService = module.get(PredefinedQuestionsService);
  });

  const createMockUser = (userId: number): User => {
    return { id: userId, plan: UserPlan.PREMIUM } as User;
  };

  const createMockReading = (
    overrides?: Partial<TarotReading>,
  ): TarotReading => {
    return {
      id: 1,
      userId: 1,
      tarotistaId: 1,
      predefinedQuestionId: null,
      customQuestion: null,
      interpretation: 'Old interpretation',
      regenerationCount: 0,
      cardPositions: [
        { cardId: 1, position: 0, isReversed: false },
        { cardId: 2, position: 1, isReversed: false },
        { cardId: 3, position: 2, isReversed: false },
      ],
      ...overrides,
    } as TarotReading;
  };

  const createMockCard = (id: number): TarotCard => {
    return {
      id,
      name: `Card ${id}`,
      uprightMeaning: 'Upright meaning',
      reversedMeaning: 'Reversed meaning',
    } as unknown as TarotCard;
  };

  const createMockSpread = (): TarotSpread => {
    return {
      id: 1,
      name: 'Three Card Spread',
      positions: ['Past', 'Present', 'Future'],
    } as unknown as TarotSpread;
  };

  describe('execute - successful regeneration', () => {
    it('should regenerate reading with custom question successfully', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading({
        customQuestion: '¿Qué me depara el futuro?',
      });
      const mockUser = createMockUser(userId);
      const cards = [createMockCard(1), createMockCard(2), createMockCard(3)];
      const spread = createMockSpread();
      const newInterpretation = {
        interpretation: 'New interpretation',
        fromCache: false,
      };
      const savedInterpretation = {
        id: 1,
        content: newInterpretation.interpretation,
      };
      const updatedReading = {
        ...reading,
        interpretation: newInterpretation.interpretation,
        regenerationCount: 1,
      };

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockResolvedValue(cards);
      spreadsService.findById.mockResolvedValue(spread);
      interpretationsService.generateInterpretation.mockResolvedValue(
        newInterpretation,
      );
      interpretationsRepo.create.mockReturnValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      interpretationsRepo.save.mockResolvedValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      readingRepo.update.mockResolvedValue(updatedReading);

      const result = await useCase.execute(readingId, userId);

      expect(validator.validateUserIsPremium).toHaveBeenCalledWith(userId);
      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(
        readingId,
        userId,
      );
      expect(validator.validateRegenerationCount).toHaveBeenCalledWith(reading);
      expect(cardsService.findByIds).toHaveBeenCalledWith([1, 2, 3]);
      expect(spreadsService.findById).toHaveBeenCalledWith(1);
      expect(
        interpretationsService.generateInterpretation,
      ).toHaveBeenCalledWith(
        cards,
        reading.cardPositions,
        '¿Qué me depara el futuro? [REGENERACIÓN: Proporciona una perspectiva alternativa y diferente a interpretaciones anteriores]',
        spread,
        undefined,
        userId,
        reading.id,
        1,
      );
      expect(interpretationsRepo.create).toHaveBeenCalledWith({
        reading: { id: reading.id },
        content: newInterpretation.interpretation,
        modelUsed: 'llama-3.3-70b-versatile',
        aiConfig: {
          model: 'llama-3.3-70b-versatile',
          provider: 'groq',
          temperature: 0.9,
          maxTokens: 2000,
        },
      });
      expect(interpretationsRepo.save).toHaveBeenCalledWith(
        savedInterpretation,
      );
      expect(readingRepo.update).toHaveBeenCalledWith(readingId, {
        interpretation: newInterpretation.interpretation,
        regenerationCount: 1,
      });
      expect(result).toEqual(updatedReading);
    });

    it('should regenerate reading with predefined question successfully', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading({
        predefinedQuestionId: 1,
        customQuestion: null,
      });
      const mockUser = createMockUser(userId);
      const predefinedQuestion = {
        id: 1,
        questionText: '¿Cómo mejorar mi vida amorosa?',
      } as PredefinedQuestion;
      const cards = [createMockCard(1), createMockCard(2), createMockCard(3)];
      const spread = createMockSpread();
      const newInterpretation = {
        interpretation: 'New interpretation',
        fromCache: false,
      };
      const savedInterpretation = {
        id: 1,
        content: newInterpretation.interpretation,
      };
      const updatedReading = {
        ...reading,
        interpretation: newInterpretation.interpretation,
        regenerationCount: 1,
      };

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockResolvedValue(cards);
      predefinedQuestionsService.findOne.mockResolvedValue(predefinedQuestion);
      spreadsService.findById.mockResolvedValue(spread);
      interpretationsService.generateInterpretation.mockResolvedValue(
        newInterpretation,
      );
      interpretationsRepo.create.mockReturnValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      interpretationsRepo.save.mockResolvedValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      readingRepo.update.mockResolvedValue(updatedReading);

      const result = await useCase.execute(readingId, userId);

      expect(predefinedQuestionsService.findOne).toHaveBeenCalledWith(1);
      expect(
        interpretationsService.generateInterpretation,
      ).toHaveBeenCalledWith(
        cards,
        reading.cardPositions,
        '¿Cómo mejorar mi vida amorosa? [REGENERACIÓN: Proporciona una perspectiva alternativa y diferente a interpretaciones anteriores]',
        spread,
        undefined,
        userId,
        reading.id,
        1,
      );
      expect(result).toEqual(updatedReading);
    });

    it('should regenerate reading without question (default question)', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading({
        predefinedQuestionId: null,
        customQuestion: null,
      });
      const mockUser = createMockUser(userId);
      const cards = [createMockCard(1), createMockCard(2), createMockCard(3)];
      const spread = createMockSpread();
      const newInterpretation = {
        interpretation: 'New interpretation',
        fromCache: false,
      };
      const savedInterpretation = {
        id: 1,
        content: newInterpretation.interpretation,
      };
      const updatedReading = {
        ...reading,
        interpretation: newInterpretation.interpretation,
        regenerationCount: 1,
      };

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockResolvedValue(cards);
      spreadsService.findById.mockResolvedValue(spread);
      interpretationsService.generateInterpretation.mockResolvedValue(
        newInterpretation,
      );
      interpretationsRepo.create.mockReturnValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      interpretationsRepo.save.mockResolvedValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      readingRepo.update.mockResolvedValue(updatedReading);

      const result = await useCase.execute(readingId, userId);

      expect(
        interpretationsService.generateInterpretation,
      ).toHaveBeenCalledWith(
        cards,
        reading.cardPositions,
        'Proporciona una perspectiva alternativa y diferente para esta lectura',
        spread,
        undefined,
        userId,
        reading.id,
        1,
      );
      expect(result).toEqual(updatedReading);
    });

    it('should increment regeneration count correctly (second regeneration)', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading({
        regenerationCount: 1, // Already regenerated once
        customQuestion: 'Test question',
      });
      const mockUser = createMockUser(userId);
      const cards = [createMockCard(1), createMockCard(2), createMockCard(3)];
      const spread = createMockSpread();
      const newInterpretation = {
        interpretation: 'Second regeneration',
        fromCache: false,
      };
      const savedInterpretation = {
        id: 2,
        content: newInterpretation.interpretation,
      };
      const updatedReading = {
        ...reading,
        interpretation: newInterpretation.interpretation,
        regenerationCount: 2,
      };

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockResolvedValue(cards);
      spreadsService.findById.mockResolvedValue(spread);
      interpretationsService.generateInterpretation.mockResolvedValue(
        newInterpretation,
      );
      interpretationsRepo.create.mockReturnValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      interpretationsRepo.save.mockResolvedValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      readingRepo.update.mockResolvedValue(updatedReading);

      const result = await useCase.execute(readingId, userId);

      expect(readingRepo.update).toHaveBeenCalledWith(readingId, {
        interpretation: newInterpretation.interpretation,
        regenerationCount: 2,
      });
      expect(result.regenerationCount).toBe(2);
    });

    it('should use custom tarotistaId if present', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading({
        tarotistaId: 5,
        customQuestion: 'Test question',
      });
      const mockUser = createMockUser(userId);
      const cards = [createMockCard(1), createMockCard(2), createMockCard(3)];
      const spread = createMockSpread();
      const newInterpretation = {
        interpretation: 'New interpretation',
        fromCache: false,
      };
      const savedInterpretation = {
        id: 1,
        content: newInterpretation.interpretation,
      };
      const updatedReading = {
        ...reading,
        interpretation: newInterpretation.interpretation,
        regenerationCount: 1,
      };

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockResolvedValue(cards);
      spreadsService.findById.mockResolvedValue(spread);
      interpretationsService.generateInterpretation.mockResolvedValue(
        newInterpretation,
      );
      interpretationsRepo.create.mockReturnValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      interpretationsRepo.save.mockResolvedValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      readingRepo.update.mockResolvedValue(updatedReading);

      await useCase.execute(readingId, userId);

      expect(
        interpretationsService.generateInterpretation,
      ).toHaveBeenCalledWith(
        cards,
        reading.cardPositions,
        expect.any(String),
        spread,
        undefined,
        userId,
        reading.id,
        5, // Custom tarotistaId
      );
    });

    it('should default to tarotistaId 1 if not present', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading({
        tarotistaId: null,
        customQuestion: 'Test question',
      });
      const mockUser = createMockUser(userId);
      const cards = [createMockCard(1), createMockCard(2), createMockCard(3)];
      const spread = createMockSpread();
      const newInterpretation = {
        interpretation: 'New interpretation',
        fromCache: false,
      };
      const savedInterpretation = {
        id: 1,
        content: newInterpretation.interpretation,
      };
      const updatedReading = {
        ...reading,
        interpretation: newInterpretation.interpretation,
        regenerationCount: 1,
      };

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockResolvedValue(cards);
      spreadsService.findById.mockResolvedValue(spread);
      interpretationsService.generateInterpretation.mockResolvedValue(
        newInterpretation,
      );
      interpretationsRepo.create.mockReturnValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      interpretationsRepo.save.mockResolvedValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      readingRepo.update.mockResolvedValue(updatedReading);

      await useCase.execute(readingId, userId);

      expect(
        interpretationsService.generateInterpretation,
      ).toHaveBeenCalledWith(
        cards,
        reading.cardPositions,
        expect.any(String),
        spread,
        undefined,
        userId,
        reading.id,
        1, // Default tarotistaId
      );
    });
  });

  describe('execute - validation errors', () => {
    it('should throw error when user is not premium', async () => {
      const userId = 1;
      const readingId = 1;
      const error = new Error('User is not premium');

      validator.validateUserIsPremium.mockRejectedValue(error);

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(error);

      expect(validator.validateUserIsPremium).toHaveBeenCalledWith(userId);
      expect(validator.validateReadingOwnership).not.toHaveBeenCalled();
    });

    it('should throw error when reading ownership validation fails', async () => {
      const userId = 1;
      const readingId = 1;
      const mockUser = createMockUser(userId);
      const error = new Error('Not owner');

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockRejectedValue(error);

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(error);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(
        readingId,
        userId,
      );
      expect(validator.validateRegenerationCount).not.toHaveBeenCalled();
    });

    it('should throw error when regeneration count exceeds limit', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading();
      const mockUser = createMockUser(userId);
      const error = new Error('Regeneration limit exceeded');

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockImplementation(() => {
        throw error;
      });

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(error);

      expect(validator.validateRegenerationCount).toHaveBeenCalledWith(reading);
      expect(cardsService.findByIds).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when predefined question not found', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading({
        predefinedQuestionId: 999,
        customQuestion: null,
      });
      const mockUser = createMockUser(userId);
      const cards = [createMockCard(1), createMockCard(2), createMockCard(3)];

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockResolvedValue(cards);
      predefinedQuestionsService.findOne.mockResolvedValue(
        null as unknown as PredefinedQuestion,
      );

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(readingId, userId)).rejects.toThrow(
        'Pregunta predefinida con id 999 no encontrada',
      );

      expect(predefinedQuestionsService.findOne).toHaveBeenCalledWith(999);
      expect(spreadsService.findById).not.toHaveBeenCalled();
    });
  });

  describe('execute - service errors', () => {
    it('should propagate cardsService errors', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading();
      const mockUser = createMockUser(userId);
      const error = new Error('Cards service error');

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockRejectedValue(error);

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(error);

      expect(cardsService.findByIds).toHaveBeenCalled();
    });

    it('should propagate spreadsService errors', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading({
        customQuestion: 'Test question',
      });
      const mockUser = createMockUser(userId);
      const cards = [createMockCard(1), createMockCard(2), createMockCard(3)];
      const error = new Error('Spreads service error');

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockResolvedValue(cards);
      spreadsService.findById.mockRejectedValue(error);

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(error);

      expect(spreadsService.findById).toHaveBeenCalledWith(1);
    });

    it('should propagate interpretationsService errors', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading({
        customQuestion: 'Test question',
      });
      const mockUser = createMockUser(userId);
      const cards = [createMockCard(1), createMockCard(2), createMockCard(3)];
      const spread = createMockSpread();
      const error = new Error('Interpretation generation error');

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockResolvedValue(cards);
      spreadsService.findById.mockResolvedValue(spread);
      interpretationsService.generateInterpretation.mockRejectedValue(error);

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(error);

      expect(interpretationsService.generateInterpretation).toHaveBeenCalled();
    });

    it('should propagate interpretationsRepo.save errors', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading({
        customQuestion: 'Test question',
      });
      const mockUser = createMockUser(userId);
      const cards = [createMockCard(1), createMockCard(2), createMockCard(3)];
      const spread = createMockSpread();
      const newInterpretation = {
        interpretation: 'New interpretation',
        fromCache: false,
      };
      const savedInterpretation = {
        id: 1,
        content: newInterpretation.interpretation,
      };
      const error = new Error('Database save error');

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockResolvedValue(cards);
      spreadsService.findById.mockResolvedValue(spread);
      interpretationsService.generateInterpretation.mockResolvedValue(
        newInterpretation,
      );
      interpretationsRepo.create.mockReturnValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      interpretationsRepo.save.mockRejectedValue(error);

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(error);

      expect(interpretationsRepo.save).toHaveBeenCalled();
    });

    it('should propagate readingRepo.update errors', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading({
        customQuestion: 'Test question',
      });
      const mockUser = createMockUser(userId);
      const cards = [createMockCard(1), createMockCard(2), createMockCard(3)];
      const spread = createMockSpread();
      const newInterpretation = {
        interpretation: 'New interpretation',
        fromCache: false,
      };
      const savedInterpretation = {
        id: 1,
        content: newInterpretation.interpretation,
      };
      const error = new Error('Update error');

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockResolvedValue(cards);
      spreadsService.findById.mockResolvedValue(spread);
      interpretationsService.generateInterpretation.mockResolvedValue(
        newInterpretation,
      );
      interpretationsRepo.create.mockReturnValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      interpretationsRepo.save.mockResolvedValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      readingRepo.update.mockRejectedValue(error);

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(error);

      expect(readingRepo.update).toHaveBeenCalledWith(readingId, {
        interpretation: newInterpretation.interpretation,
        regenerationCount: 1,
      });
    });
  });

  describe('execute - edge cases', () => {
    it('should handle empty customQuestion (falsy but not null)', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading({
        customQuestion: '', // Empty string
        predefinedQuestionId: null,
      });
      const mockUser = createMockUser(userId);
      const cards = [createMockCard(1), createMockCard(2), createMockCard(3)];
      const spread = createMockSpread();
      const newInterpretation = {
        interpretation: 'New interpretation',
        fromCache: false,
      };
      const savedInterpretation = {
        id: 1,
        content: newInterpretation.interpretation,
      };
      const updatedReading = {
        ...reading,
        interpretation: newInterpretation.interpretation,
        regenerationCount: 1,
      };

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockResolvedValue(cards);
      spreadsService.findById.mockResolvedValue(spread);
      interpretationsService.generateInterpretation.mockResolvedValue(
        newInterpretation,
      );
      interpretationsRepo.create.mockReturnValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      interpretationsRepo.save.mockResolvedValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      readingRepo.update.mockResolvedValue(updatedReading);

      const result = await useCase.execute(readingId, userId);

      // Should use default question when customQuestion is empty string
      expect(
        interpretationsService.generateInterpretation,
      ).toHaveBeenCalledWith(
        cards,
        reading.cardPositions,
        'Proporciona una perspectiva alternativa y diferente para esta lectura',
        spread,
        undefined,
        userId,
        reading.id,
        1,
      );
      expect(result).toEqual(updatedReading);
    });

    it('should handle reading with zero cardPositions (empty array)', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading({
        cardPositions: [], // Empty array
        customQuestion: 'Test question',
      });
      const mockUser = createMockUser(userId);
      const cards = [];
      const spread = createMockSpread();
      const newInterpretation = {
        interpretation: 'New interpretation',
        fromCache: false,
      };
      const savedInterpretation = {
        id: 1,
        content: newInterpretation.interpretation,
      };
      const updatedReading = {
        ...reading,
        interpretation: newInterpretation.interpretation,
        regenerationCount: 1,
      };

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockResolvedValue(cards);
      spreadsService.findById.mockResolvedValue(spread);
      interpretationsService.generateInterpretation.mockResolvedValue(
        newInterpretation,
      );
      interpretationsRepo.create.mockReturnValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      interpretationsRepo.save.mockResolvedValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      readingRepo.update.mockResolvedValue(updatedReading);

      const result = await useCase.execute(readingId, userId);

      expect(cardsService.findByIds).toHaveBeenCalledWith([]);
      expect(result).toEqual(updatedReading);
    });

    it('should handle regenerationCount at max safe integer', async () => {
      const userId = 1;
      const readingId = 1;
      const reading = createMockReading({
        regenerationCount: Number.MAX_SAFE_INTEGER - 1,
        customQuestion: 'Test question',
      });
      const mockUser = createMockUser(userId);
      const cards = [createMockCard(1), createMockCard(2), createMockCard(3)];
      const spread = createMockSpread();
      const newInterpretation = {
        interpretation: 'New interpretation',
        fromCache: false,
      };
      const savedInterpretation = {
        id: 1,
        content: newInterpretation.interpretation,
      };
      const updatedReading = {
        ...reading,
        interpretation: newInterpretation.interpretation,
        regenerationCount: Number.MAX_SAFE_INTEGER,
      };

      validator.validateUserIsPremium.mockResolvedValue(mockUser);
      validator.validateReadingOwnership.mockResolvedValue(reading);
      validator.validateRegenerationCount.mockReturnValue(undefined);
      cardsService.findByIds.mockResolvedValue(cards);
      spreadsService.findById.mockResolvedValue(spread);
      interpretationsService.generateInterpretation.mockResolvedValue(
        newInterpretation,
      );
      interpretationsRepo.create.mockReturnValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      interpretationsRepo.save.mockResolvedValue(
        savedInterpretation as unknown as TarotInterpretation,
      );
      readingRepo.update.mockResolvedValue(updatedReading);

      const result = await useCase.execute(readingId, userId);

      expect(readingRepo.update).toHaveBeenCalledWith(readingId, {
        interpretation: newInterpretation.interpretation,
        regenerationCount: Number.MAX_SAFE_INTEGER,
      });
      expect(result.regenerationCount).toBe(Number.MAX_SAFE_INTEGER);
    });
  });
});
