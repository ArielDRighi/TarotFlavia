import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { CheckUsageLimitGuard } from './check-usage-limit.guard';
import { UsageLimitsService } from '../usage-limits.service';
import { AnonymousTrackingService } from '../services/anonymous-tracking.service';
import { UsageFeature } from '../entities/usage-limit.entity';
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
          provide: Reflector,
          useValue: {
            getAllAndOverride: mockGetAllAndOverride,
          },
        },
        {
          provide: 'DailyReadingRepository',
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);
    usageLimitsService = module.get(UsageLimitsService);
    anonymousTrackingService = module.get(AnonymousTrackingService);
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
      usageLimitsService.checkLimit.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(usageLimitsService.checkLimit).toHaveBeenCalledWith(
        1,
        UsageFeature.TAROT_READING,
      );
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        USAGE_LIMIT_FEATURE_KEY,
        [expect.any(Function), expect.any(Function)],
      );
    });

    it('should block action when limit is reached (403)', async () => {
      const context = mockExecutionContext(1);
      reflector.getAllAndOverride
        .mockReturnValueOnce(UsageFeature.TAROT_READING)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(UsageFeature.TAROT_READING) // second call
        .mockReturnValueOnce(false); // allowAnonymous (second call)
      usageLimitsService.checkLimit.mockResolvedValue(false);
      usageLimitsService.getRemainingUsage.mockResolvedValue(0);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );

      // Create new context for second assertion
      const context2 = mockExecutionContext(1);
      await expect(guard.canActivate(context2)).rejects.toThrow(
        'Has alcanzado tu límite diario para esta función. Tu cuota se restablecerá a medianoche (00:00 UTC). Intenta nuevamente mañana o actualiza tu plan para obtener más acceso.',
      );
    });

    it('should handle premium users with unlimited limit (-1)', async () => {
      const context = mockExecutionContext(2);
      reflector.getAllAndOverride
        .mockReturnValueOnce(UsageFeature.INTERPRETATION_REGENERATION)
        .mockReturnValueOnce(false);
      usageLimitsService.checkLimit.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(usageLimitsService.checkLimit).toHaveBeenCalledWith(
        2,
        UsageFeature.INTERPRETATION_REGENERATION,
      );
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
      usageLimitsService.checkLimit.mockRejectedValue(
        new Error('Service error'),
      );

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
      usageLimitsService.checkLimit.mockResolvedValue(true);

      await guard.canActivate(context);

      expect(usageLimitsService.checkLimit).toHaveBeenCalledWith(
        42,
        UsageFeature.TAROT_READING,
      );
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
