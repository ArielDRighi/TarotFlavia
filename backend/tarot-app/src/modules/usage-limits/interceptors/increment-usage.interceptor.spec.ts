import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IncrementUsageInterceptor } from './increment-usage.interceptor';
import { UsageLimitsService } from '../usage-limits.service';
import { UsageFeature } from '../entities/usage-limit.entity';
import { USAGE_LIMIT_FEATURE_KEY } from '../decorators/check-usage-limit.decorator';

describe('IncrementUsageInterceptor', () => {
  let interceptor: IncrementUsageInterceptor;
  let usageLimitsService: { incrementUsage: jest.Mock };
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

  const mockCallHandler = (value: unknown): CallHandler => {
    return {
      handle: () => of(value),
    } as CallHandler;
  };

  beforeEach(async () => {
    const mockIncrementUsage = jest.fn();
    const mockGetAllAndOverride = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncrementUsageInterceptor,
        {
          provide: UsageLimitsService,
          useValue: {
            incrementUsage: mockIncrementUsage,
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

    interceptor = module.get<IncrementUsageInterceptor>(
      IncrementUsageInterceptor,
    );
    usageLimitsService = module.get(UsageLimitsService);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should increment usage after successful handler execution', async () => {
      const context = mockExecutionContext(1);
      const handler = mockCallHandler({ success: true });
      reflector.getAllAndOverride.mockReturnValue(UsageFeature.TAROT_READING);
      usageLimitsService.incrementUsage.mockResolvedValue({
        id: 1,
        userId: 1,
        feature: UsageFeature.TAROT_READING,
        count: 1,
        date: new Date(),
        createdAt: new Date(),
      } as never);

      const result$ = interceptor.intercept(context, handler);

      await new Promise<void>((resolve) => {
        result$.subscribe({
          next: (value) => {
            expect(value).toEqual({ success: true });
            resolve();
          },
        });
      });

      // Wait a bit for tap to execute
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(usageLimitsService.incrementUsage).toHaveBeenCalledWith(
        1,
        UsageFeature.TAROT_READING,
      );
    });

    it('should not block response if incrementUsage fails', async () => {
      const context = mockExecutionContext(1);
      const handler = mockCallHandler({ success: true });
      reflector.getAllAndOverride.mockReturnValue(UsageFeature.TAROT_READING);
      usageLimitsService.incrementUsage.mockRejectedValue(
        new Error('Database error'),
      );

      const result$ = interceptor.intercept(context, handler);

      await new Promise<void>((resolve) => {
        result$.subscribe({
          next: (value) => {
            expect(value).toEqual({ success: true });
            resolve();
          },
        });
      });

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(usageLimitsService.incrementUsage).toHaveBeenCalled();
    });

    it('should skip increment when no feature metadata is found', async () => {
      const context = mockExecutionContext(1);
      const handler = mockCallHandler({ success: true });
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result$ = interceptor.intercept(context, handler);

      await new Promise<void>((resolve) => {
        result$.subscribe({
          next: (value) => {
            expect(value).toEqual({ success: true });
            resolve();
          },
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(usageLimitsService.incrementUsage).not.toHaveBeenCalled();
    });

    it('should extract feature from decorator metadata correctly', async () => {
      const context = mockExecutionContext(2);
      const handler = mockCallHandler({ data: 'test' });
      reflector.getAllAndOverride.mockReturnValue(UsageFeature.ORACLE_QUERY);
      usageLimitsService.incrementUsage.mockResolvedValue({} as never);

      const result$ = interceptor.intercept(context, handler);

      await new Promise<void>((resolve) => {
        result$.subscribe({
          next: () => resolve(),
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        USAGE_LIMIT_FEATURE_KEY,
        [expect.any(Function), expect.any(Function)],
      );
      expect(usageLimitsService.incrementUsage).toHaveBeenCalledWith(
        2,
        UsageFeature.ORACLE_QUERY,
      );
    });

    it('should extract userId from request correctly', async () => {
      const context = mockExecutionContext(42);
      const handler = mockCallHandler({ result: 'ok' });
      reflector.getAllAndOverride.mockReturnValue(
        UsageFeature.INTERPRETATION_REGENERATION,
      );
      usageLimitsService.incrementUsage.mockResolvedValue({} as never);

      const result$ = interceptor.intercept(context, handler);

      await new Promise<void>((resolve) => {
        result$.subscribe({
          next: () => resolve(),
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(usageLimitsService.incrementUsage).toHaveBeenCalledWith(
        42,
        UsageFeature.INTERPRETATION_REGENERATION,
      );
    });

    it('should still return response even if handler throws error', async () => {
      const context = mockExecutionContext(1);
      const handler = {
        handle: () => throwError(() => new Error('Handler error')),
      } as CallHandler;
      reflector.getAllAndOverride.mockReturnValue(UsageFeature.TAROT_READING);

      const result$ = interceptor.intercept(context, handler);

      await new Promise<void>((resolve, reject) => {
        result$.subscribe({
          error: (error: Error) => {
            expect(error.message).toBe('Handler error');
            resolve();
          },
          next: () => reject(new Error('Should not emit value')),
        });
      });

      // Increment should not be called if handler fails
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(usageLimitsService.incrementUsage).not.toHaveBeenCalled();
    });

    it('should pass through the response unchanged', async () => {
      const context = mockExecutionContext(1);
      const expectedResponse = {
        id: 123,
        data: 'test response',
        nested: { value: 456 },
      };
      const handler = mockCallHandler(expectedResponse);
      reflector.getAllAndOverride.mockReturnValue(UsageFeature.TAROT_READING);
      usageLimitsService.incrementUsage.mockResolvedValue({} as never);

      const result$ = interceptor.intercept(context, handler);

      await new Promise<void>((resolve) => {
        result$.subscribe({
          next: (value) => {
            expect(value).toEqual(expectedResponse);
            resolve();
          },
        });
      });
    });
  });
});
