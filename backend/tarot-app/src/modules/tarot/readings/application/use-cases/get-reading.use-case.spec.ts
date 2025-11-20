import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetReadingUseCase } from './get-reading.use-case';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';
import { TarotReading } from '../../entities/tarot-reading.entity';

describe('GetReadingUseCase', () => {
  let useCase: GetReadingUseCase;
  let readingRepo: jest.Mocked<IReadingRepository>;
  let validator: jest.Mocked<ReadingValidatorService>;

  const createMockReading = (
    overrides: Partial<TarotReading> = {},
  ): TarotReading =>
    ({
      id: 1,
      question: 'Test',
      predefinedQuestionId: null,
      predefinedQuestion: null,
      customQuestion: 'Test question',
      questionType: 'custom',
      user: { id: 100 },
      deck: { id: 1 },
      tarotista: null,
      tarotistaId: 1,
      category: null,
      cards: [],
      cardPositions: [],
      interpretation: 'Test interpretation',
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

  const mockReading = createMockReading();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetReadingUseCase,
        {
          provide: 'IReadingRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ReadingValidatorService,
          useValue: {
            validateReadingOwnership: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetReadingUseCase>(GetReadingUseCase);
    readingRepo = module.get('IReadingRepository');
    validator = module.get(ReadingValidatorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return reading when found and user owns it', async () => {
      readingRepo.findById.mockResolvedValue(mockReading);
      validator.validateReadingOwnership.mockResolvedValue(mockReading);

      const result = await useCase.execute(1, 100, false);

      expect(result).toEqual(mockReading);
      expect(readingRepo.findById).toHaveBeenCalledWith(1, [
        'deck',
        'cards',
        'user',
      ]);
      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(1, 100);
    });

    it('should throw NotFoundException when reading not found', async () => {
      readingRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, 100, false)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(999, 100, false)).rejects.toThrow(
        'Reading with ID 999 not found',
      );
      expect(validator.validateReadingOwnership).not.toHaveBeenCalled();
    });

    it('should skip ownership validation when isAdmin=true', async () => {
      readingRepo.findById.mockResolvedValue(mockReading);

      const result = await useCase.execute(1, 200, true);

      expect(result).toEqual(mockReading);
      expect(validator.validateReadingOwnership).not.toHaveBeenCalled();
    });

    it('should validate ownership when isAdmin=false (default)', async () => {
      readingRepo.findById.mockResolvedValue(mockReading);
      validator.validateReadingOwnership.mockResolvedValue(mockReading);

      await useCase.execute(1, 100);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(1, 100);
    });

    // Edge cases
    it('should handle readingId 0', async () => {
      readingRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(0, 100, false)).rejects.toThrow(
        NotFoundException,
      );
      expect(readingRepo.findById).toHaveBeenCalledWith(0, [
        'deck',
        'cards',
        'user',
      ]);
    });

    it('should handle negative readingId', async () => {
      readingRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(-1, 100, false)).rejects.toThrow(
        NotFoundException,
      );
      expect(readingRepo.findById).toHaveBeenCalledWith(-1, [
        'deck',
        'cards',
        'user',
      ]);
    });

    it('should handle userId 0', async () => {
      readingRepo.findById.mockResolvedValue(mockReading);
      validator.validateReadingOwnership.mockResolvedValue(mockReading);

      await useCase.execute(1, 0, false);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(1, 0);
    });

    it('should handle negative userId', async () => {
      readingRepo.findById.mockResolvedValue(mockReading);
      validator.validateReadingOwnership.mockResolvedValue(mockReading);

      await useCase.execute(1, -1, false);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(1, -1);
    });

    it('should handle null readingId', async () => {
      readingRepo.findById.mockResolvedValue(null);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await expect(useCase.execute(null as any, 100, false)).rejects.toThrow(
        NotFoundException,
      );
      expect(readingRepo.findById).toHaveBeenCalledWith(null, [
        'deck',
        'cards',
        'user',
      ]);
    });

    it('should handle null userId when not admin', async () => {
      readingRepo.findById.mockResolvedValue(mockReading);
      validator.validateReadingOwnership.mockResolvedValue(mockReading);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await useCase.execute(1, null as any, false);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(1, null);
    });

    it('should propagate validator errors', async () => {
      readingRepo.findById.mockResolvedValue(mockReading);
      validator.validateReadingOwnership.mockRejectedValue(
        new Error('Ownership validation failed'),
      );

      await expect(useCase.execute(1, 200, false)).rejects.toThrow(
        'Ownership validation failed',
      );
    });

    it('should propagate repository errors', async () => {
      readingRepo.findById.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute(1, 100, false)).rejects.toThrow(
        'Database connection failed',
      );
      expect(validator.validateReadingOwnership).not.toHaveBeenCalled();
    });

    it('should handle reading with missing relations', async () => {
      const readingWithoutRelations = createMockReading({
        deck: undefined,
        cards: undefined,
        user: undefined,
      });

      readingRepo.findById.mockResolvedValue(readingWithoutRelations);
      validator.validateReadingOwnership.mockResolvedValue(
        readingWithoutRelations,
      );

      const result = await useCase.execute(1, 100, false);

      expect(result).toEqual(readingWithoutRelations);
    });
  });
});
