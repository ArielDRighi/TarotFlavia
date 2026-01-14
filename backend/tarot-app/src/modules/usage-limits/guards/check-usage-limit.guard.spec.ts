import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CheckUsageLimitGuard } from './check-usage-limit.guard';
import { UsageLimitsService } from '../usage-limits.service';
import { AnonymousTrackingService } from '../services/anonymous-tracking.service';
import { UsageFeature } from '../entities/usage-limit.entity';
import { DailyReading } from '../../tarot/daily-reading/entities/daily-reading.entity';
import { TarotReading } from '../../tarot/readings/entities/tarot-reading.entity';
import { UsersService } from '../../users/users.service';
import { PlanConfigService } from '../../plan-config/plan-config.service';
import { USAGE_LIMIT_FEATURE_KEY } from '../decorators/check-usage-limit.decorator';
import { ALLOW_ANONYMOUS_KEY } from '../decorators/allow-anonymous.decorator';

describe('CheckUsageLimitGuard', () => {
  let guard: CheckUsageLimitGuard;
  let usageLimitsService: {
    checkLimit: jest.Mock;
    getRemainingUsage: jest.Mock;
  };
  let anonymousTrackingService: {
    canAccess: jest.Mock;
    recordUsage: jest.Mock;
  };
  let usersService: {
    findById: jest.Mock;
  };
  let planConfigService: {
    findByPlanType: jest.Mock;
  };
  let tarotReadingRepository: {
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let reflector: { getAllAndOverride: jest.Mock };

  const mockExecutionContext = (
    userId?: number,
    ip = '192.168.1.1',
    userAgent = 'Mozilla/5.0',
  ): ExecutionContext => {
    const handler = jest.fn();
    const classRef = jest.fn();
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: userId ? { userId } : undefined,
          ip,
          headers: {
            'user-agent': userAgent,
          },
        }),
      }),
      getHandler: () => handler,
      getClass: () => classRef,
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const mockCheckLimit = jest.fn();
    const mockGetRemainingUsage = jest.fn();
    const mockCanAccess = jest.fn();
    const mockRecordUsage = jest.fn();
    const mockGetAllAndOverride = jest.fn();
    const mockFindById = jest.fn();
    const mockFindByPlanType = jest.fn();
    const mockCountTarotReading = jest.fn();
    const mockCreateQueryBuilder = jest.fn();

    // Default mocks for user and plan config (needed for TAROT_READING feature)
    mockFindById.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      plan: 'FREE',
    });
    mockFindByPlanType.mockResolvedValue({
      id: 1,
      planType: 'FREE',
      tarotReadingsLimit: 1,
    });
    mockCountTarotReading.mockResolvedValue(0);

    // Setup createQueryBuilder mock chain for tarot readings
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    };
    mockCreateQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckUsageLimitGuard,
        {
          provide: UsageLimitsService,
          useValue: {
            checkLimit: mockCheckLimit,
            getRemainingUsage: mockGetRemainingUsage,
          },
        },
        {
          provide: AnonymousTrackingService,
          useValue: {
            canAccess: mockCanAccess,
            recordUsage: mockRecordUsage,
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: mockFindById,
          },
        },
        {
          provide: PlanConfigService,
          useValue: {
            findByPlanType: mockFindByPlanType,
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: mockGetAllAndOverride,
          },
        },
        {
          provide: getRepositoryToken(DailyReading),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TarotReading),
          useValue: {
            count: mockCountTarotReading,
            find: jest.fn(),
            createQueryBuilder: mockCreateQueryBuilder,
          },
        },
      ],
    }).compile();

    guard = module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);
    usageLimitsService = module.get(UsageLimitsService);
    anonymousTrackingService = module.get(AnonymousTrackingService);
    usersService = module.get(UsersService);
    planConfigService = module.get(PlanConfigService);
    tarotReadingRepository = module.get(getRepositoryToken(TarotReading));
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow action when limit is not reached', async () => {
      const context = mockExecutionContext(1);
      reflector.getAllAndOverride
        .mockReturnValueOnce(UsageFeature.TAROT_READING)
        .mockReturnValueOnce(false);
      // Mock that user has 0 readings (limit not reached)
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };
      tarotReadingRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      // Verify new direct table query logic was used
      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(tarotReadingRepository.createQueryBuilder).toHaveBeenCalledWith('tarot_reading');
    });

    it('should block action when limit is reached (403)', async () => {
      const context = mockExecutionContext(1);
      reflector.getAllAndOverride
        .mockReturnValueOnce(UsageFeature.TAROT_READING)
        .mockReturnValueOnce(false);
      // Mock that user already has 1 reading (the limit for FREE)
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      };
      tarotReadingRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );

      // Create new context for second assertion
      const context2 = mockExecutionContext(1);
      reflector.getAllAndOverride
        .mockReturnValueOnce(UsageFeature.TAROT_READING)
        .mockReturnValueOnce(false);
      await expect(guard.canActivate(context2)).rejects.toThrow(
        'Has alcanzado tu límite diario para esta función. Tu cuota se restablecerá a medianoche (00:00 UTC). Intenta nuevamente mañana o actualiza tu plan para obtener más acceso.',
      );
    });

    it('should handle premium users with unlimited limit (-1)', async () => {
      const context = mockExecutionContext(2);
      reflector.getAllAndOverride
        .mockReturnValueOnce(UsageFeature.TAROT_READING)
        .mockReturnValueOnce(false);
      // Mock PREMIUM user with unlimited readings
      usersService.findById.mockResolvedValue({
        id: 2,
        email: 'premium@test.com',
        plan: 'PREMIUM',
      });
      planConfigService.findByPlanType.mockResolvedValue({
        id: 2,
        planType: 'PREMIUM',
        tarotReadingsLimit: -1, // unlimited
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should extract feature correctly from decorator metadata', async () => {
      const context = mockExecutionContext(1);
      reflector.getAllAndOverride
        .mockReturnValueOnce(UsageFeature.ORACLE_QUERY)
        .mockReturnValueOnce(false);
      usageLimitsService.checkLimit.mockResolvedValue(true);

      await guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        USAGE_LIMIT_FEATURE_KEY,
        [expect.any(Function), expect.any(Function)],
      );
      expect(usageLimitsService.checkLimit).toHaveBeenCalledWith(
        1,
        UsageFeature.ORACLE_QUERY,
      );
    });

    it('should handle errors from service appropriately', async () => {
      const context = mockExecutionContext(1);
      reflector.getAllAndOverride
        .mockReturnValueOnce(UsageFeature.TAROT_READING)
        .mockReturnValueOnce(false);
      // Mock user service to throw error
      usersService.findById.mockRejectedValue(new Error('Service error'));

      await expect(guard.canActivate(context)).rejects.toThrow('Service error');
    });

    it('should return true when no feature metadata is found (guard skipped)', async () => {
      const context = mockExecutionContext(1);
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(usageLimitsService.checkLimit).not.toHaveBeenCalled();
      expect(anonymousTrackingService.canAccess).not.toHaveBeenCalled();
    });

    it('should extract userId from request.user correctly', async () => {
      const context = mockExecutionContext(42);
      reflector.getAllAndOverride
        .mockReturnValueOnce(UsageFeature.TAROT_READING)
        .mockReturnValueOnce(false);
      // Mock user for userId=42
      usersService.findById.mockResolvedValue({
        id: 42,
        email: 'test42@test.com',
        plan: 'FREE',
      });
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };
      tarotReadingRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await guard.canActivate(context);

      // Verify correct userId was extracted
      expect(usersService.findById).toHaveBeenCalledWith(42);
    });

    describe('anonymous access', () => {
      it('should allow anonymous access when AllowAnonymous is set and user can access', async () => {
        const context = mockExecutionContext(undefined);
        reflector.getAllAndOverride
          .mockReturnValueOnce(UsageFeature.TAROT_READING)
          .mockReturnValueOnce(true); // allowAnonymous = true
        anonymousTrackingService.canAccess.mockResolvedValue(true);
        anonymousTrackingService.recordUsage.mockResolvedValue({
          id: 1,
          fingerprint: 'test-fingerprint',
          ip: '192.168.1.1',
          date: '2025-01-02',
          feature: UsageFeature.TAROT_READING,
        } as any);

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(anonymousTrackingService.canAccess).toHaveBeenCalled();
        expect(anonymousTrackingService.recordUsage).toHaveBeenCalled();
        expect(usageLimitsService.checkLimit).not.toHaveBeenCalled();
      });

      it('should block anonymous access when limit is reached', async () => {
        const context = mockExecutionContext(undefined);
        reflector.getAllAndOverride
          .mockReturnValueOnce(UsageFeature.TAROT_READING)
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(UsageFeature.TAROT_READING) // second call
          .mockReturnValueOnce(true); // second call
        anonymousTrackingService.canAccess.mockResolvedValue(false);

        await expect(guard.canActivate(context)).rejects.toThrow(
          ForbiddenException,
        );

        // Verify recordUsage is NOT called when access is denied
        expect(anonymousTrackingService.recordUsage).not.toHaveBeenCalled();

        // Create new context for second assertion
        const context2 = mockExecutionContext(undefined);
        await expect(guard.canActivate(context2)).rejects.toThrow(
          'Ya viste tu carta del día. Regístrate para más lecturas.',
        );
      });

      it('should block unauthenticated access when AllowAnonymous is not set', async () => {
        const context = mockExecutionContext(undefined);
        reflector.getAllAndOverride
          .mockReturnValueOnce(UsageFeature.TAROT_READING)
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(UsageFeature.TAROT_READING) // second call
          .mockReturnValueOnce(false); // allowAnonymous = false (second call)

        await expect(guard.canActivate(context)).rejects.toThrow(
          ForbiddenException,
        );

        // Create new context for second assertion
        const context2 = mockExecutionContext(undefined);
        await expect(guard.canActivate(context2)).rejects.toThrow(
          'Usuario no autenticado',
        );
      });

      it('should check both feature and allowAnonymous metadata', async () => {
        const context = mockExecutionContext(undefined);
        reflector.getAllAndOverride
          .mockReturnValueOnce(UsageFeature.TAROT_READING)
          .mockReturnValueOnce(true);
        anonymousTrackingService.canAccess.mockResolvedValue(true);

        await guard.canActivate(context);

        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
          USAGE_LIMIT_FEATURE_KEY,
          [expect.any(Function), expect.any(Function)],
        );
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
          ALLOW_ANONYMOUS_KEY,
          [expect.any(Function), expect.any(Function)],
        );
      });
    });
  });
});
