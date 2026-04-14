import { Test, TestingModule } from '@nestjs/testing';
import { DailyReadingService } from './daily-reading.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DailyReading } from './entities/daily-reading.entity';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InterpretationsService } from '../interpretations/interpretations.service';
import { UserPlan } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { PlanConfigService } from '../../plan-config/plan-config.service';
import { UsageLimitsService } from '../../usage-limits/usage-limits.service';

interface MockQueryBuilder {
  where: jest.Mock;
  andWhere: jest.Mock;
  leftJoinAndSelect: jest.Mock;
  orderBy: jest.Mock;
  skip: jest.Mock;
  take: jest.Mock;
  limit: jest.Mock;
  getOne: jest.Mock;
  getManyAndCount: jest.Mock;
}

interface MockRepository {
  create: jest.Mock;
  save: jest.Mock;
  findOne: jest.Mock;
  createQueryBuilder: jest.Mock;
  count: jest.Mock;
}

interface MockInterpretationsService {
  generateDailyCardInterpretation: jest.Mock;
}

interface MockUsersService {
  findById: jest.Mock;
}

interface MockPlanConfigService {
  findByPlanType: jest.Mock;
  getDailyCardLimit: jest.Mock;
  getTarotReadingsLimit: jest.Mock;
}

interface MockUsageLimitsService {
  checkLimit: jest.Mock;
  incrementUsage: jest.Mock;
}

describe('DailyReadingService', () => {
  let service: DailyReadingService;
  let mockDailyReadingRepo: MockRepository;
  let mockCardRepo: MockRepository;
  let mockInterpretationsService: MockInterpretationsService;
  let mockUsersService: MockUsersService;
  let mockPlanConfigService: MockPlanConfigService;
  let mockUsageLimitsService: MockUsageLimitsService;
  let mockDailyReadingQueryBuilder: MockQueryBuilder;
  let mockCardQueryBuilder: MockQueryBuilder;

  beforeEach(async () => {
    // Mock QueryBuilder para DailyReading
    mockDailyReadingQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getManyAndCount: jest.fn(),
    };

    // Mock QueryBuilder para TarotCard
    mockCardQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getManyAndCount: jest.fn(),
    };

    mockDailyReadingRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest
        .fn()
        .mockReturnValue(mockDailyReadingQueryBuilder),
    };

    mockCardRepo = {
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockCardQueryBuilder),
    };

    mockInterpretationsService = {
      generateDailyCardInterpretation: jest.fn(),
    };

    mockUsersService = {
      findById: jest.fn(),
    };

    mockPlanConfigService = {
      findByPlanType: jest.fn(),
      getDailyCardLimit: jest.fn(),
      getTarotReadingsLimit: jest.fn(),
    };

    mockUsageLimitsService = {
      checkLimit: jest.fn(),
      incrementUsage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyReadingService,
        {
          provide: getRepositoryToken(DailyReading),
          useValue: mockDailyReadingRepo,
        },
        {
          provide: getRepositoryToken(TarotCard),
          useValue: mockCardRepo,
        },
        {
          provide: InterpretationsService,
          useValue: mockInterpretationsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: PlanConfigService,
          useValue: mockPlanConfigService,
        },
        {
          provide: UsageLimitsService,
          useValue: mockUsageLimitsService,
        },
      ],
    }).compile();

    service = module.get<DailyReadingService>(DailyReadingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDailyCard', () => {
    const userId = 1;
    const tarotistaId = 1;

    beforeEach(() => {
      // Setup default mocks for plan config and usage limits
      // Tests can override these if needed
      mockPlanConfigService.findByPlanType.mockResolvedValue({
        planType: UserPlan.FREE,
        dailyCardLimit: 1,
        tarotReadingsLimit: 3,
      });
      mockUsageLimitsService.checkLimit.mockResolvedValue(true);
    });

    it('should throw ConflictException if user already has a daily card for today', async () => {
      // Mock plan config para permitir la verificación de límites
      mockPlanConfigService.findByPlanType.mockResolvedValue({
        planType: UserPlan.FREE,
        dailyCardLimit: 1,
        tarotReadingsLimit: 3,
      });

      // Mock usage limit - usuario NO ha alcanzado límite
      mockUsageLimitsService.checkLimit.mockResolvedValue(true);

      // Mock user lookup
      mockUsersService.findById.mockResolvedValue({
        id: userId,
        email: 'test@test.com',
        plan: UserPlan.FREE,
      });

      // Mock que YA existe una carta del día
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue({ id: 1 });

      await expect(
        service.generateDailyCard(userId, tarotistaId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.generateDailyCard(userId, tarotistaId),
      ).rejects.toThrow(
        'Ya generaste tu carta del día. Vuelve mañana para una nueva carta.',
      );
    });

    /**
     * REMOVED TEST: Limit validation moved to guard layer
     *
     * After bugfix/daily-limits-reset, limit validation is no longer the service's responsibility.
     * The CheckUsageLimitGuard now handles ALL limit validation for both DAILY_CARD and TAROT_READING
     * by querying the source tables directly (daily_reading and tarot_reading).
     *
     * Original test: "should throw ForbiddenException if user has reached daily card limit"
     *
     * For limit validation tests, see:
     * - backend/tarot-app/src/modules/usage-limits/guards/check-usage-limit.guard.spec.ts
     */
    it.skip('limit validation is now handled by CheckUsageLimitGuard', () => {
      // Test intentionally skipped - validation moved to guard layer
    });

    it('should skip limit check when dailyCardLimit is -1 (unlimited)', async () => {
      const mockUser = {
        id: userId,
        email: 'premium@test.com',
        plan: UserPlan.PREMIUM,
      };

      // Mock plan config with unlimited (-1) limit
      mockPlanConfigService.findByPlanType.mockResolvedValue({
        planType: UserPlan.PREMIUM,
        dailyCardLimit: -1, // Unlimited
        tarotReadingsLimit: -1,
      });

      // checkLimit should NOT be called when limit is -1
      mockUsageLimitsService.checkLimit.mockResolvedValue(true);

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(78);
      mockCardQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        name: 'El Mago',
      });

      mockInterpretationsService.generateDailyCardInterpretation.mockResolvedValue(
        'interpretation',
      );

      const savedReading = {
        id: 1,
        userId,
        tarotistaId,
        cardId: 1,
        isReversed: false,
        interpretation: 'interpretation',
        readingDate: new Date(),
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: { id: 1, name: 'El Mago' },
      });

      const result = await service.generateDailyCard(
        userId,
        tarotistaId,
        mockUser,
      );

      expect(result).toBeDefined();
      expect(result.cardId).toBe(1);

      // Verify checkLimit was NOT called (limit check skipped for unlimited)
      expect(mockUsageLimitsService.checkLimit).not.toHaveBeenCalled();
    });

    it('should generate a daily card successfully', async () => {
      const mockUser = {
        id: userId,
        email: 'premium@test.com',
        plan: UserPlan.PREMIUM,
      };

      // Mock plan config - PREMIUM has unlimited (-1) so no limit check needed
      mockPlanConfigService.findByPlanType.mockResolvedValue({
        planType: UserPlan.PREMIUM,
        dailyCardLimit: -1,
        tarotReadingsLimit: -1,
      });

      // Mock usage limit - not needed for PREMIUM but included for completeness
      mockUsageLimitsService.checkLimit.mockResolvedValue(true);

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(78);
      mockCardQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        name: 'El Mago',
      });

      mockInterpretationsService.generateDailyCardInterpretation.mockResolvedValue(
        '**Energía del Día**: Poder de manifestación',
      );

      const savedReading = {
        id: 1,
        userId,
        tarotistaId,
        cardId: 1,
        isReversed: false,
        interpretation: '**Energía del Día**: Poder de manifestación',
        readingDate: new Date(),
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: { id: 1, name: 'El Mago' },
      });

      const result = await service.generateDailyCard(
        userId,
        tarotistaId,
        mockUser,
      );

      expect(result.cardId).toBe(1);
      expect(result.interpretation).toContain('Energía del Día');
      expect(
        mockInterpretationsService.generateDailyCardInterpretation,
      ).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if save fails', async () => {
      const mockUser = {
        id: userId,
        email: 'premium@test.com',
        plan: UserPlan.PREMIUM,
      };

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(78);
      mockCardQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        name: 'El Mago',
      });

      mockInterpretationsService.generateDailyCardInterpretation.mockResolvedValue(
        'interpretation',
      );

      mockDailyReadingRepo.create.mockReturnValue({});
      mockDailyReadingRepo.save.mockResolvedValue({ id: 1 });
      mockDailyReadingRepo.findOne.mockResolvedValue(null); // Simulate save failure

      await expect(
        service.generateDailyCard(userId, tarotistaId, mockUser),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getTodayCard', () => {
    const userId = 1;

    it('should return null if no card exists for today', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.getTodayCard(userId);

      expect(result).toBeNull();
    });

    it("should return today's card if it exists", async () => {
      const mockReading = {
        id: 1,
        userId,
        cardId: 1,
        card: { id: 1, name: 'El Mago' },
      };

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(mockReading);

      const result = await service.getTodayCard(userId);

      expect(result).toEqual(mockReading);
      expect(mockDailyReadingRepo.createQueryBuilder).toHaveBeenCalledWith(
        'daily_reading',
      );
    });
  });

  describe('regenerateDailyCard', () => {
    const userId = 1;
    const tarotistaId = 1;

    it('should throw NotFoundException if no daily card exists', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        service.regenerateDailyCard(userId, tarotistaId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not premium', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        userId,
        user: { id: userId, plan: UserPlan.FREE },
      });

      await expect(
        service.regenerateDailyCard(userId, tarotistaId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user is null', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        userId,
        user: null,
      });

      await expect(
        service.regenerateDailyCard(userId, tarotistaId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should regenerate daily card for premium users', async () => {
      const existingReading = {
        id: 1,
        userId,
        user: { id: userId, plan: UserPlan.PREMIUM },
      };

      mockDailyReadingQueryBuilder.getOne
        .mockResolvedValueOnce(existingReading) // Primera llamada: verificar existencia
        .mockResolvedValueOnce(null); // Segunda llamada en generateDailyCard

      mockCardRepo.count.mockResolvedValue(78);
      mockCardQueryBuilder.getOne.mockResolvedValue({
        id: 2,
        name: 'La Sacerdotisa',
      });

      mockInterpretationsService.generateDailyCardInterpretation.mockResolvedValue(
        'Nueva interpretación',
      );

      const newReading = {
        id: 2,
        userId,
        tarotistaId,
        cardId: 2,
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(newReading);
      mockDailyReadingRepo.save.mockResolvedValue({
        ...newReading,
        wasRegenerated: true,
      });
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...newReading,
        wasRegenerated: true,
        card: { id: 2, name: 'La Sacerdotisa' },
      });

      const result = await service.regenerateDailyCard(userId, tarotistaId);

      expect(result.wasRegenerated).toBe(true);
      expect(result.card.name).toBe('La Sacerdotisa');
    });
  });

  describe('getDailyHistory', () => {
    const userId = 1;

    it('should return paginated history with full interpretation', async () => {
      const fullInterpretation = 'Test interpretation ' + 'a'.repeat(200);
      const mockReadings = [
        {
          id: 1,
          userId,
          readingDate: '2024-01-01',
          interpretation: fullInterpretation,
          wasRegenerated: false,
          createdAt: new Date(),
          card: {
            name: 'El Mago',
            imageUrl: 'https://example.com/el-mago.jpg',
          },
          isReversed: false,
        },
      ];

      mockDailyReadingQueryBuilder.getManyAndCount.mockResolvedValue([
        mockReadings,
        1,
      ]);

      const result = await service.getDailyHistory(userId, 1, 10);

      expect(result.items.length).toBe(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.items[0].interpretationSummary).toBeDefined();
      // Full interpretation should be returned (no truncation)
      expect(result.items[0].interpretationSummary).toBe(fullInterpretation);
    });

    it('should handle empty history', async () => {
      mockDailyReadingQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.getDailyHistory(userId, 1, 10);

      expect(result.items.length).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('selectRandomCard (private)', () => {
    beforeEach(() => {
      // Setup default mocks
      mockPlanConfigService.findByPlanType.mockResolvedValue({
        planType: UserPlan.FREE,
        dailyCardLimit: 1,
        tarotReadingsLimit: 3,
      });
      mockUsageLimitsService.checkLimit.mockResolvedValue(true);
    });

    it('should throw InternalServerErrorException if no card found', async () => {
      mockCardRepo.count.mockResolvedValue(78);
      mockCardQueryBuilder.getOne.mockResolvedValue(null);
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);

      // Mock UsersService to return a valid user
      mockUsersService.findById.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        plan: UserPlan.FREE,
      });

      await expect(service.generateDailyCard(1, 1)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.generateDailyCard(1, 1)).rejects.toThrow(
        'No se pudo seleccionar una carta',
      );
    });
  });

  describe('getTodayCardPublic', () => {
    it('should return null if no card exists for today', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.getTodayCardPublic();

      expect(result).toBeNull();
      expect(mockDailyReadingRepo.createQueryBuilder).toHaveBeenCalledWith(
        'daily_reading',
      );
    });

    it('should return the first daily card of the day (for public access)', async () => {
      const mockReading = {
        id: 1,
        userId: 1,
        cardId: 1,
        card: { id: 1, name: 'El Mago' },
        interpretation: 'Test interpretation',
        createdAt: new Date(),
      };

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(mockReading);

      const result = await service.getTodayCardPublic();

      expect(result).toEqual(mockReading);
      expect(mockDailyReadingQueryBuilder.orderBy).toHaveBeenCalledWith(
        'daily_reading.created_at',
        'ASC',
      );
    });

    it('should return first card of the day regardless of user', async () => {
      const mockReading = {
        id: 1,
        userId: 1,
        cardId: 1,
        card: { id: 1, name: 'El Mago' },
      };

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(mockReading);

      const result = await service.getTodayCardPublic();

      expect(result).toEqual(mockReading);
      expect(mockDailyReadingQueryBuilder.where).toHaveBeenCalledWith(
        'daily_reading.reading_date = :date',
        expect.any(Object),
      );
    });
  });

  describe('TASK-007: Dual Flow - Plan Detection', () => {
    const userId = 1;
    const tarotistaId = 1;

    beforeEach(() => {
      // Setup default mocks for plan config and usage limits
      mockPlanConfigService.findByPlanType.mockResolvedValue({
        planType: UserPlan.PREMIUM,
        dailyCardLimit: -1,
        tarotReadingsLimit: -1,
      });
      mockUsageLimitsService.checkLimit.mockResolvedValue(true);
    });

    it('should generate interpretation with AI for PREMIUM users', async () => {
      const mockUser = {
        id: userId,
        email: 'premium@test.com',
        plan: UserPlan.PREMIUM,
      };

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(78);
      mockCardQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        name: 'El Mago',
        meaningUpright: 'Poder de manifestación',
        meaningReversed: 'Manipulación',
      });

      const aiInterpretation =
        '**Energía del Día**: Poder de manifestación\n\n**Ventajas**: Hoy tienes la capacidad de manifestar tus deseos.';
      mockInterpretationsService.generateDailyCardInterpretation.mockResolvedValue(
        aiInterpretation,
      );

      const savedReading = {
        id: 1,
        userId,
        tarotistaId,
        cardId: 1,
        isReversed: false,
        interpretation: aiInterpretation,
        readingDate: new Date(),
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: { id: 1, name: 'El Mago' },
        user: mockUser,
      });

      const result = await service.generateDailyCard(
        userId,
        tarotistaId,
        mockUser,
      );

      expect(result.interpretation).toBe(aiInterpretation);
      expect(result.interpretation).toContain('**Energía del Día**');
      expect(
        mockInterpretationsService.generateDailyCardInterpretation,
      ).toHaveBeenCalledTimes(1);
    });

    it('should NOT generate AI interpretation for FREE users', async () => {
      const mockUser = {
        id: userId,
        email: 'free@test.com',
        plan: UserPlan.FREE,
      };

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(78);
      mockCardQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        name: 'El Mago',
        meaningUpright: 'Poder de manifestación',
        meaningReversed: 'Manipulación',
      });

      const savedReading = {
        id: 1,
        userId,
        tarotistaId,
        cardId: 1,
        isReversed: false,
        interpretation: null,
        readingDate: new Date(),
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: {
          id: 1,
          name: 'El Mago',
          meaningUpright: 'Poder de manifestación',
          meaningReversed: 'Manipulación',
        },
        user: mockUser,
      });

      const result = await service.generateDailyCard(
        userId,
        tarotistaId,
        mockUser,
      );

      expect(result.interpretation).toBeNull();
      expect(
        mockInterpretationsService.generateDailyCardInterpretation,
      ).not.toHaveBeenCalled();
    });

    it('should NOT generate AI interpretation for ANONYMOUS users', async () => {
      const mockUser = {
        id: userId,
        email: 'anonymous@test.com',
        plan: UserPlan.ANONYMOUS,
      };

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(78);
      mockCardQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        name: 'El Mago',
        meaningUpright: 'Poder de manifestación',
        meaningReversed: 'Manipulación',
      });

      const savedReading = {
        id: 1,
        userId,
        tarotistaId,
        cardId: 1,
        isReversed: false,
        interpretation: null,
        readingDate: new Date(),
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: {
          id: 1,
          name: 'El Mago',
          meaningUpright: 'Poder de manifestación',
          meaningReversed: 'Manipulación',
        },
        user: mockUser,
      });

      const result = await service.generateDailyCard(
        userId,
        tarotistaId,
        mockUser,
      );

      expect(result.interpretation).toBeNull();
      expect(
        mockInterpretationsService.generateDailyCardInterpretation,
      ).not.toHaveBeenCalled();
    });

    it('should work without user object (backward compatibility)', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);

      // Mock UsersService.findById to return a PREMIUM user
      mockUsersService.findById.mockResolvedValue({
        id: userId,
        email: 'premium@test.com',
        plan: UserPlan.PREMIUM,
      });

      mockCardRepo.count.mockResolvedValue(78);
      mockCardQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        name: 'El Mago',
      });

      mockInterpretationsService.generateDailyCardInterpretation.mockResolvedValue(
        '**Energía del Día**: Test',
      );

      const savedReading = {
        id: 1,
        userId,
        tarotistaId,
        cardId: 1,
        isReversed: false,
        interpretation: '**Energía del Día**: Test',
        readingDate: new Date(),
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: { id: 1, name: 'El Mago' },
        user: { id: userId, plan: UserPlan.PREMIUM },
      });

      // Call without user parameter
      const result = await service.generateDailyCard(userId, tarotistaId);

      expect(result).toBeDefined();
      expect(result.interpretation).toBe('**Energía del Día**: Test');
      expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
      expect(
        mockInterpretationsService.generateDailyCardInterpretation,
      ).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist and user object not provided', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);

      // Mock UsersService.findById to return null (user not found)
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        service.generateDailyCard(userId, tarotistaId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.generateDailyCard(userId, tarotistaId),
      ).rejects.toThrow('Usuario no encontrado');

      expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('generateAnonymousDailyCard', () => {
    const fingerprint = 'a1b2c3d4e5f6789012345678901234567890abcd';
    const tarotistaId = 1;

    it('should throw ConflictException if fingerprint already has a daily card for today', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        anonymousFingerprint: fingerprint,
      });

      await expect(
        service.generateAnonymousDailyCard(fingerprint, tarotistaId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.generateAnonymousDailyCard(fingerprint, tarotistaId),
      ).rejects.toThrow(
        'Ya viste tu carta del día. Regístrate para más lecturas.',
      );
    });

    it('should generate a random daily card for anonymous user', async () => {
      // T-FR-B03: anonymous users now receive pre-written dailyFreeUpright/Reversed interpretation
      // (fallback to meaningUpright/Reversed when dailyFreeUpright/Reversed is null)
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(22); // T-FR-B03: only major arcana (22 cards)
      mockCardQueryBuilder.getOne.mockResolvedValue({
        id: 5,
        name: 'El Hierofante',
        meaningUpright: 'Sabiduría y tradición',
        meaningReversed: 'Rebelión contra normas',
        dailyFreeUpright: null, // no pre-written text → fallback to meaningUpright/Reversed
        dailyFreeReversed: null,
      });

      // isReversed depends on Math.random; accept either orientation
      const uprightInterpretation = 'Sabiduría y tradición';
      const reversedInterpretation = 'Rebelión contra normas';

      mockDailyReadingRepo.create.mockImplementation(
        (data: {
          anonymousFingerprint: string;
          userId: null;
          cardId: number;
          isReversed: boolean;
          interpretation: string;
          readingDate: string;
          tarotistaId: number;
          wasRegenerated: boolean;
        }) => data,
      );
      mockDailyReadingRepo.save.mockImplementation(
        (data: {
          anonymousFingerprint: string;
          userId: null;
          cardId: number;
          isReversed: boolean;
          interpretation: string;
          readingDate: string;
          tarotistaId: number;
          wasRegenerated: boolean;
        }) => Promise.resolve({ id: 1, ...data }),
      );
      mockDailyReadingRepo.findOne.mockImplementation(
        async () =>
          ({
            id: 1,
            anonymousFingerprint: fingerprint,
            userId: null,
            cardId: 5,
            isReversed: false,
            interpretation: uprightInterpretation,
            readingDate: new Date().toISOString().split('T')[0],
            wasRegenerated: false,
            card: {
              id: 5,
              name: 'El Hierofante',
              meaningUpright: 'Sabiduría y tradición',
              meaningReversed: 'Rebelión contra normas',
              dailyFreeUpright: null,
              dailyFreeReversed: null,
            },
          }) as unknown as Promise<{
            id: number;
            anonymousFingerprint: string;
            userId: null;
            cardId: number;
            isReversed: boolean;
            interpretation: string;
            readingDate: string;
            wasRegenerated: boolean;
            card: {
              id: number;
              name: string;
              meaningUpright: string;
              meaningReversed: string;
              dailyFreeUpright: null;
              dailyFreeReversed: null;
            };
          }>,
      );

      const result = await service.generateAnonymousDailyCard(
        fingerprint,
        tarotistaId,
      );

      expect(result).toBeDefined();
      expect(result.anonymousFingerprint).toBe(fingerprint);
      expect(result.userId).toBeNull();
      // T-FR-B03: interpretation is now pre-written text (or fallback), NOT null
      expect(result.interpretation).not.toBeNull();

      // Verify create was called with a non-null interpretation (upright or reversed fallback)
      const createCall = mockDailyReadingRepo.create.mock
        .calls[0][0] as unknown as {
        anonymousFingerprint: string;
        userId: null;
        interpretation: string;
      };
      expect(createCall.anonymousFingerprint).toBe(fingerprint);
      expect(createCall.userId).toBeNull();
      expect([uprightInterpretation, reversedInterpretation]).toContain(
        createCall.interpretation,
      );

      expect(
        mockInterpretationsService.generateDailyCardInterpretation,
      ).not.toHaveBeenCalled();
    });

    it('should generate card with random orientation (upright or reversed)', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(78);

      const mockCard = {
        id: 10,
        name: 'La Rueda de la Fortuna',
        meaningUpright: 'Cambio positivo',
        meaningReversed: 'Mala suerte',
      };

      mockCardQueryBuilder.getOne.mockResolvedValue(mockCard);

      // Mock Math.random para forzar reversed = true
      jest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.6);

      const savedReading = {
        id: 2,
        anonymousFingerprint: fingerprint,
        userId: null,
        cardId: 10,
        isReversed: true,
        interpretation: null,
        readingDate: new Date().toISOString().split('T')[0],
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: mockCard,
      });

      const result = await service.generateAnonymousDailyCard(
        fingerprint,
        tarotistaId,
      );

      expect(result.isReversed).toBe(true);
    });

    it('should use meaningReversed when card is reversed', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(78);

      const mockCard = {
        id: 7,
        name: 'El Carro',
        meaningUpright: 'Victoria y control',
        meaningReversed: 'Falta de dirección',
      };

      mockCardQueryBuilder.getOne.mockResolvedValue(mockCard);

      // Force isReversed = true
      jest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.8);

      const savedReading = {
        id: 3,
        anonymousFingerprint: fingerprint,
        userId: null,
        cardId: 7,
        isReversed: true,
        interpretation: null,
        readingDate: new Date().toISOString().split('T')[0],
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: mockCard,
      });

      const result = await service.generateAnonymousDailyCard(
        fingerprint,
        tarotistaId,
      );

      expect(result.card.meaningReversed).toBe('Falta de dirección');
    });

    it('should select different random cards for different fingerprints', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(78);

      const card1 = { id: 1, name: 'El Mago', meaningUpright: 'Poder' };
      const card2 = {
        id: 2,
        name: 'La Sacerdotisa',
        meaningUpright: 'Intuición',
      };

      mockCardQueryBuilder.getOne
        .mockResolvedValueOnce(card1)
        .mockResolvedValueOnce(card2);

      mockDailyReadingRepo.create
        .mockReturnValueOnce({ id: 1, cardId: 1 })
        .mockReturnValueOnce({ id: 2, cardId: 2 });

      mockDailyReadingRepo.save
        .mockResolvedValueOnce({ id: 1, cardId: 1 })
        .mockResolvedValueOnce({ id: 2, cardId: 2 });

      mockDailyReadingRepo.findOne
        .mockResolvedValueOnce({ id: 1, card: card1 })
        .mockResolvedValueOnce({ id: 2, card: card2 });

      const result1 = await service.generateAnonymousDailyCard(
        'fingerprint1',
        tarotistaId,
      );
      const result2 = await service.generateAnonymousDailyCard(
        'fingerprint2',
        tarotistaId,
      );

      // Different fingerprints can get different cards
      expect(result1.card.id).not.toBe(result2.card.id);
    });
  });

  // -----------------------------------------------------------------------
  // T-FR-B03: selectRandomCard con filtro de Arcanos Mayores
  // -----------------------------------------------------------------------
  describe('generateDailyCard - T-FR-B03: major arcana filter + dailyFreeUpright/Reversed', () => {
    const userId = 1;
    const tarotistaId = 1;

    const majorArcanaCard = {
      id: 5,
      name: 'La Justicia',
      category: 'arcanos_mayores',
      dailyFreeUpright: 'Hoy la energía de La Justicia te acompaña...',
      dailyFreeReversed: 'Hoy La Justicia invertida te pide...',
      meaningUpright: 'Equilibrio y verdad',
      meaningReversed: 'Injusticia o deshonestidad',
    };

    beforeEach(() => {
      mockPlanConfigService.findByPlanType.mockResolvedValue({
        planType: UserPlan.FREE,
        dailyCardLimit: 1,
        tarotReadingsLimit: 3,
      });
      mockUsageLimitsService.checkLimit.mockResolvedValue(true);
    });

    it('should filter cards by arcanos_mayores when FREE user generates daily card', async () => {
      const mockFreeUser = {
        id: userId,
        email: 'free@test.com',
        plan: UserPlan.FREE,
      };

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      // FREE: count only returns 22 (arcanos_mayores)
      mockCardRepo.count.mockResolvedValue(22);
      mockCardQueryBuilder.getOne.mockResolvedValue(majorArcanaCard);

      const savedReading = {
        id: 1,
        userId,
        tarotistaId,
        cardId: majorArcanaCard.id,
        isReversed: false,
        interpretation: majorArcanaCard.dailyFreeUpright,
        readingDate: new Date().toISOString().split('T')[0],
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: majorArcanaCard,
      });

      const result = await service.generateDailyCard(
        userId,
        tarotistaId,
        mockFreeUser,
      );

      // Verify the query builder was called with arcanos_mayores filter
      expect(mockCardQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining('category'),
        expect.objectContaining({ category: 'arcanos_mayores' }),
      );
      // Verify interpretation is from dailyFreeUpright
      expect(result.interpretation).toBe(majorArcanaCard.dailyFreeUpright);
    });

    it('should use dailyFreeUpright when FREE user card is not reversed', async () => {
      const mockFreeUser = {
        id: userId,
        email: 'free@test.com',
        plan: UserPlan.FREE,
      };

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(22);

      // Force isReversed = false
      jest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.1) // randomIndex → small
        .mockReturnValueOnce(0.9); // isReversed → false (>= 0.5)

      mockCardQueryBuilder.getOne.mockResolvedValue(majorArcanaCard);

      const savedReading = {
        id: 1,
        userId,
        tarotistaId,
        cardId: majorArcanaCard.id,
        isReversed: false,
        interpretation: majorArcanaCard.dailyFreeUpright,
        readingDate: new Date().toISOString().split('T')[0],
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: majorArcanaCard,
      });

      const result = await service.generateDailyCard(
        userId,
        tarotistaId,
        mockFreeUser,
      );

      expect(result.interpretation).toBe(majorArcanaCard.dailyFreeUpright);

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should use dailyFreeReversed when FREE user card is reversed', async () => {
      const mockFreeUser = {
        id: userId,
        email: 'free@test.com',
        plan: UserPlan.FREE,
      };

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(22);

      // Force isReversed = true (random < 0.5)
      jest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.1) // randomIndex
        .mockReturnValueOnce(0.2); // isReversed = true (< 0.5)

      mockCardQueryBuilder.getOne.mockResolvedValue(majorArcanaCard);

      const savedReading = {
        id: 2,
        userId,
        tarotistaId,
        cardId: majorArcanaCard.id,
        isReversed: true,
        interpretation: majorArcanaCard.dailyFreeReversed,
        readingDate: new Date().toISOString().split('T')[0],
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: majorArcanaCard,
      });

      const result = await service.generateDailyCard(
        userId,
        tarotistaId,
        mockFreeUser,
      );

      expect(result.interpretation).toBe(majorArcanaCard.dailyFreeReversed);

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should fallback to meaningUpright when dailyFreeUpright is null', async () => {
      const cardWithNullDaily = {
        ...majorArcanaCard,
        dailyFreeUpright: null,
        dailyFreeReversed: null,
      };

      const mockFreeUser = {
        id: userId,
        email: 'free@test.com',
        plan: UserPlan.FREE,
      };

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(22);

      // Force isReversed = false
      jest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.9);

      mockCardQueryBuilder.getOne.mockResolvedValue(cardWithNullDaily);

      const savedReading = {
        id: 3,
        userId,
        tarotistaId,
        cardId: cardWithNullDaily.id,
        isReversed: false,
        interpretation: cardWithNullDaily.meaningUpright,
        readingDate: new Date().toISOString().split('T')[0],
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: cardWithNullDaily,
      });

      const result = await service.generateDailyCard(
        userId,
        tarotistaId,
        mockFreeUser,
      );

      // Fallback to meaningUpright since dailyFreeUpright is null
      expect(result.interpretation).toBe(cardWithNullDaily.meaningUpright);

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should NOT use dailyFreeUpright for PREMIUM users (uses AI instead)', async () => {
      const mockPremiumUser = {
        id: userId,
        email: 'premium@test.com',
        plan: UserPlan.PREMIUM,
      };

      mockPlanConfigService.findByPlanType.mockResolvedValue({
        planType: UserPlan.PREMIUM,
        dailyCardLimit: -1,
        tarotReadingsLimit: -1,
      });

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      // PREMIUM: count returns all 78 cards
      mockCardRepo.count.mockResolvedValue(78);
      mockCardQueryBuilder.getOne.mockResolvedValue(majorArcanaCard);

      const aiInterpretation =
        '**Energía del Día**: interpretación personalizada';
      mockInterpretationsService.generateDailyCardInterpretation.mockResolvedValue(
        aiInterpretation,
      );

      const savedReading = {
        id: 4,
        userId,
        tarotistaId,
        cardId: majorArcanaCard.id,
        isReversed: false,
        interpretation: aiInterpretation,
        readingDate: new Date().toISOString().split('T')[0],
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: majorArcanaCard,
      });

      const result = await service.generateDailyCard(
        userId,
        tarotistaId,
        mockPremiumUser,
      );

      // PREMIUM should use AI, not dailyFreeUpright
      expect(
        mockInterpretationsService.generateDailyCardInterpretation,
      ).toHaveBeenCalled();
      expect(result.interpretation).toBe(aiInterpretation);
      // PREMIUM should NOT filter by arcanos_mayores
      expect(mockCardQueryBuilder.where).not.toHaveBeenCalledWith(
        expect.stringContaining('category'),
        expect.anything(),
      );
    });
  });

  // -----------------------------------------------------------------------
  // T-FR-B03: generateAnonymousDailyCard con filtro arcanos mayores
  // -----------------------------------------------------------------------
  describe('generateAnonymousDailyCard - T-FR-B03: major arcana filter + dailyFreeUpright/Reversed', () => {
    const tarotistaId = 1;
    const fingerprint = 'anon-fp-b03';

    const majorArcanaCard = {
      id: 3,
      name: 'La Emperatriz',
      category: 'arcanos_mayores',
      dailyFreeUpright: 'Hoy la energía de La Emperatriz te acompaña...',
      dailyFreeReversed: 'Hoy La Emperatriz invertida te pide...',
      meaningUpright: 'Abundancia y fertilidad',
      meaningReversed: 'Bloqueo creativo',
    };

    it('should filter cards by arcanos_mayores for anonymous users', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(22);
      mockCardQueryBuilder.getOne.mockResolvedValue(majorArcanaCard);

      const savedReading = {
        id: 1,
        anonymousFingerprint: fingerprint,
        userId: null,
        cardId: majorArcanaCard.id,
        isReversed: false,
        interpretation: majorArcanaCard.dailyFreeUpright,
        readingDate: new Date().toISOString().split('T')[0],
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: majorArcanaCard,
      });

      const result = await service.generateAnonymousDailyCard(
        fingerprint,
        tarotistaId,
      );

      // Should filter by arcanos_mayores
      expect(mockCardQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining('category'),
        expect.objectContaining({ category: 'arcanos_mayores' }),
      );
      // Should use dailyFreeUpright (not null)
      expect(result.interpretation).toBe(majorArcanaCard.dailyFreeUpright);
    });

    it('should use dailyFreeReversed for anonymous user with reversed card', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(22);

      // Force isReversed = true
      jest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.2);

      mockCardQueryBuilder.getOne.mockResolvedValue(majorArcanaCard);

      const savedReading = {
        id: 2,
        anonymousFingerprint: fingerprint,
        userId: null,
        cardId: majorArcanaCard.id,
        isReversed: true,
        interpretation: majorArcanaCard.dailyFreeReversed,
        readingDate: new Date().toISOString().split('T')[0],
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: majorArcanaCard,
      });

      const result = await service.generateAnonymousDailyCard(
        fingerprint,
        tarotistaId,
      );

      expect(result.interpretation).toBe(majorArcanaCard.dailyFreeReversed);

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should fallback to meaningUpright when dailyFreeUpright is null for anonymous user', async () => {
      const cardWithNullDaily = {
        ...majorArcanaCard,
        dailyFreeUpright: null,
        dailyFreeReversed: null,
      };

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(22);

      jest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.9); // not reversed

      mockCardQueryBuilder.getOne.mockResolvedValue(cardWithNullDaily);

      const savedReading = {
        id: 3,
        anonymousFingerprint: fingerprint,
        userId: null,
        cardId: cardWithNullDaily.id,
        isReversed: false,
        interpretation: cardWithNullDaily.meaningUpright,
        readingDate: new Date().toISOString().split('T')[0],
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: cardWithNullDaily,
      });

      const result = await service.generateAnonymousDailyCard(
        fingerprint,
        tarotistaId,
      );

      expect(result.interpretation).toBe(cardWithNullDaily.meaningUpright);

      jest.spyOn(Math, 'random').mockRestore();
    });
  });
});
