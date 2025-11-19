import { Test, TestingModule } from '@nestjs/testing';
import { ShareReadingUseCase } from './share-reading.use-case';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';
import { ReadingShareService } from '../services/reading-share.service';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { HttpException } from '@nestjs/common';

describe('ShareReadingUseCase', () => {
  let useCase: ShareReadingUseCase;
  let readingRepo: jest.Mocked<IReadingRepository>;
  let validator: jest.Mocked<ReadingValidatorService>;
  let shareService: jest.Mocked<ReadingShareService>;

  const mockReading: Partial<TarotReading> = {
    id: 1,
    sharedToken: null,
    isPublic: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShareReadingUseCase,
        {
          provide: 'IReadingRepository',
          useValue: {
            findByShareToken: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ReadingValidatorService,
          useValue: {
            validateUserIsPremium: jest.fn(),
            validateReadingOwnership: jest.fn(),
          },
        },
        {
          provide: ReadingShareService,
          useValue: {
            generateShareToken: jest.fn(),
            validateTokenUniqueness: jest.fn(),
            generateShareUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ShareReadingUseCase>(ShareReadingUseCase);
    readingRepo = module.get('IReadingRepository');
    validator = module.get(ReadingValidatorService);
    shareService = module.get(ReadingShareService);
  });

  describe('execute - first time sharing', () => {
    it('should share reading successfully for premium user', async () => {
      const readingId = 1;
      const userId = 100;
      const newToken = 'abc123xyz';
      const shareUrl = 'http://localhost:3000/shared/abc123xyz';

      validator.validateUserIsPremium.mockResolvedValue({
        id: 100,
        email: 'test@test.com',
        plan: 'premium',
      } as any);
      validator.validateReadingOwnership.mockResolvedValue(
        mockReading as TarotReading,
      );
      shareService.generateShareToken.mockReturnValue(newToken);
      shareService.validateTokenUniqueness.mockResolvedValue(newToken);
      shareService.generateShareUrl.mockReturnValue(shareUrl);
      readingRepo.update.mockResolvedValue(mockReading as TarotReading);

      const result = await useCase.execute(readingId, userId);

      expect(validator.validateUserIsPremium).toHaveBeenCalledWith(userId);
      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(
        readingId,
        userId,
      );
      expect(shareService.generateShareToken).toHaveBeenCalled();
      expect(shareService.validateTokenUniqueness).toHaveBeenCalledWith(
        newToken,
        expect.any(Function),
      );
      expect(readingRepo.update).toHaveBeenCalledWith(readingId, {
        sharedToken: newToken,
        isPublic: true,
      });
      expect(shareService.generateShareUrl).toHaveBeenCalledWith(newToken);
      expect(result).toEqual({
        sharedToken: newToken,
        shareUrl,
        isPublic: true,
      });
    });

    it('should validate token uniqueness with repository check', async () => {
      const readingId = 1;
      const userId = 100;
      const initialToken = 'duplicate';
      const uniqueToken = 'unique123';
      const shareUrl = 'http://localhost:3000/shared/unique123';

      validator.validateUserIsPremium.mockResolvedValue({
        id: 100,
        email: 'test@test.com',
        plan: 'premium',
      } as any);
      validator.validateReadingOwnership.mockResolvedValue(
        mockReading as TarotReading,
      );
      shareService.generateShareToken.mockReturnValue(initialToken);
      shareService.generateShareUrl.mockReturnValue(shareUrl);

      // Simulate uniqueness validation calling the check function
      shareService.validateTokenUniqueness.mockImplementation(
        async (token, checkFn) => {
          // First token exists, second doesn't
          const firstExists = await checkFn(token);
          if (firstExists) {
            return uniqueToken;
          }
          return token;
        },
      );

      // First check returns existing reading (duplicate)
      readingRepo.findByShareToken.mockResolvedValueOnce({
        id: 999,
      } as TarotReading);

      readingRepo.update.mockResolvedValue(mockReading as TarotReading);

      const result = await useCase.execute(readingId, userId);

      expect(readingRepo.findByShareToken).toHaveBeenCalledWith(initialToken);
      expect(result.sharedToken).toBe(uniqueToken);
    });
  });

  describe('execute - already shared', () => {
    it('should return existing token if reading already public', async () => {
      const readingId = 1;
      const userId = 100;
      const existingToken = 'existing123';
      const shareUrl = 'http://localhost:3000/shared/existing123';

      const sharedReading: Partial<TarotReading> = {
        ...mockReading,
        sharedToken: existingToken,
        isPublic: true,
      };

      validator.validateUserIsPremium.mockResolvedValue({
        id: 100,
        email: 'test@test.com',
        plan: 'premium',
      } as any);
      validator.validateReadingOwnership.mockResolvedValue(
        sharedReading as TarotReading,
      );
      shareService.generateShareUrl.mockReturnValue(shareUrl);

      const result = await useCase.execute(readingId, userId);

      expect(validator.validateUserIsPremium).toHaveBeenCalledWith(userId);
      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(
        readingId,
        userId,
      );
      expect(shareService.generateShareToken).not.toHaveBeenCalled();
      expect(shareService.validateTokenUniqueness).not.toHaveBeenCalled();
      expect(readingRepo.update).not.toHaveBeenCalled();
      expect(shareService.generateShareUrl).toHaveBeenCalledWith(existingToken);
      expect(result).toEqual({
        sharedToken: existingToken,
        shareUrl,
        isPublic: true,
      });
    });

    it('should generate new token if reading has token but not public', async () => {
      const readingId = 1;
      const userId = 100;
      const oldToken = 'old123';
      const newToken = 'new456';
      const shareUrl = 'http://localhost:3000/shared/new456';

      const readingWithToken: Partial<TarotReading> = {
        ...mockReading,
        sharedToken: oldToken,
        isPublic: false, // Not public
      };

      validator.validateUserIsPremium.mockResolvedValue({
        id: 100,
        email: 'test@test.com',
        plan: 'premium',
      } as any);
      validator.validateReadingOwnership.mockResolvedValue(
        readingWithToken as TarotReading,
      );
      shareService.generateShareToken.mockReturnValue(newToken);
      shareService.validateTokenUniqueness.mockResolvedValue(newToken);
      shareService.generateShareUrl.mockReturnValue(shareUrl);
      readingRepo.update.mockResolvedValue(mockReading as TarotReading);

      const result = await useCase.execute(readingId, userId);

      expect(shareService.generateShareToken).toHaveBeenCalled();
      expect(shareService.validateTokenUniqueness).toHaveBeenCalled();
      expect(readingRepo.update).toHaveBeenCalledWith(readingId, {
        sharedToken: newToken,
        isPublic: true,
      });
      expect(result.sharedToken).toBe(newToken);
    });

    it('should generate new token if reading is public but has no token', async () => {
      const readingId = 1;
      const userId = 100;
      const newToken = 'new789';
      const shareUrl = 'http://localhost:3000/shared/new789';

      const publicReadingNoToken: Partial<TarotReading> = {
        ...mockReading,
        sharedToken: null,
        isPublic: true, // Public but no token
      };

      validator.validateUserIsPremium.mockResolvedValue({
        id: 100,
        email: 'test@test.com',
        plan: 'premium',
      } as any);
      validator.validateReadingOwnership.mockResolvedValue(
        publicReadingNoToken as TarotReading,
      );
      shareService.generateShareToken.mockReturnValue(newToken);
      shareService.validateTokenUniqueness.mockResolvedValue(newToken);
      shareService.generateShareUrl.mockReturnValue(shareUrl);
      readingRepo.update.mockResolvedValue(mockReading as TarotReading);

      const result = await useCase.execute(readingId, userId);

      expect(shareService.generateShareToken).toHaveBeenCalled();
      expect(readingRepo.update).toHaveBeenCalledWith(readingId, {
        sharedToken: newToken,
        isPublic: true,
      });
      expect(result.sharedToken).toBe(newToken);
    });
  });

  describe('error handling', () => {
    it('should propagate error when user is not premium', async () => {
      const readingId = 1;
      const userId = 100;
      const error = new Error('User is not premium');

      validator.validateUserIsPremium.mockRejectedValue(error);

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(
        'User is not premium',
      );
      expect(validator.validateUserIsPremium).toHaveBeenCalledWith(userId);
      expect(validator.validateReadingOwnership).not.toHaveBeenCalled();
    });

    it('should propagate error when reading ownership validation fails', async () => {
      const readingId = 1;
      const userId = 100;
      const error = new Error('Reading not found or not owned by user');

      validator.validateUserIsPremium.mockResolvedValue({
        id: 100,
        email: 'test@test.com',
        plan: 'premium',
      } as any);
      validator.validateReadingOwnership.mockRejectedValue(error);

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(
        'Reading not found or not owned by user',
      );
      expect(validator.validateReadingOwnership).toHaveBeenCalledWith(
        readingId,
        userId,
      );
      expect(shareService.generateShareToken).not.toHaveBeenCalled();
    });

    it('should propagate error when token uniqueness validation fails', async () => {
      const readingId = 1;
      const userId = 100;
      const error = new HttpException(
        'No se pudo generar un token único. Intente nuevamente.',
        500,
      );

      validator.validateUserIsPremium.mockResolvedValue({
        id: 100,
        email: 'test@test.com',
        plan: 'premium',
      } as any);
      validator.validateReadingOwnership.mockResolvedValue(
        mockReading as TarotReading,
      );
      shareService.generateShareToken.mockReturnValue('token123');
      shareService.validateTokenUniqueness.mockRejectedValue(error);

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(error);
      expect(shareService.validateTokenUniqueness).toHaveBeenCalled();
      expect(readingRepo.update).not.toHaveBeenCalled();
    });

    it('should propagate error when repository update fails', async () => {
      const readingId = 1;
      const userId = 100;
      const token = 'abc123';
      const error = new Error('Database update failed');

      validator.validateUserIsPremium.mockResolvedValue({
        id: 100,
        email: 'test@test.com',
        plan: 'premium',
      } as any);
      validator.validateReadingOwnership.mockResolvedValue(
        mockReading as TarotReading,
      );
      shareService.generateShareToken.mockReturnValue(token);
      shareService.validateTokenUniqueness.mockResolvedValue(token);
      readingRepo.update.mockRejectedValue(error);

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(
        'Database update failed',
      );
      expect(readingRepo.update).toHaveBeenCalledWith(readingId, {
        sharedToken: token,
        isPublic: true,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle readingId 0', async () => {
      const readingId = 0;
      const userId = 100;
      const error = new Error('Invalid reading ID');

      validator.validateUserIsPremium.mockResolvedValue({
        id: 100,
        email: 'test@test.com',
        plan: 'premium',
      } as any);
      validator.validateReadingOwnership.mockRejectedValue(error);

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(
        'Invalid reading ID',
      );
    });

    it('should handle userId 0', async () => {
      const readingId = 1;
      const userId = 0;
      const error = new Error('Invalid user ID');

      validator.validateUserIsPremium.mockRejectedValue(error);

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(
        'Invalid user ID',
      );
    });

    it('should handle negative readingId', async () => {
      const readingId = -1;
      const userId = 100;
      const error = new Error('Invalid reading ID');

      validator.validateUserIsPremium.mockResolvedValue({
        id: 100,
        email: 'test@test.com',
        plan: 'premium',
      } as any);
      validator.validateReadingOwnership.mockRejectedValue(error);

      await expect(useCase.execute(readingId, userId)).rejects.toThrow(
        'Invalid reading ID',
      );
    });

    it('should handle empty string sharedToken', async () => {
      const readingId = 1;
      const userId = 100;
      const newToken = 'new123';
      const shareUrl = 'http://localhost:3000/shared/new123';

      const readingEmptyToken: Partial<TarotReading> = {
        ...mockReading,
        sharedToken: '',
        isPublic: true,
      };

      validator.validateUserIsPremium.mockResolvedValue({
        id: 100,
        email: 'test@test.com',
        plan: 'premium',
      } as any);
      validator.validateReadingOwnership.mockResolvedValue(
        readingEmptyToken as TarotReading,
      );
      shareService.generateShareToken.mockReturnValue(newToken);
      shareService.validateTokenUniqueness.mockResolvedValue(newToken);
      shareService.generateShareUrl.mockReturnValue(shareUrl);
      readingRepo.update.mockResolvedValue(mockReading as TarotReading);

      const result = await useCase.execute(readingId, userId);

      // Empty string is falsy, should generate new token
      expect(shareService.generateShareToken).toHaveBeenCalled();
      expect(result.sharedToken).toBe(newToken);
    });

    it('should handle undefined sharedToken with isPublic false', async () => {
      const readingId = 1;
      const userId = 100;
      const newToken = 'new456';
      const shareUrl = 'http://localhost:3000/shared/new456';

      const readingUndefinedToken: Partial<TarotReading> = {
        ...mockReading,
        sharedToken: undefined,
        isPublic: false,
      };

      validator.validateUserIsPremium.mockResolvedValue({
        id: 100,
        email: 'test@test.com',
        plan: 'premium',
      } as any);
      validator.validateReadingOwnership.mockResolvedValue(
        readingUndefinedToken as TarotReading,
      );
      shareService.generateShareToken.mockReturnValue(newToken);
      shareService.validateTokenUniqueness.mockResolvedValue(newToken);
      shareService.generateShareUrl.mockReturnValue(shareUrl);
      readingRepo.update.mockResolvedValue(mockReading as TarotReading);

      const result = await useCase.execute(readingId, userId);

      expect(shareService.generateShareToken).toHaveBeenCalled();
      expect(result.sharedToken).toBe(newToken);
    });
  });
});
