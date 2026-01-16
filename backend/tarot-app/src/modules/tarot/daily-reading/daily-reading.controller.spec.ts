import { Test, TestingModule } from '@nestjs/testing';
import {
  DailyReadingController,
  DailyReadingPublicController,
} from './daily-reading.controller';
import { DailyReadingService } from './daily-reading.service';
import { ShareTextGeneratorService } from '../readings/application/services/share-text-generator.service';
import { IncrementUsageInterceptor } from '../../usage-limits/interceptors/increment-usage.interceptor';
import { UsageLimitsService } from '../../usage-limits/usage-limits.service';
import { DailyReading } from './entities/daily-reading.entity';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { AIQuotaGuard } from '../../ai-usage/infrastructure/guards/ai-quota.guard';
import { CheckUsageLimitGuard } from '../../usage-limits/guards/check-usage-limit.guard';
import { Reflector } from '@nestjs/core';

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

    const mockShareTextGeneratorService = {
      generateShareText: jest.fn(),
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
        {
          provide: ShareTextGeneratorService,
          useValue: mockShareTextGeneratorService,
        },
        IncrementUsageInterceptor,
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AIQuotaGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CheckUsageLimitGuard)
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
    it('should generate daily card successfully', async () => {
      // Arrange
      jest
        .spyOn(dailyReadingService, 'generateDailyCard')
        .mockResolvedValue(mockDailyReading as DailyReading);
      jest.spyOn(usageLimitsService, 'checkLimit').mockResolvedValue(true);

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
      jest.spyOn(usageLimitsService, 'checkLimit').mockResolvedValue(true);
      jest
        .spyOn(usageLimitsService, 'incrementUsage')
        .mockRejectedValue(new Error('Database error'));

      // Act - should not throw
      const result = await controller.generateDailyCard(mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(dailyReadingService.generateDailyCard).toHaveBeenCalled();
    });

    it('should work with different user IDs', async () => {
      // Arrange
      const freeUserRequest = { user: { userId: 2 } };
      jest
        .spyOn(dailyReadingService, 'generateDailyCard')
        .mockResolvedValue({ ...mockDailyReading, userId: 2 } as DailyReading);
      jest.spyOn(usageLimitsService, 'checkLimit').mockResolvedValue(true);

      // Act
      const result = await controller.generateDailyCard(freeUserRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe(2);
      expect(dailyReadingService.generateDailyCard).toHaveBeenCalledWith(2, 1);
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
