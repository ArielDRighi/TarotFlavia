import { Test, TestingModule } from '@nestjs/testing';
import { DeleteReadingUseCase } from './delete-reading.use-case';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';
import { TarotReading } from '../../entities/tarot-reading.entity';

describe('DeleteReadingUseCase', () => {
  let useCase: DeleteReadingUseCase;
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
        DeleteReadingUseCase,
        {
          provide: 'IReadingRepository',
          useValue: {
            softDelete: jest.fn(),
          },
        },
        {
          provide: ReadingValidatorService,
          useValue: {
            validateReadingOwnership: jest.fn(),
            validateReadingNotDeleted: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteReadingUseCase>(DeleteReadingUseCase);
    readingRepo = module.get('IReadingRepository');
    validator = module.get(ReadingValidatorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should soft delete reading when user owns it and not deleted', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockReading);
      validator.validateReadingNotDeleted.mockReturnValue(undefined);
      readingRepo.softDelete.mockResolvedValue(undefined);

      await useCase.execute(1, 100);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(1, 100);
      expect(validator.validateReadingNotDeleted).toHaveBeenCalledWith(
        mockReading,
      );
      expect(readingRepo.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw error when user does not own reading', async () => {
      validator.validateReadingOwnership.mockRejectedValue(
        new Error('User does not own reading'),
      );

      await expect(useCase.execute(1, 200)).rejects.toThrow(
        'User does not own reading',
      );
      expect(validator.validateReadingNotDeleted).not.toHaveBeenCalled();
      expect(readingRepo.softDelete).not.toHaveBeenCalled();
    });

    it('should throw error when reading is already deleted', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockReading);
      validator.validateReadingNotDeleted.mockImplementation(() => {
        throw new Error('Reading is already deleted');
      });

      await expect(useCase.execute(1, 100)).rejects.toThrow(
        'Reading is already deleted',
      );
      expect(readingRepo.softDelete).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockReading);
      validator.validateReadingNotDeleted.mockReturnValue(undefined);
      readingRepo.softDelete.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(1, 100)).rejects.toThrow('Database error');
    });

    // Edge cases
    it('should handle readingId 0', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockReading);
      validator.validateReadingNotDeleted.mockReturnValue(undefined);
      readingRepo.softDelete.mockResolvedValue(undefined);

      await useCase.execute(0, 100);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(0, 100);
      expect(readingRepo.softDelete).toHaveBeenCalledWith(0);
    });

    it('should handle negative readingId', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockReading);
      validator.validateReadingNotDeleted.mockReturnValue(undefined);
      readingRepo.softDelete.mockResolvedValue(undefined);

      await useCase.execute(-1, 100);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(-1, 100);
      expect(readingRepo.softDelete).toHaveBeenCalledWith(-1);
    });

    it('should handle userId 0', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockReading);
      validator.validateReadingNotDeleted.mockReturnValue(undefined);
      readingRepo.softDelete.mockResolvedValue(undefined);

      await useCase.execute(1, 0);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(1, 0);
    });

    it('should handle negative userId', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockReading);
      validator.validateReadingNotDeleted.mockReturnValue(undefined);
      readingRepo.softDelete.mockResolvedValue(undefined);

      await useCase.execute(1, -1);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(1, -1);
    });

    it('should handle null readingId', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockReading);
      validator.validateReadingNotDeleted.mockReturnValue(undefined);
      readingRepo.softDelete.mockResolvedValue(undefined);

      await useCase.execute(null as any, 100);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(
        null,
        100,
      );
      expect(readingRepo.softDelete).toHaveBeenCalledWith(null);
    });

    it('should handle null userId', async () => {
      validator.validateReadingOwnership.mockResolvedValue(mockReading);
      validator.validateReadingNotDeleted.mockReturnValue(undefined);
      readingRepo.softDelete.mockResolvedValue(undefined);

      await useCase.execute(1, null as any);

      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(1, null);
    });

    it('should handle validator returning deleted reading object', async () => {
      const deletedReading = createMockReading({
        deletedAt: new Date(),
      });

      validator.validateReadingOwnership.mockResolvedValue(deletedReading);
      validator.validateReadingNotDeleted.mockImplementation(() => {
        throw new Error('Reading is already deleted');
      });

      await expect(useCase.execute(1, 100)).rejects.toThrow(
        'Reading is already deleted',
      );
    });
  });
});
