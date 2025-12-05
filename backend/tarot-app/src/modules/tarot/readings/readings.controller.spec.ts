import { Test, TestingModule } from '@nestjs/testing';
import { ReadingsController } from './readings.controller';
import { ReadingsOrchestratorService } from './application/services/readings-orchestrator.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { QueryReadingsDto, SortBy, SortOrder } from './dto/query-readings.dto';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { RequiresPremiumForCustomQuestionGuard } from './guards/requires-premium-for-custom-question.guard';
import { CheckUsageLimitGuard } from '../../usage-limits/guards/check-usage-limit.guard';
import { AIQuotaGuard } from '../../ai-usage/infrastructure/guards/ai-quota.guard';
import { IncrementUsageInterceptor } from '../../usage-limits/interceptors/increment-usage.interceptor';
import { ReadingsCacheInterceptor } from './interceptors/readings-cache.interceptor';

describe('ReadingsController', () => {
  let controller: ReadingsController;
  let orchestrator: ReadingsOrchestratorService;

  const mockReading = {
    id: 1,
    userId: 1,
    question: 'Test question',
    interpretation: 'Test interpretation',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrchestrator = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findTrashedReadings: jest.fn(),
    regenerateInterpretation: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
    shareReading: jest.fn(),
    unshareReading: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadingsController],
      providers: [
        {
          provide: ReadingsOrchestratorService,
          useValue: mockOrchestrator,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RequiresPremiumForCustomQuestionGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CheckUsageLimitGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AIQuotaGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(IncrementUsageInterceptor)
      .useValue({
        intercept: (_context: unknown, next: { handle: () => unknown }) =>
          next.handle(),
      })
      .overrideInterceptor(ReadingsCacheInterceptor)
      .useValue({
        intercept: (_context: unknown, next: { handle: () => unknown }) =>
          next.handle(),
      })
      .compile();

    controller = module.get<ReadingsController>(ReadingsController);
    orchestrator = module.get<ReadingsOrchestratorService>(
      ReadingsOrchestratorService,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createReading', () => {
    it('should create a new reading with predefined question', async () => {
      const createDto: CreateReadingDto = {
        predefinedQuestionId: 5,
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'past', isReversed: false },
          { cardId: 2, position: 'present', isReversed: true },
          { cardId: 3, position: 'future', isReversed: false },
        ],
        generateInterpretation: true,
      };

      mockOrchestrator.create.mockResolvedValue(mockReading);

      const req = { user: { userId: 1 } };
      const result = await controller.createReading(req, createDto);

      expect(orchestrator.create).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
        createDto,
      );
      expect(result).toEqual(mockReading);
    });

    it('should create a new reading with custom question (premium)', async () => {
      const createDto: CreateReadingDto = {
        customQuestion: '¿Cuál es mi propósito?',
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'past', isReversed: false },
          { cardId: 2, position: 'present', isReversed: true },
          { cardId: 3, position: 'future', isReversed: false },
        ],
        generateInterpretation: true,
      };

      const readingWithCustom = {
        ...mockReading,
        customQuestion: createDto.customQuestion,
      };
      mockOrchestrator.create.mockResolvedValue(readingWithCustom);

      const req = { user: { userId: 1 } };
      const result = await controller.createReading(req, createDto);

      expect(orchestrator.create).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
        createDto,
      );
      expect(result.customQuestion).toBe(createDto.customQuestion);
    });
  });

  describe('getTrashedReadings', () => {
    it('should return trashed readings for the user', async () => {
      const trashedReadings = [
        { ...mockReading, deletedAt: new Date() },
        { ...mockReading, id: 2, deletedAt: new Date() },
      ];

      mockOrchestrator.findTrashedReadings.mockResolvedValue(trashedReadings);

      const req = { user: { userId: 1 } };
      const result = await controller.getTrashedReadings(req);

      expect(orchestrator.findTrashedReadings).toHaveBeenCalledWith(1);
      expect(result).toEqual(trashedReadings);
      expect(result).toHaveLength(2);
    });

    it('should return empty array if no trashed readings', async () => {
      mockOrchestrator.findTrashedReadings.mockResolvedValue([]);

      const req = { user: { userId: 1 } };
      const result = await controller.getTrashedReadings(req);

      expect(orchestrator.findTrashedReadings).toHaveBeenCalledWith(1);
      expect(result).toEqual([]);
    });
  });

  describe('getUserReadings', () => {
    it('should return paginated readings with default pagination', async () => {
      const paginatedResponse = {
        data: [mockReading],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockOrchestrator.findAll.mockResolvedValue(paginatedResponse);

      const req = { user: { userId: 1 } };
      const queryDto: QueryReadingsDto = { page: 1, limit: 10 };
      const result = await controller.getUserReadings(req, queryDto);

      expect(orchestrator.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
        queryDto,
      );
      expect(result).toEqual(paginatedResponse);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should return paginated readings with custom pagination', async () => {
      const paginatedResponse = {
        data: [mockReading],
        meta: {
          page: 2,
          limit: 5,
          totalItems: 10,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      mockOrchestrator.findAll.mockResolvedValue(paginatedResponse);

      const req = { user: { userId: 1 } };
      const queryDto: QueryReadingsDto = { page: 2, limit: 5 };
      const result = await controller.getUserReadings(req, queryDto);

      expect(orchestrator.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
        queryDto,
      );
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
    });

    it('should apply filters (categoryId, dateFrom, dateTo)', async () => {
      const paginatedResponse = {
        data: [mockReading],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockOrchestrator.findAll.mockResolvedValue(paginatedResponse);

      const req = { user: { userId: 1 } };
      const queryDto: QueryReadingsDto = {
        page: 1,
        limit: 10,
        categoryId: 2,
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      };
      const result = await controller.getUserReadings(req, queryDto);

      expect(orchestrator.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
        queryDto,
      );
      expect(result).toEqual(paginatedResponse);
    });

    it('should apply sorting (sortBy, sortOrder)', async () => {
      const paginatedResponse = {
        data: [mockReading],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockOrchestrator.findAll.mockResolvedValue(paginatedResponse);

      const req = { user: { userId: 1 } };
      const queryDto: QueryReadingsDto = {
        page: 1,
        limit: 10,
        sortBy: SortBy.CREATED_AT,
        sortOrder: SortOrder.ASC,
      };
      const result = await controller.getUserReadings(req, queryDto);

      expect(orchestrator.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
        queryDto,
      );
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('getReadingById', () => {
    it('should return a specific reading for owner', async () => {
      mockOrchestrator.findOne.mockResolvedValue(mockReading);

      const req = { user: { userId: 1, isAdmin: false } };
      const result = await controller.getReadingById(req, 1);

      expect(orchestrator.findOne).toHaveBeenCalledWith(1, 1, false);
      expect(result).toEqual(mockReading);
    });

    it('should return a specific reading for admin', async () => {
      mockOrchestrator.findOne.mockResolvedValue(mockReading);

      const req = { user: { userId: 999, isAdmin: true } };
      const result = await controller.getReadingById(req, 1);

      expect(orchestrator.findOne).toHaveBeenCalledWith(1, 999, true);
      expect(result).toEqual(mockReading);
    });

    it('should handle isAdmin undefined as false', async () => {
      mockOrchestrator.findOne.mockResolvedValue(mockReading);

      const req = { user: { userId: 1 } };
      const result = await controller.getReadingById(req, 1);

      expect(orchestrator.findOne).toHaveBeenCalledWith(1, 1, false);
      expect(result).toEqual(mockReading);
    });
  });

  describe('regenerateInterpretation', () => {
    it('should regenerate interpretation for a reading', async () => {
      const regeneratedReading = {
        ...mockReading,
        interpretation: 'New interpretation',
        regenerationCount: 1,
      };

      mockOrchestrator.regenerateInterpretation.mockResolvedValue(
        regeneratedReading,
      );

      const req = { user: { userId: 1 } };
      const result = await controller.regenerateInterpretation(req, 1);

      expect(orchestrator.regenerateInterpretation).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(regeneratedReading);
      expect(result.regenerationCount).toBe(1);
    });
  });

  describe('deleteReading', () => {
    it('should soft delete a reading successfully', async () => {
      mockOrchestrator.remove.mockResolvedValue(undefined);

      const req = { user: { userId: 1 } };
      const result = await controller.deleteReading(req, 1);

      expect(orchestrator.remove).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual({ message: 'Lectura eliminada con éxito' });
    });
  });

  describe('restoreReading', () => {
    it('should restore a deleted reading successfully', async () => {
      const restoredReading = {
        ...mockReading,
        deletedAt: null,
      };

      mockOrchestrator.restore.mockResolvedValue(restoredReading);

      const req = { user: { userId: 1 } };
      const result = await controller.restoreReading(req, 1);

      expect(orchestrator.restore).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(restoredReading);
    });
  });

  describe('shareReading', () => {
    it('should generate share token for a reading (premium only)', async () => {
      const sharedReading = {
        ...mockReading,
        sharedToken: 'abc123-share-token',
        isPublic: true,
      };

      mockOrchestrator.shareReading.mockResolvedValue(sharedReading);

      const req = { user: { userId: 1 } };
      const result = await controller.shareReading(req, 1);

      expect(orchestrator.shareReading).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(sharedReading);
      expect(result.sharedToken).toBe('abc123-share-token');
      expect(result.isPublic).toBe(true);
    });
  });

  describe('unshareReading', () => {
    it('should remove share token and make reading private', async () => {
      const unsharedReading = {
        ...mockReading,
        sharedToken: null,
        isPublic: false,
      };

      mockOrchestrator.unshareReading.mockResolvedValue(unsharedReading);

      const req = { user: { userId: 1 } };
      const result = await controller.unshareReading(req, 1);

      expect(orchestrator.unshareReading).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(unsharedReading);
      expect(result.sharedToken).toBeNull();
      expect(result.isPublic).toBe(false);
    });
  });
});
