import { Test, TestingModule } from '@nestjs/testing';
import { ListReadingsUseCase } from './list-readings.use-case';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { User, UserPlan } from '../../../../users/entities/user.entity';
import {
  QueryReadingsDto,
  SortBy,
  SortOrder,
} from '../../dto/query-readings.dto';

describe('ListReadingsUseCase', () => {
  let useCase: ListReadingsUseCase;
  let readingRepo: jest.Mocked<IReadingRepository>;

  const mockFreeUser: Partial<User> = {
    id: 1,
    email: 'free@test.com',
    plan: UserPlan.FREE,
  };

  const mockPremiumUser: Partial<User> = {
    id: 2,
    email: 'premium@test.com',
    plan: UserPlan.PREMIUM,
  };

  const createMockReading = (id: number): Partial<TarotReading> => ({
    id,
    sharedToken: null,
    isPublic: false,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListReadingsUseCase,
        {
          provide: 'IReadingRepository',
          useValue: {
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListReadingsUseCase>(ListReadingsUseCase);
    readingRepo = module.get('IReadingRepository');
  });

  describe('execute - default pagination', () => {
    it('should return first page with default limit (10) for premium user', async () => {
      const mockReadings = Array.from({ length: 10 }, (_, i) =>
        createMockReading(i + 1),
      ) as TarotReading[];

      readingRepo.findByUserId.mockResolvedValue([mockReadings, 25]);

      const result = await useCase.execute(mockPremiumUser as User);

      expect(readingRepo.findByUserId).toHaveBeenCalledWith(2, {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        filters: {},
        dateFrom: undefined,
        dateTo: undefined,
      });

      expect(result.data).toHaveLength(10);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it('should use default values when queryDto is undefined', async () => {
      readingRepo.findByUserId.mockResolvedValue([[], 0]);

      await useCase.execute(mockPremiumUser as User, undefined);

      expect(readingRepo.findByUserId).toHaveBeenCalledWith(2, {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        filters: {},
        dateFrom: undefined,
        dateTo: undefined,
      });
    });
  });

  describe('execute - custom pagination', () => {
    it('should return second page with custom limit', async () => {
      const queryDto: QueryReadingsDto = {
        page: 2,
        limit: 5,
      };

      const mockReadings = Array.from({ length: 5 }, (_, i) =>
        createMockReading(i + 6),
      ) as TarotReading[];

      readingRepo.findByUserId.mockResolvedValue([mockReadings, 15]);

      const result = await useCase.execute(mockPremiumUser as User, queryDto);

      expect(readingRepo.findByUserId).toHaveBeenCalledWith(2, {
        page: 2,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        filters: {},
        dateFrom: undefined,
        dateTo: undefined,
      });

      expect(result.data).toHaveLength(5);
      expect(result.meta).toEqual({
        page: 2,
        limit: 5,
        totalItems: 15,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it('should handle last page correctly', async () => {
      const queryDto: QueryReadingsDto = {
        page: 3,
        limit: 10,
      };

      const mockReadings = Array.from({ length: 5 }, (_, i) =>
        createMockReading(i + 21),
      ) as TarotReading[];

      readingRepo.findByUserId.mockResolvedValue([mockReadings, 25]);

      const result = await useCase.execute(mockPremiumUser as User, queryDto);

      expect(result.data).toHaveLength(5);
      expect(result.meta).toEqual({
        page: 3,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });

    it('should handle page beyond total pages', async () => {
      const queryDto: QueryReadingsDto = {
        page: 10,
        limit: 10,
      };

      readingRepo.findByUserId.mockResolvedValue([[], 25]);

      const result = await useCase.execute(mockPremiumUser as User, queryDto);

      expect(result.data).toHaveLength(0);
      expect(result.meta).toEqual({
        page: 10,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });
  });

  describe('execute - sorting', () => {
    it('should sort by created_at DESC by default', async () => {
      readingRepo.findByUserId.mockResolvedValue([[], 0]);

      await useCase.execute(mockPremiumUser as User, {});

      expect(readingRepo.findByUserId).toHaveBeenCalledWith(
        2,
        expect.objectContaining({
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        }),
      );
    });

    it('should convert snake_case created_at to camelCase createdAt', async () => {
      const queryDto: QueryReadingsDto = {
        sortBy: SortBy.CREATED_AT,
        sortOrder: SortOrder.ASC,
      };

      readingRepo.findByUserId.mockResolvedValue([[], 0]);

      await useCase.execute(mockPremiumUser as User, queryDto);

      expect(readingRepo.findByUserId).toHaveBeenCalledWith(
        2,
        expect.objectContaining({
          sortBy: 'createdAt',
          sortOrder: 'ASC',
        }),
      );
    });

    it('should convert updated_at to updatedAt', async () => {
      const queryDto: QueryReadingsDto = {
        sortBy: SortBy.UPDATED_AT,
        sortOrder: SortOrder.DESC,
      };

      readingRepo.findByUserId.mockResolvedValue([[], 0]);

      await useCase.execute(mockPremiumUser as User, queryDto);

      expect(readingRepo.findByUserId).toHaveBeenCalledWith(
        2,
        expect.objectContaining({
          sortBy: 'updatedAt',
          sortOrder: 'DESC',
        }),
      );
    });
  });

  describe('execute - filters', () => {
    it('should apply categoryId filter', async () => {
      const queryDto: QueryReadingsDto = {
        categoryId: 5,
      };

      readingRepo.findByUserId.mockResolvedValue([[], 0]);

      await useCase.execute(mockPremiumUser as User, queryDto);

      expect(readingRepo.findByUserId).toHaveBeenCalledWith(
        2,
        expect.objectContaining({
          filters: {
            categoryId: 5,
          },
        }),
      );
    });

    it('should apply date filters', async () => {
      const dateFrom = '2025-01-01T00:00:00.000Z';
      const dateTo = '2025-01-31T23:59:59.999Z';

      const queryDto: QueryReadingsDto = {
        dateFrom,
        dateTo,
      };

      readingRepo.findByUserId.mockResolvedValue([[], 0]);

      await useCase.execute(mockPremiumUser as User, queryDto);

      expect(readingRepo.findByUserId).toHaveBeenCalledWith(
        2,
        expect.objectContaining({
          dateFrom,
          dateTo,
        }),
      );
    });

    it('should combine multiple filters', async () => {
      const dateFrom = '2025-01-01T00:00:00.000Z';
      const dateTo = '2025-01-31T23:59:59.999Z';

      const queryDto: QueryReadingsDto = {
        categoryId: 3,
        dateFrom,
        dateTo,
        page: 2,
        limit: 5,
        sortBy: SortBy.UPDATED_AT,
        sortOrder: SortOrder.ASC,
      };

      readingRepo.findByUserId.mockResolvedValue([[], 0]);

      await useCase.execute(mockPremiumUser as User, queryDto);

      expect(readingRepo.findByUserId).toHaveBeenCalledWith(2, {
        page: 2,
        limit: 5,
        sortBy: 'updatedAt',
        sortOrder: 'ASC',
        filters: {
          categoryId: 3,
        },
        dateFrom,
        dateTo,
      });
    });

    it('should not include categoryId in filters if undefined', async () => {
      const queryDto: QueryReadingsDto = {
        categoryId: undefined,
      };

      readingRepo.findByUserId.mockResolvedValue([[], 0]);

      await useCase.execute(mockPremiumUser as User, queryDto);

      expect(readingRepo.findByUserId).toHaveBeenCalledWith(
        2,
        expect.objectContaining({
          filters: {},
        }),
      );
    });
  });

  describe('execute - free user limitations', () => {
    it('should limit free user to 10 readings even if they have more', async () => {
      const mockReadings = Array.from({ length: 10 }, (_, i) =>
        createMockReading(i + 1),
      ) as TarotReading[];

      // Free user has 50 readings total, but should only see 10
      readingRepo.findByUserId.mockResolvedValue([mockReadings, 50]);

      const result = await useCase.execute(mockFreeUser as User);

      expect(result.data).toHaveLength(10);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        totalItems: 10, // Limited to 10
        totalPages: 1, // Only 1 page for free users
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should not limit free user if they have less than 10 readings', async () => {
      const mockReadings = Array.from({ length: 5 }, (_, i) =>
        createMockReading(i + 1),
      ) as TarotReading[];

      readingRepo.findByUserId.mockResolvedValue([mockReadings, 5]);

      const result = await useCase.execute(mockFreeUser as User);

      expect(result.data).toHaveLength(5);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        totalItems: 5,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should limit free user with custom page size', async () => {
      const queryDto: QueryReadingsDto = {
        limit: 5,
      };

      const mockReadings = Array.from({ length: 5 }, (_, i) =>
        createMockReading(i + 1),
      ) as TarotReading[];

      readingRepo.findByUserId.mockResolvedValue([mockReadings, 100]);

      const result = await useCase.execute(mockFreeUser as User, queryDto);

      expect(result.meta).toEqual({
        page: 1,
        limit: 5,
        totalItems: 10, // Limited to 10
        totalPages: 2, // 10 items / 5 per page = 2 pages
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });
  });

  describe('execute - edge cases', () => {
    it('should handle empty results', async () => {
      readingRepo.findByUserId.mockResolvedValue([[], 0]);

      const result = await useCase.execute(mockPremiumUser as User);

      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should handle exactly 10 items with default limit', async () => {
      const mockReadings = Array.from({ length: 10 }, (_, i) =>
        createMockReading(i + 1),
      ) as TarotReading[];

      readingRepo.findByUserId.mockResolvedValue([mockReadings, 10]);

      const result = await useCase.execute(mockPremiumUser as User);

      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        totalItems: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should handle page 0 (should still work, treated as page 0)', async () => {
      const queryDto: QueryReadingsDto = {
        page: 0,
      };

      readingRepo.findByUserId.mockResolvedValue([[], 10]);

      const result = await useCase.execute(mockPremiumUser as User, queryDto);

      expect(readingRepo.findByUserId).toHaveBeenCalledWith(
        2,
        expect.objectContaining({
          page: 0,
        }),
      );

      expect(result.meta.page).toBe(0);
      expect(result.meta.hasPreviousPage).toBe(false);
    });

    it('should handle negative page (passed as-is to repository)', async () => {
      const queryDto: QueryReadingsDto = {
        page: -1,
      };

      readingRepo.findByUserId.mockResolvedValue([[], 10]);

      const result = await useCase.execute(mockPremiumUser as User, queryDto);

      expect(readingRepo.findByUserId).toHaveBeenCalledWith(
        2,
        expect.objectContaining({
          page: -1,
        }),
      );

      expect(result.meta.page).toBe(-1);
    });

    it('should handle limit 0', async () => {
      const queryDto: QueryReadingsDto = {
        limit: 0,
      };

      readingRepo.findByUserId.mockResolvedValue([[], 10]);

      const result = await useCase.execute(mockPremiumUser as User, queryDto);

      expect(result.meta.limit).toBe(0);
      // totalPages would be Infinity, but Math.ceil handles it
      expect(result.meta.totalPages).toBe(Infinity);
    });

    it('should handle categoryId 0', async () => {
      const queryDto: QueryReadingsDto = {
        categoryId: 0,
      };

      readingRepo.findByUserId.mockResolvedValue([[], 0]);

      await useCase.execute(mockPremiumUser as User, queryDto);

      expect(readingRepo.findByUserId).toHaveBeenCalledWith(
        2,
        expect.objectContaining({
          filters: {
            categoryId: 0,
          },
        }),
      );
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database connection failed');
      readingRepo.findByUserId.mockRejectedValue(error);

      await expect(useCase.execute(mockPremiumUser as User)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
