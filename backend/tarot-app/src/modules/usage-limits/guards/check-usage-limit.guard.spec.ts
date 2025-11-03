import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { CheckUsageLimitGuard } from './check-usage-limit.guard';
import { UsageLimitsService } from '../usage-limits.service';
import { UsageFeature } from '../entities/usage-limit.entity';
import { USAGE_LIMIT_FEATURE_KEY } from '../decorators/check-usage-limit.decorator';

describe('CheckUsageLimitGuard', () => {
  let guard: CheckUsageLimitGuard;
  let usageLimitsService: { checkLimit: jest.Mock };
  let reflector: { getAllAndOverride: jest.Mock };

  const mockExecutionContext = (userId: number): ExecutionContext => {
    const handler = jest.fn();
    const classRef = jest.fn();
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { userId },
        }),
      }),
      getHandler: () => handler,
      getClass: () => classRef,
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const mockCheckLimit = jest.fn();
    const mockGetAllAndOverride = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckUsageLimitGuard,
        {
          provide: UsageLimitsService,
          useValue: {
            checkLimit: mockCheckLimit,
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: mockGetAllAndOverride,
          },
        },
      ],
    }).compile();

    guard = module.get<CheckUsageLimitGuard>(CheckUsageLimitGuard);
    usageLimitsService = module.get(UsageLimitsService);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow action when limit is not reached', async () => {
      const context = mockExecutionContext(1);
      reflector.getAllAndOverride.mockReturnValue(UsageFeature.TAROT_READING);
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
      reflector.getAllAndOverride.mockReturnValue(UsageFeature.TAROT_READING);
      usageLimitsService.checkLimit.mockResolvedValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Has alcanzado el límite diario para esta función. Por favor, actualiza tu plan o intenta mañana.',
      );
    });

    it('should handle premium users with unlimited limit (-1)', async () => {
      const context = mockExecutionContext(2);
      reflector.getAllAndOverride.mockReturnValue(
        UsageFeature.INTERPRETATION_REGENERATION,
      );
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
      reflector.getAllAndOverride.mockReturnValue(UsageFeature.ORACLE_QUERY);
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
      reflector.getAllAndOverride.mockReturnValue(UsageFeature.TAROT_READING);
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
    });

    it('should extract userId from request.user correctly', async () => {
      const context = mockExecutionContext(42);
      reflector.getAllAndOverride.mockReturnValue(UsageFeature.TAROT_READING);
      usageLimitsService.checkLimit.mockResolvedValue(true);

      await guard.canActivate(context);

      expect(usageLimitsService.checkLimit).toHaveBeenCalledWith(
        42,
        UsageFeature.TAROT_READING,
      );
    });
  });
});
