import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ReadingsController } from './readings.controller';
import { ReadingsOrchestratorService } from './application/services/readings-orchestrator.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { QueryReadingsDto } from './dto/query-readings.dto';
import { User } from '../../users/entities/user.entity';
import { TarotReading } from './entities/tarot-reading.entity';
import { TarotDeck } from '../decks/entities/tarot-deck.entity';
import { CheckUsageLimitGuard } from '../../usage-limits/guards/check-usage-limit.guard';
import { IncrementUsageInterceptor } from '../../usage-limits/interceptors/increment-usage.interceptor';
import { UsageLimitsService } from '../../usage-limits/usage-limits.service';

describe('ReadingsController', () => {
  let controller: ReadingsController;

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    username: 'testuser',
    password: 'hashedpassword',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as User;

  const mockReading: TarotReading = {
    id: 1,
    question: 'What does my future hold?',
    predefinedQuestionId: null,
    predefinedQuestion: null,
    customQuestion: null,
    questionType: null,
    user: mockUser,
    deck: {} as TarotDeck,
    cards: [],
    category: null,
    tarotista: null,
    tarotistaId: null,
    cardPositions: [
      { cardId: 1, position: 'past', isReversed: false },
      { cardId: 2, position: 'present', isReversed: true },
    ],
    interpretation: 'Your reading suggests...',
    createdAt: new Date(),
    updatedAt: new Date(),
    regenerationCount: 0,
    interpretations: [],
    sharedToken: null,
    isPublic: false,
    viewCount: 0,
  } as TarotReading;

  const mockOrchestrator = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findTrashedReadings: jest.fn(),
    restore: jest.fn(),
    shareReading: jest.fn(),
    unshareReading: jest.fn(),
    regenerateInterpretation: jest.fn(),
    findAllForAdmin: jest.fn(),
    cleanupOldDeletedReadings: jest.fn(),
    getSharedReading: jest.fn(),
  };

  const mockUsageLimitsService = {
    checkLimit: jest.fn(),
    incrementUsage: jest.fn(),
    getRemainingUsage: jest.fn(),
    cleanOldRecords: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadingsController],
      providers: [
        {
          provide: ReadingsOrchestratorService,
          useValue: mockOrchestrator,
        },
        {
          provide: UsageLimitsService,
          useValue: mockUsageLimitsService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        CheckUsageLimitGuard,
        IncrementUsageInterceptor,
        Reflector,
      ],
    }).compile();

    controller = module.get<ReadingsController>(ReadingsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new reading with predefined question', async () => {
      const createDto: CreateReadingDto = {
        predefinedQuestionId: 5,
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2],
        cardPositions: [
          { cardId: 1, position: 'past', isReversed: false },
          { cardId: 2, position: 'present', isReversed: true },
        ],
        generateInterpretation: true,
      };

      const req = { user: { userId: mockUser.id } };
      mockOrchestrator.create.mockResolvedValue(mockReading);

      const result = await controller.createReading(req, createDto);

      expect(mockOrchestrator.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUser.id,
        }),
        createDto,
      );
      expect(result).toEqual(mockReading);
    });

    it('should create a new reading with custom question', async () => {
      const createDto: CreateReadingDto = {
        customQuestion: '¿Cuál es mi propósito en la vida?',
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2],
        cardPositions: [
          { cardId: 1, position: 'past', isReversed: false },
          { cardId: 2, position: 'present', isReversed: true },
        ],
        generateInterpretation: true,
      };

      const req = { user: { userId: mockUser.id } };
      const readingWithCustom = {
        ...mockReading,
        customQuestion: createDto.customQuestion,
      };
      mockOrchestrator.create.mockResolvedValue(readingWithCustom);

      const result = await controller.createReading(req, createDto);

      expect(mockOrchestrator.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUser.id,
        }),
        createDto,
      );
      expect(result).toEqual(readingWithCustom);
    });
  });

  describe('getUserReadings', () => {
    it('should return paginated readings for the user', async () => {
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
      const req = { user: { userId: mockUser.id } };
      const queryDto: QueryReadingsDto = { page: 1, limit: 10 };
      mockOrchestrator.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.getUserReadings(req, queryDto);

      expect(mockOrchestrator.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ id: mockUser.id }),
        queryDto,
      );
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('getReadingById', () => {
    it('should return a specific reading', async () => {
      const req = { user: { userId: mockUser.id, isAdmin: false } };
      mockOrchestrator.findOne.mockResolvedValue(mockReading);

      const result = await controller.getReadingById(req, mockReading.id);

      expect(mockOrchestrator.findOne).toHaveBeenCalledWith(
        mockReading.id,
        mockUser.id,
        false,
      );
      expect(result).toEqual(mockReading);
    });
  });
});
