import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AIQuotaGuard } from './ai-quota.guard';
import { AIQuotaService } from './ai-quota.service';
import { UserPlan } from '../users/entities/user.entity';

describe('AIQuotaGuard', () => {
  let guard: AIQuotaGuard;
  let aiQuotaService: jest.Mocked<AIQuotaService>;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockAIQuotaService = {
      checkMonthlyQuota: jest.fn(),
      getRemainingQuota: jest.fn(),
    };

    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIQuotaGuard,
        {
          provide: AIQuotaService,
          useValue: mockAIQuotaService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<AIQuotaGuard>(AIQuotaGuard);
    aiQuotaService = module.get(AIQuotaService);
    reflector = module.get(Reflector);
  });

  const createMockExecutionContext = (user: {
    id: number;
    plan: UserPlan;
  }): ExecutionContext => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should allow request when user has quota available', async () => {
      const context = createMockExecutionContext({
        id: 1,
        plan: UserPlan.FREE,
      });
      aiQuotaService.checkMonthlyQuota.mockResolvedValue(true);
      reflector.getAllAndOverride.mockReturnValue(false);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(aiQuotaService.checkMonthlyQuota).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException when FREE user has no quota', async () => {
      const context = createMockExecutionContext({
        id: 1,
        plan: UserPlan.FREE,
      });
      aiQuotaService.checkMonthlyQuota.mockResolvedValue(false);
      aiQuotaService.getRemainingQuota.mockResolvedValue({
        quotaLimit: 100,
        requestsUsed: 100,
        requestsRemaining: 0,
        percentageUsed: 100,
        resetDate: new Date('2025-12-01'),
        warningTriggered: true,
        plan: UserPlan.FREE,
        tokensUsed: 150000,
        costEstimated: 0,
        providerPrimarilyUsed: 'groq',
      });
      reflector.getAllAndOverride.mockReturnValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        /Has alcanzado tu límite mensual de 100 interpretaciones/,
      );
    });

    it('should allow PREMIUM user regardless of quota', async () => {
      const context = createMockExecutionContext({
        id: 2,
        plan: UserPlan.PREMIUM,
      });
      aiQuotaService.checkMonthlyQuota.mockResolvedValue(true);
      reflector.getAllAndOverride.mockReturnValue(false);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(aiQuotaService.checkMonthlyQuota).toHaveBeenCalledWith(2);
    });

    it('should skip check when @SkipQuotaCheck decorator is present', async () => {
      const context = createMockExecutionContext({
        id: 1,
        plan: UserPlan.FREE,
      });
      reflector.getAllAndOverride.mockReturnValue(true); // Decorator present

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(aiQuotaService.checkMonthlyQuota).not.toHaveBeenCalled();
    });

    it('should handle missing user gracefully', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: null,
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;
      reflector.getAllAndOverride.mockReturnValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should include reset date in error message', async () => {
      const resetDate = new Date('2025-12-01T12:00:00Z'); // Usar mediodía UTC para evitar timezone issues
      const context = createMockExecutionContext({
        id: 1,
        plan: UserPlan.FREE,
      });
      aiQuotaService.checkMonthlyQuota.mockResolvedValue(false);
      aiQuotaService.getRemainingQuota.mockResolvedValue({
        quotaLimit: 100,
        requestsUsed: 100,
        requestsRemaining: 0,
        percentageUsed: 100,
        resetDate,
        warningTriggered: true,
        plan: UserPlan.FREE,
        tokensUsed: 150000,
        costEstimated: 0,
        providerPrimarilyUsed: 'groq',
      });
      reflector.getAllAndOverride.mockReturnValue(false);

      try {
        await guard.canActivate(context);
        fail('Expected ForbiddenException to be thrown');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(ForbiddenException);
        if (error instanceof ForbiddenException) {
          expect(error.message).toContain('Tu cuota se renovará el');
          expect(error.message).toContain('2025'); // Verificar que incluye el año
        }
      }
    });
  });
});
