import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ReadingValidatorService } from './reading-validator.service';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { User, UserPlan } from '../../../../users/entities/user.entity';

// Helper types for test cases
type PartialUser = Partial<User> & { id: number; plan?: UserPlan | null };
type PartialReading = Omit<Partial<TarotReading>, 'deletedAt' | 'user'> & {
  id: number;
  user?: Partial<User> | null;
  deletedAt?: Date | null;
};

describe('ReadingValidatorService - BUG HUNTING', () => {
  let service: ReadingValidatorService;

  // Mock repositories
  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockReadingRepository = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingValidatorService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(TarotReading),
          useValue: mockReadingRepository,
        },
      ],
    }).compile();

    service = module.get<ReadingValidatorService>(ReadingValidatorService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user when user exists', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        plan: UserPlan.FREE,
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.validateUser(999)).rejects.toThrow(
        'User with ID 999 not found',
      );
    });

    // BUG HUNTING: Zero/negative IDs
    it('should handle userId = 0', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser(0)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 0 },
      });
    });

    it('should handle negative userId', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser(-1)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: -1 },
      });
    });

    // BUG HUNTING: null/undefined userId
    it('should handle null userId', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validateUser(null as unknown as number),
      ).rejects.toThrow();
    });

    it('should handle undefined userId', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validateUser(undefined as unknown as number),
      ).rejects.toThrow();
    });

    // BUG HUNTING: String userId (type coercion)
    it('should handle string userId instead of number', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      // TypeScript permite esto en runtime si viene de HTTP request
      await expect(
        service.validateUser('123' as unknown as number),
      ).rejects.toThrow();
    });
  });

  describe('validateUserIsPremium', () => {
    it('should return user when user is premium', async () => {
      const mockPremiumUser = {
        id: 1,
        email: 'premium@example.com',
        plan: UserPlan.PREMIUM,
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockPremiumUser);

      const result = await service.validateUserIsPremium(1);

      expect(result).toEqual(mockPremiumUser);
      expect(result.plan).toBe(UserPlan.PREMIUM);
    });

    it('should throw ForbiddenException when user is free', async () => {
      const mockFreeUser = {
        id: 1,
        email: 'free@example.com',
        plan: UserPlan.FREE,
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockFreeUser);

      await expect(service.validateUserIsPremium(1)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.validateUserIsPremium(1)).rejects.toThrow(
        'Solo los usuarios premium pueden realizar esta acción',
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUserIsPremium(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    // BUG HUNTING: What if user.plan is null/undefined?
    it('should handle user with null plan', async () => {
      const mockUserNoPlan: PartialUser = {
        id: 1,
        email: 'noplan@example.com',
        plan: null as unknown as UserPlan,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUserNoPlan);

      // Should throw ForbiddenException since plan is not PREMIUM
      await expect(service.validateUserIsPremium(1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should handle user with undefined plan', async () => {
      const mockUserNoPlan: PartialUser = {
        id: 1,
        email: 'noplan@example.com',
        plan: undefined as unknown as UserPlan,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUserNoPlan);

      await expect(service.validateUserIsPremium(1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    // BUG HUNTING: What if plan is invalid string?
    it('should handle invalid plan value', async () => {
      const mockUserInvalidPlan: PartialUser = {
        id: 1,
        email: 'invalid@example.com',
        plan: 'INVALID_PLAN' as unknown as UserPlan,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUserInvalidPlan);

      await expect(service.validateUserIsPremium(1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('validateReadingOwnership', () => {
    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      withDeleted: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    beforeEach(() => {
      mockReadingRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      jest.clearAllMocks();
    });

    it('should return reading when user owns it', async () => {
      const mockReading: PartialReading = {
        id: 1,
        user: { id: 1, email: 'owner@example.com' },
        deletedAt: null,
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockReading);

      const result = await service.validateReadingOwnership(1, 1);

      expect(result).toEqual(mockReading);
      expect(mockReadingRepository.createQueryBuilder).toHaveBeenCalledWith(
        'reading',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'reading.user',
        'user',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('reading.id = :id', {
        id: 1,
      });
      expect(mockQueryBuilder.withDeleted).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when reading does not exist', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.validateReadingOwnership(999, 1)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.validateReadingOwnership(999, 1)).rejects.toThrow(
        'Reading with ID 999 not found',
      );
    });

    it('should throw ForbiddenException when user does not own reading', async () => {
      const mockReading: PartialReading = {
        id: 1,
        user: { id: 2, email: 'other@example.com' },
        deletedAt: null,
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockReading);

      await expect(service.validateReadingOwnership(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.validateReadingOwnership(1, 1)).rejects.toThrow(
        'You do not own this reading',
      );
    });

    it('should include deleted readings when includeDeleted is true', async () => {
      const mockReading: PartialReading = {
        id: 1,
        user: { id: 1, email: 'owner@example.com' },
        deletedAt: new Date(),
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockReading);

      const result = await service.validateReadingOwnership(1, 1, true);

      expect(result).toEqual(mockReading);
      expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
    });

    // BUG HUNTING: Zero/negative IDs
    it('should handle readingId = 0', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.validateReadingOwnership(0, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle userId = 0', async () => {
      const mockReading: PartialReading = {
        id: 1,
        user: { id: 1, email: 'owner@example.com' },
        deletedAt: null,
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockReading);

      await expect(service.validateReadingOwnership(1, 0)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should handle negative readingId', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.validateReadingOwnership(-1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle negative userId', async () => {
      const mockReading: PartialReading = {
        id: 1,
        user: { id: 1, email: 'owner@example.com' },
        deletedAt: null,
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockReading);

      await expect(service.validateReadingOwnership(1, -1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    // BUG HUNTING: null/undefined user in reading
    it('should handle reading with null user', async () => {
      const mockReading: PartialReading = {
        id: 1,
        user: null,
        deletedAt: null,
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockReading);

      // Now should throw BadRequestException instead of crashing
      await expect(service.validateReadingOwnership(1, 1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validateReadingOwnership(1, 1)).rejects.toThrow(
        'Reading data is corrupted: missing user relation',
      );
    });

    it('should handle reading with undefined user', async () => {
      const mockReading: PartialReading = {
        id: 1,
        user: undefined,
        deletedAt: null,
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockReading);

      await expect(service.validateReadingOwnership(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    // BUG HUNTING: What if user.id is null?
    it('should handle reading with user but null id', async () => {
      const mockReading: PartialReading = {
        id: 1,
        user: { id: null as unknown as number, email: 'test@example.com' },
        deletedAt: null,
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockReading);

      // null !== 1, should throw ForbiddenException
      await expect(service.validateReadingOwnership(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('validateReadingNotDeleted', () => {
    it('should not throw when reading is not deleted', () => {
      const mockReading: PartialReading = {
        id: 1,
        deletedAt: null,
      };

      expect(() =>
        service.validateReadingNotDeleted(mockReading as TarotReading),
      ).not.toThrow();
    });

    it('should throw BadRequestException when reading is deleted', () => {
      const mockReading: PartialReading = {
        id: 1,
        deletedAt: new Date(),
      };

      expect(() =>
        service.validateReadingNotDeleted(mockReading as TarotReading),
      ).toThrow(BadRequestException);
      expect(() =>
        service.validateReadingNotDeleted(mockReading as TarotReading),
      ).toThrow('Reading is deleted');
    });

    // BUG HUNTING: What if deletedAt is undefined (not null)?
    it('should handle undefined deletedAt', () => {
      const mockReading: PartialReading = {
        id: 1,
        deletedAt: undefined,
      };

      // undefined is falsy, should not throw
      expect(() =>
        service.validateReadingNotDeleted(mockReading as TarotReading),
      ).not.toThrow();
    });

    // BUG HUNTING: What if deletedAt is invalid date?
    it('should handle invalid date in deletedAt', () => {
      const mockReading: PartialReading = {
        id: 1,
        deletedAt: new Date('invalid'),
      };

      // Invalid date is still truthy, should throw
      expect(() =>
        service.validateReadingNotDeleted(mockReading as TarotReading),
      ).toThrow(BadRequestException);
    });

    // BUG HUNTING: What if deletedAt is a string?
    it('should handle string deletedAt', () => {
      const mockReading: PartialReading = {
        id: 1,
        deletedAt: '2025-01-01' as unknown as Date,
      };

      // String is truthy, should throw
      expect(() =>
        service.validateReadingNotDeleted(mockReading as TarotReading),
      ).toThrow(BadRequestException);
    });
  });

  describe('validateReadingDeleted', () => {
    it('should not throw when reading is deleted', () => {
      const mockReading: PartialReading = {
        id: 1,
        deletedAt: new Date(),
      };

      expect(() =>
        service.validateReadingDeleted(mockReading as TarotReading),
      ).not.toThrow();
    });

    it('should throw BadRequestException when reading is not deleted', () => {
      const mockReading: PartialReading = {
        id: 1,
        deletedAt: null,
      };

      expect(() =>
        service.validateReadingDeleted(mockReading as TarotReading),
      ).toThrow(BadRequestException);
      expect(() =>
        service.validateReadingDeleted(mockReading as TarotReading),
      ).toThrow('Reading is not deleted');
    });

    // BUG HUNTING: undefined deletedAt
    it('should handle undefined deletedAt', () => {
      const mockReading: PartialReading = {
        id: 1,
        deletedAt: undefined,
      };

      // !undefined is true, should throw
      expect(() =>
        service.validateReadingDeleted(mockReading as TarotReading),
      ).toThrow(BadRequestException);
    });
  });

  describe('validateRegenerationCount', () => {
    it('should not throw when regeneration count is below maximum', () => {
      const mockReading: PartialReading = {
        id: 1,
        regenerationCount: 0,
      };

      expect(() =>
        service.validateRegenerationCount(mockReading as TarotReading),
      ).not.toThrow();
    });

    it('should not throw when regeneration count is 2 (below max of 3)', () => {
      const mockReading: PartialReading = {
        id: 1,
        regenerationCount: 2,
      };

      expect(() =>
        service.validateRegenerationCount(mockReading as TarotReading),
      ).not.toThrow();
    });

    it('should throw HttpException when regeneration count is at maximum (3)', () => {
      const mockReading: PartialReading = {
        id: 1,
        regenerationCount: 3,
      };

      expect(() =>
        service.validateRegenerationCount(mockReading as TarotReading),
      ).toThrow(HttpException);

      try {
        service.validateRegenerationCount(mockReading as TarotReading);
      } catch (error: unknown) {
        const httpError = error as HttpException;
        expect(httpError.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        expect(httpError.message).toContain(
          'Has alcanzado el máximo de regeneraciones (3)',
        );
      }
    });

    it('should throw when regeneration count exceeds maximum', () => {
      const mockReading: PartialReading = {
        id: 1,
        regenerationCount: 5,
      };

      expect(() =>
        service.validateRegenerationCount(mockReading as TarotReading),
      ).toThrow(HttpException);
    });

    // BUG HUNTING: Negative regeneration count
    it('should handle negative regeneration count', () => {
      const mockReading: PartialReading = {
        id: 1,
        regenerationCount: -1,
      };

      // -1 < 3, should not throw
      expect(() =>
        service.validateRegenerationCount(mockReading as TarotReading),
      ).not.toThrow();
    });

    // BUG HUNTING: null/undefined regeneration count
    it('should handle null regeneration count', () => {
      const mockReading: PartialReading = {
        id: 1,
        regenerationCount: null as unknown as number,
      };

      // Now should throw BadRequestException
      expect(() =>
        service.validateRegenerationCount(mockReading as TarotReading),
      ).toThrow(BadRequestException);
      expect(() =>
        service.validateRegenerationCount(mockReading as TarotReading),
      ).toThrow('Reading data is corrupted: invalid regenerationCount');
    });

    it('should handle undefined regeneration count', () => {
      const mockReading: PartialReading = {
        id: 1,
        regenerationCount: undefined,
      };

      expect(() =>
        service.validateRegenerationCount(mockReading as TarotReading),
      ).toThrow(BadRequestException);
    });

    // BUG HUNTING: String regeneration count
    it('should handle string regeneration count', () => {
      const mockReading: PartialReading = {
        id: 1,
        regenerationCount: '10' as unknown as number,
      };

      // Should throw BadRequestException due to type validation
      expect(() =>
        service.validateRegenerationCount(mockReading as TarotReading),
      ).toThrow(BadRequestException);
    });

    // BUG HUNTING: Decimal regeneration count
    it('should handle decimal regeneration count', () => {
      const mockReading: PartialReading = {
        id: 1,
        regenerationCount: 2.9,
      };

      // 2.9 < 3, should not throw
      expect(() =>
        service.validateRegenerationCount(mockReading as TarotReading),
      ).not.toThrow();
    });

    it('should handle decimal at exact limit', () => {
      const mockReading: PartialReading = {
        id: 1,
        regenerationCount: 3.0,
      };

      // 3.0 >= 3, should throw
      expect(() =>
        service.validateRegenerationCount(mockReading as TarotReading),
      ).toThrow(HttpException);
    });
  });

  describe('validateFreeUserReadingsLimit', () => {
    it('should not throw when free user has less than 10 readings', () => {
      expect(() =>
        service.validateFreeUserReadingsLimit(5, UserPlan.FREE),
      ).not.toThrow();
    });

    it('should not throw when free user has exactly 9 readings', () => {
      expect(() =>
        service.validateFreeUserReadingsLimit(9, UserPlan.FREE),
      ).not.toThrow();
    });

    it('should throw ForbiddenException when free user has 10 readings', () => {
      expect(() =>
        service.validateFreeUserReadingsLimit(10, UserPlan.FREE),
      ).toThrow(ForbiddenException);
      expect(() =>
        service.validateFreeUserReadingsLimit(10, UserPlan.FREE),
      ).toThrow('Los usuarios free están limitados a 10 lecturas');
    });

    it('should throw when free user exceeds 10 readings', () => {
      expect(() =>
        service.validateFreeUserReadingsLimit(15, UserPlan.FREE),
      ).toThrow(ForbiddenException);
    });

    it('should not throw for premium users regardless of reading count', () => {
      expect(() =>
        service.validateFreeUserReadingsLimit(0, UserPlan.PREMIUM),
      ).not.toThrow();
      expect(() =>
        service.validateFreeUserReadingsLimit(10, UserPlan.PREMIUM),
      ).not.toThrow();
      expect(() =>
        service.validateFreeUserReadingsLimit(100, UserPlan.PREMIUM),
      ).not.toThrow();
    });

    // BUG HUNTING: Negative reading count
    it('should handle negative reading count for free user', () => {
      // Now should throw BadRequestException
      expect(() =>
        service.validateFreeUserReadingsLimit(-5, UserPlan.FREE),
      ).toThrow(BadRequestException);
      expect(() =>
        service.validateFreeUserReadingsLimit(-5, UserPlan.FREE),
      ).toThrow('Invalid totalReadings value: must be a non-negative number');
    });

    // BUG HUNTING: null/undefined totalReadings
    it('should handle null totalReadings for free user', () => {
      // Now should throw BadRequestException
      expect(() =>
        service.validateFreeUserReadingsLimit(
          null as unknown as number,
          UserPlan.FREE,
        ),
      ).toThrow(BadRequestException);
      expect(() =>
        service.validateFreeUserReadingsLimit(
          null as unknown as number,
          UserPlan.FREE,
        ),
      ).toThrow('Invalid totalReadings value: must be a non-negative number');
    });

    it('should handle undefined totalReadings for free user', () => {
      expect(() =>
        service.validateFreeUserReadingsLimit(
          undefined as unknown as number,
          UserPlan.FREE,
        ),
      ).toThrow(BadRequestException);
    });

    // BUG HUNTING: String totalReadings
    it('should handle string totalReadings', () => {
      // Should throw BadRequestException due to type validation
      expect(() =>
        service.validateFreeUserReadingsLimit(
          '15' as unknown as number,
          UserPlan.FREE,
        ),
      ).toThrow(BadRequestException);
    });

    // BUG HUNTING: Decimal totalReadings
    it('should handle decimal totalReadings', () => {
      expect(() =>
        service.validateFreeUserReadingsLimit(9.9, UserPlan.FREE),
      ).not.toThrow();

      expect(() =>
        service.validateFreeUserReadingsLimit(10.1, UserPlan.FREE),
      ).toThrow(ForbiddenException);
    });

    // BUG HUNTING: null/undefined/invalid userPlan
    it('should handle null userPlan', () => {
      // Now should throw BadRequestException
      expect(() =>
        service.validateFreeUserReadingsLimit(15, null as unknown as UserPlan),
      ).toThrow(BadRequestException);
      expect(() =>
        service.validateFreeUserReadingsLimit(15, null as unknown as UserPlan),
      ).toThrow('Invalid user plan');
    });

    it('should handle undefined userPlan', () => {
      expect(() =>
        service.validateFreeUserReadingsLimit(
          15,
          undefined as unknown as UserPlan,
        ),
      ).toThrow(BadRequestException);
    });

    it('should handle invalid userPlan string', () => {
      expect(() =>
        service.validateFreeUserReadingsLimit(
          15,
          'INVALID' as unknown as UserPlan,
        ),
      ).toThrow(BadRequestException);
    });
  });
});
