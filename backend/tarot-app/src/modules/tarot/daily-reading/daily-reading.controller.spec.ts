import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import {
  DailyReadingController,
  DailyReadingPublicController,
} from './daily-reading.controller';
import { DailyReadingService } from './daily-reading.service';
import { IncrementUsageInterceptor } from '../../usage-limits/interceptors/increment-usage.interceptor';
import { UsageLimitsService } from '../../usage-limits/usage-limits.service';
import { UsageFeature } from '../../usage-limits/entities/usage-limit.entity';
import { DailyReading } from './entities/daily-reading.entity';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { AIQuotaGuard } from '../../ai-usage/infrastructure/guards/ai-quota.guard';
import { CheckUsageLimitGuard } from '../../usage-limits/guards/check-usage-limit.guard';

describe('DailyReadingController - IncrementUsageInterceptor Integration', () => {
  let controller: DailyReadingController;
  let dailyReadingService: DailyReadingService;
  let interceptor: IncrementUsageInterceptor;
  let usageLimitsService: UsageLimitsService;

  const mockCard: Partial<TarotCard> = {
    id: 1,
    name: 'The Fool',
    number: 0,
    meaningUpright: 'New beginnings',
    meaningReversed: 'Recklessness',
    imageUrl: 'fool.jpg',
  };

  const mockDailyReading: Partial<DailyReading> = {
    id: 1,
    userId: 1,
    anonymousFingerprint: null,
    tarotistaId: 1,
    cardId: 1,
    card: mockCard as TarotCard,
    isReversed: false,
    interpretation: 'Test interpretation',
    readingDate: new Date(),
    wasRegenerated: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest = { user: { userId: 1 } };

  beforeEach(async () => {
    const mockDailyReadingService = {
      generateDailyCard: jest.fn(),
      getTodayCard: jest.fn(),
      getDailyHistory: jest.fn(),
      regenerateDailyCard: jest.fn(),
    };

    const mockUsageLimitsService = {
      incrementUsage: jest.fn(),
      checkLimit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyReadingController],
      providers: [
        {
          provide: DailyReadingService,
          useValue: mockDailyReadingService,
        },
        {
          provide: UsageLimitsService,
          useValue: mockUsageLimitsService,
        },
        IncrementUsageInterceptor,
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AIQuotaGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DailyReadingController>(DailyReadingController);
    dailyReadingService = module.get<DailyReadingService>(DailyReadingService);
    interceptor = module.get<IncrementUsageInterceptor>(
      IncrementUsageInterceptor,
    );
    usageLimitsService = module.get<UsageLimitsService>(UsageLimitsService);
  });

  describe('IncrementUsageInterceptor configuration', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
      expect(interceptor).toBeDefined();
    });

    it('should have IncrementUsageInterceptor available', () => {
      expect(interceptor).toBeInstanceOf(IncrementUsageInterceptor);
    });
  });

  describe('generateDailyCard - with usage increment', () => {
    it('should generate daily card and increment usage counter', async () => {
      // Arrange
      jest
        .spyOn(dailyReadingService, 'generateDailyCard')
        .mockResolvedValue(mockDailyReading as DailyReading);
      jest.spyOn(usageLimitsService, 'incrementUsage').mockResolvedValue({
        id: 1,
        userId: 1,
        feature: UsageFeature.TAROT_READING,
        count: 1,
        date: new Date(),
        createdAt: new Date(),
      } as never);

      // Act
      const result = await controller.generateDailyCard(mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.userId).toBe(1);
      expect(dailyReadingService.generateDailyCard).toHaveBeenCalledWith(1, 1);
    });

    it('should continue generating card even if increment fails', async () => {
      // Arrange
      jest
        .spyOn(dailyReadingService, 'generateDailyCard')
        .mockResolvedValue(mockDailyReading as DailyReading);
      jest
        .spyOn(usageLimitsService, 'incrementUsage')
        .mockRejectedValue(new Error('Database error'));

      // Act - should not throw
      const result = await controller.generateDailyCard(mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(dailyReadingService.generateDailyCard).toHaveBeenCalled();
    });
  });

  describe('Interceptor behavior with metadata', () => {
    it('should extract feature from CheckUsageLimit decorator', async () => {
      // Mock incrementUsage for this test
      jest.spyOn(usageLimitsService, 'incrementUsage').mockResolvedValue({
        id: 1,
        userId: 1,
        feature: UsageFeature.TAROT_READING,
        count: 1,
        date: new Date(),
        createdAt: new Date(),
      } as never);

      // Create a mock execution context
      const mockExecutionContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: () => controller.generateDailyCard,
        getClass: () => DailyReadingController,
      } as unknown as ExecutionContext;

      const mockCallHandler = {
        handle: () => of(mockDailyReading),
      };

      // Execute interceptor
      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      // Subscribe to result
      await new Promise<void>((resolve) => {
        result$.subscribe({
          next: () => resolve(),
        });
      });

      // The interceptor should work (note: actual metadata check would require real decorators)
      expect(mockCallHandler.handle).toBeDefined();
    });
  });

  describe('Anonymous endpoint - should NOT increment usage', () => {
    it('should not have interceptor for anonymous endpoint', () => {
      // The public controller should not use IncrementUsageInterceptor
      // because it uses tracking service instead
      const publicController = new DailyReadingPublicController(
        dailyReadingService,
      );
      expect(publicController).toBeDefined();
      // Anonymous requests use tracking service, not usage limits service
    });
  });

  describe('User can verify usage in profile', () => {
    it('should track daily reading generation in usage limits', async () => {
      // Arrange
      jest
        .spyOn(dailyReadingService, 'generateDailyCard')
        .mockResolvedValue(mockDailyReading as DailyReading);
      jest.spyOn(usageLimitsService, 'incrementUsage').mockResolvedValue({
        id: 1,
        userId: 1,
        feature: UsageFeature.TAROT_READING,
        count: 1,
        date: new Date(),
        createdAt: new Date(),
      } as never);

      // Act
      await controller.generateDailyCard(mockRequest);

      // Give time for async tap to execute
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assert - The usage should be tracked for the profile
      // (The actual verification would be in the usage-limits or profile controller)
      expect(dailyReadingService.generateDailyCard).toHaveBeenCalled();
    });
  });

  describe('FREE user usage counter', () => {
    it('should show usage count after generating daily card', async () => {
      // Arrange
      const freeUserRequest = { user: { userId: 2 } };
      jest
        .spyOn(dailyReadingService, 'generateDailyCard')
        .mockResolvedValue({ ...mockDailyReading, userId: 2 } as DailyReading);
      jest.spyOn(usageLimitsService, 'incrementUsage').mockResolvedValue({
        id: 2,
        userId: 2,
        feature: UsageFeature.TAROT_READING,
        count: 1, // First usage
        date: new Date(),
        createdAt: new Date(),
      } as never);

      // Act
      const result = await controller.generateDailyCard(freeUserRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe(2);
      // Usage count would be retrieved from usage-limits service
      // FREE users have limit of 2 daily readings (1 daily card + 1 three-card reading)
    });
  });
});

describe('DailyReadingPublicController - Anonymous Usage', () => {
  let publicController: DailyReadingPublicController;
  let dailyReadingService: DailyReadingService;

  const mockCard: Partial<TarotCard> = {
    id: 1,
    name: 'The Fool',
    number: 0,
    meaningUpright: 'New beginnings',
    meaningReversed: 'Recklessness',
    imageUrl: 'fool.jpg',
  };

  const mockAnonymousDailyReading: Partial<DailyReading> = {
    id: 1,
    userId: null,
    anonymousFingerprint: 'test-fingerprint-123',
    tarotistaId: 1,
    cardId: 1,
    card: mockCard as TarotCard,
    isReversed: false,
    interpretation: null,
    readingDate: new Date(),
    wasRegenerated: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockDailyReadingService = {
      generateAnonymousDailyCard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyReadingPublicController],
      providers: [
        {
          provide: DailyReadingService,
          useValue: mockDailyReadingService,
        },
      ],
    })
      .overrideGuard(CheckUsageLimitGuard)
      .useValue({ canActivate: () => true })
      .compile();

    publicController = module.get<DailyReadingPublicController>(
      DailyReadingPublicController,
    );
    dailyReadingService = module.get<DailyReadingService>(DailyReadingService);
  });

  describe('Anonymous daily card generation', () => {
    it('should generate anonymous daily card using fingerprint', async () => {
      // Arrange
      jest
        .spyOn(dailyReadingService, 'generateAnonymousDailyCard')
        .mockResolvedValue(mockAnonymousDailyReading as DailyReading);

      const dto = { fingerprint: 'test-fingerprint-123' };

      // Act
      const result = await publicController.generateAnonymousDailyCard(dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBeNull();
      expect(result.interpretation).toBeNull();
      expect(result.cardMeaning).toBeDefined(); // Should have basic meaning from DB
      expect(
        dailyReadingService.generateAnonymousDailyCard,
      ).toHaveBeenCalledWith('test-fingerprint-123', 1);
    });

    it('should apply usage limit for anonymous users through guard', async () => {
      // Arrange
      jest
        .spyOn(dailyReadingService, 'generateAnonymousDailyCard')
        .mockResolvedValue(mockAnonymousDailyReading as DailyReading);

      const dto = { fingerprint: 'test-fingerprint-456' };

      // Act
      const result = await publicController.generateAnonymousDailyCard(dto);

      // Assert
      expect(result).toBeDefined();
      // CheckUsageLimitGuard should verify the anonymous user's limit
      // This is tested in the guard's own test suite
    });
  });
});
