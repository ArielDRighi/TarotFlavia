import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CheckUsageLimitGuard } from './check-usage-limit.guard';
import { UsageLimitsService } from '../usage-limits.service';
import { AnonymousTrackingService } from '../services/anonymous-tracking.service';
import { UsageFeature } from '../entities/usage-limit.entity';
import { AnonymousUsage } from '../entities/anonymous-usage.entity';
import { DailyReading } from '../../tarot/daily-reading/entities/daily-reading.entity';
import { TarotReading } from '../../tarot/readings/entities/tarot-reading.entity';
import { BirthChart } from '../../birth-chart/entities/birth-chart.entity';
import { UsersService } from '../../users/users.service';
import { PlanConfigService } from '../../plan-config/plan-config.service';
import { USAGE_LIMIT_FEATURE_KEY } from '../decorators/check-usage-limit.decorator';
import { ALLOW_ANONYMOUS_KEY } from '../decorators/allow-anonymous.decorator';
import * as dateUtils from '../../../common/utils/date.utils';

describe('CheckUsageLimitGuard', () => {
  let guard: CheckUsageLimitGuard;
  let usageLimitsService: {
    checkLimit: jest.Mock;
    getRemainingUsage: jest.Mock;
  };
  let anonymousTrackingService: {
    canAccess: jest.Mock;
    recordUsage: jest.Mock;
    canAccessLifetime: jest.Mock;
    recordLifetimeUsage: jest.Mock;
    generateFingerprint: jest.Mock;
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
    const mockCanAccessLifetime = jest.fn();
    const mockRecordLifetimeUsage = jest.fn();
    const mockGenerateFingerprint = jest.fn();
    const mockGetAllAndOverride = jest.fn();
    const mockFindById = jest.fn();
    const mockFindByPlanType = jest.fn();
    const mockCountTarotReading = jest.fn();
    const mockCreateQueryBuilder = jest.fn();

    // Default mocks for user and plan config (needed for TAROT_READING feature)
    mockFindById.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      plan: 'free',
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
            canAccessLifetime: mockCanAccessLifetime,
            recordLifetimeUsage: mockRecordLifetimeUsage,
            generateFingerprint: mockGenerateFingerprint,
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
        {
          provide: getRepositoryToken(BirthChart),
          useValue: {
            createQueryBuilder: jest.fn(),
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
      tarotReadingRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      // Verify new direct table query logic was used
      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(tarotReadingRepository.createQueryBuilder).toHaveBeenCalledWith(
        'tarot_reading',
      );
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
      tarotReadingRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

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
        plan: 'premium',
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
        plan: 'free',
      });
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };
      tarotReadingRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

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
        } as unknown as AnonymousUsage);

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(anonymousTrackingService.canAccess).toHaveBeenCalled();
        expect(anonymousTrackingService.recordUsage).toHaveBeenCalled();
        expect(usageLimitsService.checkLimit).not.toHaveBeenCalled();
      });

      describe('PENDULUM_QUERY lifetime limit', () => {
        it('should allow anonymous user FIRST pendulum query (lifetime limit)', async () => {
          const context = mockExecutionContext(
            undefined,
            '192.168.1.1',
            'Mozilla/5.0',
          );
          reflector.getAllAndOverride
            .mockReturnValueOnce(UsageFeature.PENDULUM_QUERY)
            .mockReturnValueOnce(true); // allowAnonymous = true

          // Mock canAccessLifetime para simular que nunca ha usado el péndulo
          const mockCanAccessLifetime = jest.fn().mockResolvedValue(true);
          const mockRecordLifetimeUsage = jest.fn().mockResolvedValue({
            id: 1,
            fingerprint: 'test-fingerprint',
            ip: '192.168.1.1',
            date: '1970-01-01',
            feature: UsageFeature.PENDULUM_QUERY,
          });
          anonymousTrackingService.canAccessLifetime = mockCanAccessLifetime;
          anonymousTrackingService.recordLifetimeUsage =
            mockRecordLifetimeUsage;

          const result = await guard.canActivate(context);

          expect(result).toBe(true);
          expect(mockCanAccessLifetime).toHaveBeenCalled();
          expect(mockRecordLifetimeUsage).toHaveBeenCalled();
          // No debe llamar a canAccess (que es para límites diarios)
          expect(anonymousTrackingService.canAccess).not.toHaveBeenCalled();
        });

        it('should block anonymous user SECOND pendulum query (lifetime limit reached)', async () => {
          const context = mockExecutionContext(
            undefined,
            '192.168.1.1',
            'Mozilla/5.0',
          );
          reflector.getAllAndOverride
            .mockReturnValueOnce(UsageFeature.PENDULUM_QUERY)
            .mockReturnValueOnce(true);

          // Mock canAccessLifetime para simular que YA usó el péndulo antes
          const mockCanAccessLifetime = jest.fn().mockResolvedValue(false);
          anonymousTrackingService.canAccessLifetime = mockCanAccessLifetime;

          await expect(guard.canActivate(context)).rejects.toThrow(
            ForbiddenException,
          );

          // Create second context for second assertion
          const context2 = mockExecutionContext(
            undefined,
            '192.168.1.1',
            'Mozilla/5.0',
          );
          reflector.getAllAndOverride
            .mockReturnValueOnce(UsageFeature.PENDULUM_QUERY)
            .mockReturnValueOnce(true);

          await expect(guard.canActivate(context2)).rejects.toThrow(
            'Ya has usado tu consulta gratuita del Péndulo. Regístrate para obtener más consultas.',
          );

          expect(mockCanAccessLifetime).toHaveBeenCalled();
        });

        it('should use fingerprint correctly for pendulum lifetime tracking', async () => {
          const ip = '192.168.1.100';
          const userAgent = 'Mozilla/5.0 Chrome';
          const context = mockExecutionContext(undefined, ip, userAgent);

          reflector.getAllAndOverride
            .mockReturnValueOnce(UsageFeature.PENDULUM_QUERY)
            .mockReturnValueOnce(true);

          const mockGenerateFingerprint = jest
            .fn()
            .mockReturnValue('fingerprint-hash-123');
          const mockCanAccessLifetime = jest.fn().mockResolvedValue(true);
          const mockRecordLifetimeUsage = jest.fn().mockResolvedValue({});

          anonymousTrackingService.generateFingerprint =
            mockGenerateFingerprint;
          anonymousTrackingService.canAccessLifetime = mockCanAccessLifetime;
          anonymousTrackingService.recordLifetimeUsage =
            mockRecordLifetimeUsage;

          await guard.canActivate(context);

          expect(mockGenerateFingerprint).toHaveBeenCalledWith(ip, userAgent);
          expect(mockCanAccessLifetime).toHaveBeenCalledWith(
            'fingerprint-hash-123',
            UsageFeature.PENDULUM_QUERY,
          );
          expect(mockRecordLifetimeUsage).toHaveBeenCalledWith(
            'fingerprint-hash-123',
            ip,
            UsageFeature.PENDULUM_QUERY,
          );
        });

        it('should use lifetime tracking for PENDULUM but daily tracking for TAROT_READING', async () => {
          // Test 1: PENDULUM_QUERY usa lifetime
          const pendulumContext = mockExecutionContext(undefined);
          reflector.getAllAndOverride
            .mockReturnValueOnce(UsageFeature.PENDULUM_QUERY)
            .mockReturnValueOnce(true);

          const mockCanAccessLifetime = jest.fn().mockResolvedValue(true);
          const mockRecordLifetimeUsage = jest.fn().mockResolvedValue({});
          anonymousTrackingService.canAccessLifetime = mockCanAccessLifetime;
          anonymousTrackingService.recordLifetimeUsage =
            mockRecordLifetimeUsage;

          await guard.canActivate(pendulumContext);

          expect(mockCanAccessLifetime).toHaveBeenCalled();
          expect(mockRecordLifetimeUsage).toHaveBeenCalled();
          expect(anonymousTrackingService.canAccess).not.toHaveBeenCalled();

          // Test 2: TAROT_READING sigue usando daily tracking
          jest.clearAllMocks();
          const tarotContext = mockExecutionContext(undefined);
          reflector.getAllAndOverride
            .mockReturnValueOnce(UsageFeature.TAROT_READING)
            .mockReturnValueOnce(true);

          anonymousTrackingService.canAccess.mockResolvedValue(true);
          anonymousTrackingService.recordUsage.mockResolvedValue({});

          await guard.canActivate(tarotContext);

          expect(anonymousTrackingService.canAccess).toHaveBeenCalled();
          expect(anonymousTrackingService.recordUsage).toHaveBeenCalled();
          expect(mockCanAccessLifetime).not.toHaveBeenCalled();
        });
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

    describe('daily limit reset (24-hour cycle)', () => {
      it('DAILY_CARD: should reset limit when day changes (yesterday blocked, today allowed)', async () => {
        // SCENARIO: User generated daily card yesterday, should be allowed today
        const userId = 1;
        const today = '2025-01-15';

        // Mock getTodayUTCDateString to return "today"
        jest.spyOn(dateUtils, 'getTodayUTCDateString').mockReturnValue(today);

        // Recreate module with dailyReadingRepository mock
        const mockDailyQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            CheckUsageLimitGuard,
            {
              provide: UsageLimitsService,
              useValue: { checkLimit: jest.fn(), getRemainingUsage: jest.fn() },
            },
            {
              provide: AnonymousTrackingService,
              useValue: { canAccess: jest.fn(), recordUsage: jest.fn() },
            },
            {
              provide: UsersService,
              useValue: {
                findById: jest
                  .fn()
                  .mockResolvedValue({ id: userId, plan: 'free' }),
              },
            },
            {
              provide: PlanConfigService,
              useValue: {
                findByPlanType: jest
                  .fn()
                  .mockResolvedValue({ dailyCardLimit: 1 }),
              },
            },
            {
              provide: Reflector,
              useValue: {
                getAllAndOverride: jest
                  .fn()
                  .mockReturnValueOnce(UsageFeature.DAILY_CARD)
                  .mockReturnValueOnce(false),
              },
            },
            {
              provide: getRepositoryToken(DailyReading),
              useValue: {
                createQueryBuilder: jest
                  .fn()
                  .mockReturnValue(mockDailyQueryBuilder),
              },
            },
            {
              provide: getRepositoryToken(TarotReading),
              useValue: { createQueryBuilder: jest.fn() },
            },
            {
              provide: getRepositoryToken(BirthChart),
              useValue: { createQueryBuilder: jest.fn() },
            },
          ],
        }).compile();

        const testGuard =
          module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);

        // User has a reading from YESTERDAY (not today) - should NOT block
        // The query looks for readings WHERE reading_date = 'today', so yesterday's reading won't match
        mockDailyQueryBuilder.getOne.mockResolvedValue(null); // No reading for TODAY

        const context = mockExecutionContext(userId);
        const result = await testGuard.canActivate(context);

        expect(result).toBe(true);
        // Verify the date used in the query is TODAY
        expect(mockDailyQueryBuilder.andWhere).toHaveBeenCalledWith(
          'daily_reading.reading_date = :date',
          { date: today },
        );

        jest.restoreAllMocks();
      });

      it('DAILY_CARD: should block if reading exists for today', async () => {
        const userId = 1;
        const today = '2025-01-15';

        jest.spyOn(dateUtils, 'getTodayUTCDateString').mockReturnValue(today);

        const mockDailyQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({
            id: 1,
            userId,
            readingDate: today,
          }), // Reading EXISTS for today
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            CheckUsageLimitGuard,
            {
              provide: UsageLimitsService,
              useValue: { checkLimit: jest.fn(), getRemainingUsage: jest.fn() },
            },
            {
              provide: AnonymousTrackingService,
              useValue: { canAccess: jest.fn(), recordUsage: jest.fn() },
            },
            {
              provide: UsersService,
              useValue: {
                findById: jest
                  .fn()
                  .mockResolvedValue({ id: userId, plan: 'free' }),
              },
            },
            {
              provide: PlanConfigService,
              useValue: {
                findByPlanType: jest
                  .fn()
                  .mockResolvedValue({ dailyCardLimit: 1 }),
              },
            },
            {
              provide: Reflector,
              useValue: {
                getAllAndOverride: jest
                  .fn()
                  .mockReturnValueOnce(UsageFeature.DAILY_CARD)
                  .mockReturnValueOnce(false),
              },
            },
            {
              provide: getRepositoryToken(DailyReading),
              useValue: {
                createQueryBuilder: jest
                  .fn()
                  .mockReturnValue(mockDailyQueryBuilder),
              },
            },
            {
              provide: getRepositoryToken(TarotReading),
              useValue: { createQueryBuilder: jest.fn() },
            },
            {
              provide: getRepositoryToken(BirthChart),
              useValue: { createQueryBuilder: jest.fn() },
            },
          ],
        }).compile();

        const testGuard =
          module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);
        const context = mockExecutionContext(userId);

        await expect(testGuard.canActivate(context)).rejects.toThrow(
          ForbiddenException,
        );

        jest.restoreAllMocks();
      });

      it('TAROT_READING: should reset limit when day changes (yesterday readings do not count)', async () => {
        // SCENARIO: User made readings yesterday (used all limit), should be allowed today
        const userId = 1;
        const today = '2025-01-15';

        jest.spyOn(dateUtils, 'getTodayUTCDateString').mockReturnValue(today);
        jest
          .spyOn(dateUtils, 'getStartOfTodayUTC')
          .mockReturnValue(new Date('2025-01-15T00:00:00.000Z'));

        const mockTarotQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(0), // No readings for TODAY
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            CheckUsageLimitGuard,
            {
              provide: UsageLimitsService,
              useValue: { checkLimit: jest.fn(), getRemainingUsage: jest.fn() },
            },
            {
              provide: AnonymousTrackingService,
              useValue: { canAccess: jest.fn(), recordUsage: jest.fn() },
            },
            {
              provide: UsersService,
              useValue: {
                findById: jest
                  .fn()
                  .mockResolvedValue({ id: userId, plan: 'free' }),
              },
            },
            {
              provide: PlanConfigService,
              useValue: {
                findByPlanType: jest
                  .fn()
                  .mockResolvedValue({ tarotReadingsLimit: 1 }),
              },
            },
            {
              provide: Reflector,
              useValue: {
                getAllAndOverride: jest
                  .fn()
                  .mockReturnValueOnce(UsageFeature.TAROT_READING)
                  .mockReturnValueOnce(false),
              },
            },
            {
              provide: getRepositoryToken(DailyReading),
              useValue: { createQueryBuilder: jest.fn() },
            },
            {
              provide: getRepositoryToken(TarotReading),
              useValue: {
                createQueryBuilder: jest
                  .fn()
                  .mockReturnValue(mockTarotQueryBuilder),
              },
            },
            {
              provide: getRepositoryToken(BirthChart),
              useValue: { createQueryBuilder: jest.fn() },
            },
          ],
        }).compile();

        const testGuard =
          module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);
        const context = mockExecutionContext(userId);

        const result = await testGuard.canActivate(context);

        expect(result).toBe(true);
        // Verify that startOfToday is used in the query
        expect(mockTarotQueryBuilder.andWhere).toHaveBeenCalledWith(
          'tarot_reading.createdAt >= :startOfToday',
          { startOfToday: new Date('2025-01-15T00:00:00.000Z') },
        );

        jest.restoreAllMocks();
      });

      it('TAROT_READING: should block if limit reached today', async () => {
        const userId = 1;
        const today = '2025-01-15';

        jest.spyOn(dateUtils, 'getTodayUTCDateString').mockReturnValue(today);
        jest
          .spyOn(dateUtils, 'getStartOfTodayUTC')
          .mockReturnValue(new Date('2025-01-15T00:00:00.000Z'));

        const mockTarotQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(1), // 1 reading today (limit for FREE)
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            CheckUsageLimitGuard,
            {
              provide: UsageLimitsService,
              useValue: { checkLimit: jest.fn(), getRemainingUsage: jest.fn() },
            },
            {
              provide: AnonymousTrackingService,
              useValue: { canAccess: jest.fn(), recordUsage: jest.fn() },
            },
            {
              provide: UsersService,
              useValue: {
                findById: jest
                  .fn()
                  .mockResolvedValue({ id: userId, plan: 'free' }),
              },
            },
            {
              provide: PlanConfigService,
              useValue: {
                findByPlanType: jest
                  .fn()
                  .mockResolvedValue({ tarotReadingsLimit: 1 }),
              },
            },
            {
              provide: Reflector,
              useValue: {
                getAllAndOverride: jest
                  .fn()
                  .mockReturnValueOnce(UsageFeature.TAROT_READING)
                  .mockReturnValueOnce(false),
              },
            },
            {
              provide: getRepositoryToken(DailyReading),
              useValue: { createQueryBuilder: jest.fn() },
            },
            {
              provide: getRepositoryToken(TarotReading),
              useValue: {
                createQueryBuilder: jest
                  .fn()
                  .mockReturnValue(mockTarotQueryBuilder),
              },
            },
            {
              provide: getRepositoryToken(BirthChart),
              useValue: { createQueryBuilder: jest.fn() },
            },
          ],
        }).compile();

        const testGuard =
          module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);

        const context = mockExecutionContext(userId);

        await expect(testGuard.canActivate(context)).rejects.toThrow(
          ForbiddenException,
        );

        jest.restoreAllMocks();
      });

      it('should use consistent UTC date for both DAILY_CARD and TAROT_READING', async () => {
        // Verify both features use the same date utility functions
        const today = '2025-01-15';
        const startOfToday = new Date('2025-01-15T00:00:00.000Z');

        const getTodaySpy = jest
          .spyOn(dateUtils, 'getTodayUTCDateString')
          .mockReturnValue(today);
        const getStartSpy = jest
          .spyOn(dateUtils, 'getStartOfTodayUTC')
          .mockReturnValue(startOfToday);

        // Test DAILY_CARD
        const mockDailyQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        };

        const module1: TestingModule = await Test.createTestingModule({
          providers: [
            CheckUsageLimitGuard,
            {
              provide: UsageLimitsService,
              useValue: { checkLimit: jest.fn() },
            },
            {
              provide: AnonymousTrackingService,
              useValue: { canAccess: jest.fn() },
            },
            {
              provide: UsersService,
              useValue: {
                findById: jest.fn().mockResolvedValue({ id: 1, plan: 'free' }),
              },
            },
            {
              provide: PlanConfigService,
              useValue: { findByPlanType: jest.fn().mockResolvedValue({}) },
            },
            {
              provide: Reflector,
              useValue: {
                getAllAndOverride: jest
                  .fn()
                  .mockReturnValueOnce(UsageFeature.DAILY_CARD)
                  .mockReturnValueOnce(false),
              },
            },
            {
              provide: getRepositoryToken(DailyReading),
              useValue: {
                createQueryBuilder: jest
                  .fn()
                  .mockReturnValue(mockDailyQueryBuilder),
              },
            },
            {
              provide: getRepositoryToken(TarotReading),
              useValue: { createQueryBuilder: jest.fn() },
            },
            {
              provide: getRepositoryToken(BirthChart),
              useValue: { createQueryBuilder: jest.fn() },
            },
          ],
        }).compile();

        await module1
          .get<CheckUsageLimitGuard>(CheckUsageLimitGuard)
          .canActivate(mockExecutionContext(1));
        expect(getTodaySpy).toHaveBeenCalled();

        // Test TAROT_READING
        const mockTarotQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(0),
        };

        const module2: TestingModule = await Test.createTestingModule({
          providers: [
            CheckUsageLimitGuard,
            {
              provide: UsageLimitsService,
              useValue: { checkLimit: jest.fn() },
            },
            {
              provide: AnonymousTrackingService,
              useValue: { canAccess: jest.fn() },
            },
            {
              provide: UsersService,
              useValue: {
                findById: jest.fn().mockResolvedValue({ id: 1, plan: 'free' }),
              },
            },
            {
              provide: PlanConfigService,
              useValue: {
                findByPlanType: jest
                  .fn()
                  .mockResolvedValue({ tarotReadingsLimit: 1 }),
              },
            },
            {
              provide: Reflector,
              useValue: {
                getAllAndOverride: jest
                  .fn()
                  .mockReturnValueOnce(UsageFeature.TAROT_READING)
                  .mockReturnValueOnce(false),
              },
            },
            {
              provide: getRepositoryToken(DailyReading),
              useValue: { createQueryBuilder: jest.fn() },
            },
            {
              provide: getRepositoryToken(TarotReading),
              useValue: {
                createQueryBuilder: jest
                  .fn()
                  .mockReturnValue(mockTarotQueryBuilder),
              },
            },
            {
              provide: getRepositoryToken(BirthChart),
              useValue: { createQueryBuilder: jest.fn() },
            },
          ],
        }).compile();

        await module2
          .get<CheckUsageLimitGuard>(CheckUsageLimitGuard)
          .canActivate(mockExecutionContext(1));
        expect(getStartSpy).toHaveBeenCalled();

        jest.restoreAllMocks();
      });
    });

    describe('BIRTH_CHART limits', () => {
      describe('authenticated users - monthly limits', () => {
        it('FREE: should allow birth chart generation when under monthly limit (0/3)', async () => {
          const userId = 1;
          const startOfMonth = new Date('2025-02-01T00:00:00.000Z');

          // Mock getStartOfMonthUTC to return first day of current month
          jest
            .spyOn(dateUtils, 'getStartOfMonthUTC')
            .mockReturnValue(startOfMonth);

          const mockBirthChartRepository = {
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockResolvedValue(0), // 0 charts this month
            }),
          };

          const module: TestingModule = await Test.createTestingModule({
            providers: [
              CheckUsageLimitGuard,
              {
                provide: UsageLimitsService,
                useValue: {
                  checkLimit: jest.fn(),
                  getRemainingUsage: jest.fn(),
                },
              },
              {
                provide: AnonymousTrackingService,
                useValue: { canAccess: jest.fn(), recordUsage: jest.fn() },
              },
              {
                provide: UsersService,
                useValue: {
                  findById: jest
                    .fn()
                    .mockResolvedValue({ id: userId, plan: 'free' }),
                },
              },
              {
                provide: PlanConfigService,
                useValue: { findByPlanType: jest.fn() },
              },
              {
                provide: Reflector,
                useValue: {
                  getAllAndOverride: jest.fn().mockReturnValueOnce(UsageFeature.BIRTH_CHART).mockReturnValueOnce(false).mockReturnValueOnce(UsageFeature.BIRTH_CHART).mockReturnValueOnce(false), // allowAnonymous = false
                },
              },
              {
                provide: getRepositoryToken(DailyReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
              {
                provide: getRepositoryToken(TarotReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
              {
                provide: getRepositoryToken(BirthChart),
                useValue: mockBirthChartRepository,
              },
            ],
          }).compile();

          const testGuard =
            module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);

          const context = mockExecutionContext(userId);
          const result = await testGuard.canActivate(context);

          expect(result).toBe(true);
          expect(
            mockBirthChartRepository.createQueryBuilder,
          ).toHaveBeenCalled();
          jest.restoreAllMocks();
        });

        it('FREE: should block birth chart generation when monthly limit reached (3/3)', async () => {
          const userId = 1;
          const startOfMonth = new Date('2025-02-01T00:00:00.000Z');

          jest
            .spyOn(dateUtils, 'getStartOfMonthUTC')
            .mockReturnValue(startOfMonth);

          const mockBirthChartRepository = {
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockResolvedValue(3), // Already at limit
            }),
          };

          const module: TestingModule = await Test.createTestingModule({
            providers: [
              CheckUsageLimitGuard,
              {
                provide: UsageLimitsService,
                useValue: {
                  checkLimit: jest.fn(),
                  getRemainingUsage: jest.fn(),
                },
              },
              {
                provide: AnonymousTrackingService,
                useValue: { canAccess: jest.fn(), recordUsage: jest.fn() },
              },
              {
                provide: UsersService,
                useValue: {
                  findById: jest
                    .fn()
                    .mockResolvedValue({ id: userId, plan: 'free' }),
                },
              },
              {
                provide: PlanConfigService,
                useValue: { findByPlanType: jest.fn() },
              },
              {
                provide: Reflector,
                useValue: {
                  getAllAndOverride: jest.fn().mockReturnValueOnce(UsageFeature.BIRTH_CHART).mockReturnValueOnce(false).mockReturnValueOnce(UsageFeature.BIRTH_CHART).mockReturnValueOnce(false),
                },
              },
              {
                provide: getRepositoryToken(DailyReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
              {
                provide: getRepositoryToken(TarotReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
              {
                provide: getRepositoryToken(BirthChart),
                useValue: mockBirthChartRepository,
              },
            ],
          }).compile();

          const testGuard =
            module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);

          const context = mockExecutionContext(userId);

          await expect(testGuard.canActivate(context)).rejects.toThrow(
            ForbiddenException,
          );
          await expect(testGuard.canActivate(context)).rejects.toThrow(
            'Has alcanzado tu límite mensual de cartas astrales (3 por mes para plan free). Tu cuota se restablecerá el próximo mes. Actualiza a Premium para generar más cartas astrales.',
          );

          jest.restoreAllMocks();
        });

        it('PREMIUM: should allow birth chart generation when under monthly limit (4/5)', async () => {
          const userId = 2;
          const startOfMonth = new Date('2025-02-01T00:00:00.000Z');

          jest
            .spyOn(dateUtils, 'getStartOfMonthUTC')
            .mockReturnValue(startOfMonth);

          const mockBirthChartRepository = {
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockResolvedValue(4), // 4 charts this month
            }),
          };

          const module: TestingModule = await Test.createTestingModule({
            providers: [
              CheckUsageLimitGuard,
              {
                provide: UsageLimitsService,
                useValue: {
                  checkLimit: jest.fn(),
                  getRemainingUsage: jest.fn(),
                },
              },
              {
                provide: AnonymousTrackingService,
                useValue: { canAccess: jest.fn(), recordUsage: jest.fn() },
              },
              {
                provide: UsersService,
                useValue: {
                  findById: jest
                    .fn()
                    .mockResolvedValue({ id: userId, plan: 'premium' }),
                },
              },
              {
                provide: PlanConfigService,
                useValue: { findByPlanType: jest.fn() },
              },
              {
                provide: Reflector,
                useValue: {
                  getAllAndOverride: jest.fn().mockReturnValueOnce(UsageFeature.BIRTH_CHART).mockReturnValueOnce(false).mockReturnValueOnce(UsageFeature.BIRTH_CHART).mockReturnValueOnce(false),
                },
              },
              {
                provide: getRepositoryToken(DailyReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
              {
                provide: getRepositoryToken(TarotReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
              {
                provide: getRepositoryToken(BirthChart),
                useValue: mockBirthChartRepository,
              },
            ],
          }).compile();

          const testGuard =
            module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);

          const context = mockExecutionContext(userId);
          const result = await testGuard.canActivate(context);

          expect(result).toBe(true);
          jest.restoreAllMocks();
        });

        it('PREMIUM: should block birth chart generation when monthly limit reached (5/5)', async () => {
          const userId = 2;
          const startOfMonth = new Date('2025-02-01T00:00:00.000Z');

          jest
            .spyOn(dateUtils, 'getStartOfMonthUTC')
            .mockReturnValue(startOfMonth);

          const mockBirthChartRepository = {
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockResolvedValue(5), // At limit
            }),
          };

          const module: TestingModule = await Test.createTestingModule({
            providers: [
              CheckUsageLimitGuard,
              {
                provide: UsageLimitsService,
                useValue: {
                  checkLimit: jest.fn(),
                  getRemainingUsage: jest.fn(),
                },
              },
              {
                provide: AnonymousTrackingService,
                useValue: { canAccess: jest.fn(), recordUsage: jest.fn() },
              },
              {
                provide: UsersService,
                useValue: {
                  findById: jest
                    .fn()
                    .mockResolvedValue({ id: userId, plan: 'premium' }),
                },
              },
              {
                provide: PlanConfigService,
                useValue: { findByPlanType: jest.fn() },
              },
              {
                provide: Reflector,
                useValue: {
                  getAllAndOverride: jest.fn().mockReturnValueOnce(UsageFeature.BIRTH_CHART).mockReturnValueOnce(false).mockReturnValueOnce(UsageFeature.BIRTH_CHART).mockReturnValueOnce(false),
                },
              },
              {
                provide: getRepositoryToken(DailyReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
              {
                provide: getRepositoryToken(TarotReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
              {
                provide: getRepositoryToken(BirthChart),
                useValue: mockBirthChartRepository,
              },
            ],
          }).compile();

          const testGuard =
            module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);

          const context = mockExecutionContext(userId);

          await expect(testGuard.canActivate(context)).rejects.toThrow(
            ForbiddenException,
          );
          await expect(testGuard.canActivate(context)).rejects.toThrow(
            'Has alcanzado tu límite mensual de cartas astrales (5 por mes para plan premium). Tu cuota se restablecerá el próximo mes.',
          );

          jest.restoreAllMocks();
        });

        it('should reset monthly limit on new month', async () => {
          const userId = 1;
          // Previous month: February
          const februaryStart = new Date('2025-02-01T00:00:00.000Z');
          // Current month: March
          const marchStart = new Date('2025-03-01T00:00:00.000Z');

          // First call in February - user hits limit
          jest
            .spyOn(dateUtils, 'getStartOfMonthUTC')
            .mockReturnValue(februaryStart);

          const mockBirthChartRepository = {
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockResolvedValue(3), // Hit limit in Feb
            }),
          };

          const module: TestingModule = await Test.createTestingModule({
            providers: [
              CheckUsageLimitGuard,
              {
                provide: UsageLimitsService,
                useValue: {
                  checkLimit: jest.fn(),
                  getRemainingUsage: jest.fn(),
                },
              },
              {
                provide: AnonymousTrackingService,
                useValue: { canAccess: jest.fn(), recordUsage: jest.fn() },
              },
              {
                provide: UsersService,
                useValue: {
                  findById: jest
                    .fn()
                    .mockResolvedValue({ id: userId, plan: 'free' }),
                },
              },
              {
                provide: PlanConfigService,
                useValue: { findByPlanType: jest.fn() },
              },
              {
                provide: Reflector,
                useValue: {
                  getAllAndOverride: jest.fn(),
                },
              },
              {
                provide: getRepositoryToken(DailyReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
              {
                provide: getRepositoryToken(TarotReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
              {
                provide: getRepositoryToken(BirthChart),
                useValue: mockBirthChartRepository,
              },
            ],
          }).compile();

          const testGuard =
            module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);
          const reflector = module.get<Reflector>(Reflector);

          // February attempt - should block
          (reflector.getAllAndOverride as jest.Mock)
            .mockReturnValueOnce(UsageFeature.BIRTH_CHART)
            .mockReturnValueOnce(false);

          const contextFeb = mockExecutionContext(userId);
          await expect(testGuard.canActivate(contextFeb)).rejects.toThrow(
            ForbiddenException,
          );

          // March attempt - should allow (new month, count resets)
          jest
            .spyOn(dateUtils, 'getStartOfMonthUTC')
            .mockReturnValue(marchStart);

          mockBirthChartRepository.createQueryBuilder = jest
            .fn()
            .mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockResolvedValue(0), // No charts in March yet
            });

          (reflector.getAllAndOverride as jest.Mock)
            .mockReturnValueOnce(UsageFeature.BIRTH_CHART)
            .mockReturnValueOnce(false);

          const contextMar = mockExecutionContext(userId);
          const result = await testGuard.canActivate(contextMar);

          expect(result).toBe(true);
          jest.restoreAllMocks();
        });
      });

      describe('anonymous users - lifetime limit', () => {
        it('should allow FIRST birth chart generation for anonymous user', async () => {
          const context = mockExecutionContext(
            undefined,
            '192.168.1.100',
            'Mozilla/5.0',
          );

          const mockCanAccessLifetime = jest.fn().mockResolvedValue(true);
          const mockRecordLifetimeUsage = jest.fn().mockResolvedValue({
            id: 1,
            fingerprint: 'test-fingerprint-bc',
            ip: '192.168.1.100',
            feature: UsageFeature.BIRTH_CHART,
          });
          const mockGenerateFingerprint = jest
            .fn()
            .mockReturnValue('test-fingerprint-bc');

          const module: TestingModule = await Test.createTestingModule({
            providers: [
              CheckUsageLimitGuard,
              {
                provide: UsageLimitsService,
                useValue: {
                  checkLimit: jest.fn(),
                  getRemainingUsage: jest.fn(),
                },
              },
              {
                provide: AnonymousTrackingService,
                useValue: {
                  canAccess: jest.fn(),
                  recordUsage: jest.fn(),
                  canAccessLifetime: mockCanAccessLifetime,
                  recordLifetimeUsage: mockRecordLifetimeUsage,
                  generateFingerprint: mockGenerateFingerprint,
                },
              },
              {
                provide: UsersService,
                useValue: { findById: jest.fn() },
              },
              {
                provide: PlanConfigService,
                useValue: { findByPlanType: jest.fn() },
              },
              {
                provide: Reflector,
                useValue: {
                  getAllAndOverride: jest
                    .fn()
                    .mockReturnValueOnce(UsageFeature.BIRTH_CHART)
                    .mockReturnValueOnce(true), // allowAnonymous = true
                },
              },
              {
                provide: getRepositoryToken(DailyReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
              {
                provide: getRepositoryToken(TarotReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
            {
              provide: getRepositoryToken(BirthChart),
              useValue: { createQueryBuilder: jest.fn() },
            },
            ],
          }).compile();

          const testGuard =
            module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);
          const result = await testGuard.canActivate(context);

          expect(result).toBe(true);
          expect(mockGenerateFingerprint).toHaveBeenCalledWith(
            '192.168.1.100',
            'Mozilla/5.0',
          );
          expect(mockCanAccessLifetime).toHaveBeenCalledWith(
            'test-fingerprint-bc',
            UsageFeature.BIRTH_CHART,
          );
          expect(mockRecordLifetimeUsage).toHaveBeenCalledWith(
            'test-fingerprint-bc',
            '192.168.1.100',
            UsageFeature.BIRTH_CHART,
          );

          jest.restoreAllMocks();
        });

        it('should block SECOND birth chart generation for anonymous user (lifetime limit)', async () => {
          const context = mockExecutionContext(
            undefined,
            '192.168.1.100',
            'Mozilla/5.0',
          );

          const mockCanAccessLifetime = jest.fn().mockResolvedValue(false); // Already used
          const mockGenerateFingerprint = jest
            .fn()
            .mockReturnValue('test-fingerprint-bc');

          const module: TestingModule = await Test.createTestingModule({
            providers: [
              CheckUsageLimitGuard,
              {
                provide: UsageLimitsService,
                useValue: {
                  checkLimit: jest.fn(),
                  getRemainingUsage: jest.fn(),
                },
              },
              {
                provide: AnonymousTrackingService,
                useValue: {
                  canAccess: jest.fn(),
                  recordUsage: jest.fn(),
                  canAccessLifetime: mockCanAccessLifetime,
                  recordLifetimeUsage: jest.fn(),
                  generateFingerprint: mockGenerateFingerprint,
                },
              },
              {
                provide: UsersService,
                useValue: { findById: jest.fn() },
              },
              {
                provide: PlanConfigService,
                useValue: { findByPlanType: jest.fn() },
              },
              {
                provide: Reflector,
                useValue: {
                  getAllAndOverride: jest
                    .fn()
                    .mockReturnValueOnce(UsageFeature.BIRTH_CHART)
                    .mockReturnValueOnce(true) // allowAnonymous = true
                    .mockReturnValueOnce(UsageFeature.BIRTH_CHART)
                    .mockReturnValueOnce(true), // Second canActivate() call
                },
              },
              {
                provide: getRepositoryToken(DailyReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
              {
                provide: getRepositoryToken(TarotReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
            {
              provide: getRepositoryToken(BirthChart),
              useValue: { createQueryBuilder: jest.fn() },
            },
            ],
          }).compile();

          const testGuard =
            module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);

          await expect(testGuard.canActivate(context)).rejects.toThrow(
            ForbiddenException,
          );
          await expect(testGuard.canActivate(context)).rejects.toThrow(
            'Ya has generado tu carta astral gratuita. Regístrate para crear más cartas astrales.',
          );

          expect(mockCanAccessLifetime).toHaveBeenCalledWith(
            'test-fingerprint-bc',
            UsageFeature.BIRTH_CHART,
          );

          jest.restoreAllMocks();
        });
      });

      describe('error handling', () => {
        it('should handle user not found error', async () => {
          const userId = 999;
          const mockBirthChartRepository = {
            createQueryBuilder: jest.fn(),
          };

          const module: TestingModule = await Test.createTestingModule({
            providers: [
              CheckUsageLimitGuard,
              {
                provide: UsageLimitsService,
                useValue: {
                  checkLimit: jest.fn(),
                  getRemainingUsage: jest.fn(),
                },
              },
              {
                provide: AnonymousTrackingService,
                useValue: { canAccess: jest.fn(), recordUsage: jest.fn() },
              },
              {
                provide: UsersService,
                useValue: {
                  findById: jest.fn().mockResolvedValue(null), // User not found
                },
              },
              {
                provide: PlanConfigService,
                useValue: { findByPlanType: jest.fn() },
              },
              {
                provide: Reflector,
                useValue: {
                  getAllAndOverride: jest.fn().mockReturnValueOnce(UsageFeature.BIRTH_CHART).mockReturnValueOnce(false).mockReturnValueOnce(UsageFeature.BIRTH_CHART).mockReturnValueOnce(false),
                },
              },
              {
                provide: getRepositoryToken(DailyReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
              {
                provide: getRepositoryToken(TarotReading),
                useValue: { createQueryBuilder: jest.fn() },
              },
              {
                provide: getRepositoryToken(BirthChart),
                useValue: mockBirthChartRepository,
              },
            ],
          }).compile();

          const testGuard =
            module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);

          const context = mockExecutionContext(userId);

          await expect(testGuard.canActivate(context)).rejects.toThrow(
            'Usuario no encontrado',
          );

          jest.restoreAllMocks();
        });
      });
    });
  });
});
