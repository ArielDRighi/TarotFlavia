import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RestoreReadingUseCase } from './restore-reading.use-case';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';
import { TarotReading } from '../../entities/tarot-reading.entity';

describe('RestoreReadingUseCase', () => {
  let useCase: RestoreReadingUseCase;
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

  const mockDeletedReading = createMockReading({ deletedAt: new Date() });
  const mockRestoredReading = createMockReading({ deletedAt: undefined });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestoreReadingUseCase,
        {
          provide: 'IReadingRepository',
          useValue: {
            restore: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: ReadingValidatorService,
          useValue: {
            validateReadingOwnership: jest.fn(),
            validateReadingDeleted: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RestoreReadingUseCase>(RestoreReadingUseCase);
    readingRepo = module.get('IReadingRepository');
    validator = module.get(ReadingValidatorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should restore deleted reading when user owns it', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockDeletedReading);
      validator.validateReadingDeleted.mockReturnValue(undefined);
      readingRepo.restore.mockResolvedValue(undefined);
      readingRepo.findById.mockResolvedValue(mockRestoredReading);

      const result = await useCase.execute(1, 100);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(
        1,
        100,
        true,
      );
      expect(validator.validateReadingDeleted).toHaveBeenCalledWith(
        mockDeletedReading,
      );
      expect(readingRepo.restore).toHaveBeenCalledWith(1);
      expect(readingRepo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockRestoredReading);
    });

    it('should throw error when user does not own reading', async () => {
      validator.validateReadingOwnership.mockRejectedValue(
        new Error('User does not own reading'),
      );

      await expect(useCase.execute(1, 200)).rejects.toThrow(
        'User does not own reading',
      );
      expect(validator.validateReadingDeleted).not.toHaveBeenCalled();
      expect(readingRepo.restore).not.toHaveBeenCalled();
    });

    it('should throw error when reading is not deleted', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockRestoredReading);
      validator.validateReadingDeleted.mockImplementation(() => {
        throw new Error('Reading is not deleted');
      });

      await expect(useCase.execute(1, 100)).rejects.toThrow(
        'Reading is not deleted',
      );
      expect(readingRepo.restore).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when reading not found after restore', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockDeletedReading);
      validator.validateReadingDeleted.mockReturnValue(undefined);
      readingRepo.restore.mockResolvedValue(undefined);
      readingRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(1, 100)).rejects.toThrow(NotFoundException);
      await expect(useCase.execute(1, 100)).rejects.toThrow(
        'Reading with ID 1 not found after restore',
      );
    });

    it('should propagate repository restore errors', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockDeletedReading);
      validator.validateReadingDeleted.mockReturnValue(undefined);
      readingRepo.restore.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(1, 100)).rejects.toThrow('Database error');
      expect(readingRepo.findById).not.toHaveBeenCalled();
    });

    it('should propagate repository findById errors', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockDeletedReading);
      validator.validateReadingDeleted.mockReturnValue(undefined);
      readingRepo.restore.mockResolvedValue(undefined);
      readingRepo.findById.mockRejectedValue(new Error('Query failed'));

      await expect(useCase.execute(1, 100)).rejects.toThrow('Query failed');
    });

    // Edge cases
    it('should handle readingId 0', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockDeletedReading);
      validator.validateReadingDeleted.mockReturnValue(undefined);
      readingRepo.restore.mockResolvedValue(undefined);
      readingRepo.findById.mockResolvedValue(mockRestoredReading);

      await useCase.execute(0, 100);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(
        0,
        100,
        true,
      );
      expect(readingRepo.restore).toHaveBeenCalledWith(0);
    });

    it('should handle negative readingId', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockDeletedReading);
      validator.validateReadingDeleted.mockReturnValue(undefined);
      readingRepo.restore.mockResolvedValue(undefined);
      readingRepo.findById.mockResolvedValue(mockRestoredReading);

      await useCase.execute(-1, 100);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(
        -1,
        100,
        true,
      );
      expect(readingRepo.restore).toHaveBeenCalledWith(-1);
    });

    it('should handle userId 0', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockDeletedReading);
      validator.validateReadingDeleted.mockReturnValue(undefined);
      readingRepo.restore.mockResolvedValue(undefined);
      readingRepo.findById.mockResolvedValue(mockRestoredReading);

      await useCase.execute(1, 0);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(
        1,
        0,
        true,
      );
    });

    it('should handle negative userId', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockDeletedReading);
      validator.validateReadingDeleted.mockReturnValue(undefined);
      readingRepo.restore.mockResolvedValue(undefined);
      readingRepo.findById.mockResolvedValue(mockRestoredReading);

      await useCase.execute(1, -1);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(
        1,
        -1,
        true,
      );
    });

    it('should handle null readingId', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockDeletedReading);
      validator.validateReadingDeleted.mockReturnValue(undefined);
      readingRepo.restore.mockResolvedValue(undefined);
      readingRepo.findById.mockResolvedValue(mockRestoredReading);

      await useCase.execute(null as any, 100);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(
        null,
        100,
        true,
      );
      expect(readingRepo.restore).toHaveBeenCalledWith(null);
    });

    it('should handle null userId', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockDeletedReading);
      validator.validateReadingDeleted.mockReturnValue(undefined);
      readingRepo.restore.mockResolvedValue(undefined);
      readingRepo.findById.mockResolvedValue(mockRestoredReading);

      await useCase.execute(1, null as any);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(
        1,
        null,
        true,
      );
    });

    it('should include deleted readings in ownership validation', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockDeletedReading);
      validator.validateReadingDeleted.mockReturnValue(undefined);
      readingRepo.restore.mockResolvedValue(undefined);
      readingRepo.findById.mockResolvedValue(mockRestoredReading);

      await useCase.execute(1, 100);

      // Verify includeDeleted=true is passed
      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(
        1,
        100,
        true,
      );
    });
  });
});
