import { Test, TestingModule } from '@nestjs/testing';
import { AIUsageOrchestratorService } from './ai-usage-orchestrator.service';
import { TrackAIUsageUseCase } from '../use-cases/track-ai-usage.use-case';
import { GetAIUsageStatisticsUseCase } from '../use-cases/get-ai-usage-statistics.use-case';
import { CheckUserQuotaUseCase } from '../use-cases/check-user-quota.use-case';
import { TrackProviderUsageUseCase } from '../use-cases/track-provider-usage.use-case';
import { IncrementUserAIRequestsUseCase } from '../use-cases/increment-user-ai-requests.use-case';
import { AIProvider, AIUsageStatus } from '../../entities/ai-usage-log.entity';

describe('AIUsageOrchestratorService', () => {
  let service: AIUsageOrchestratorService;
  let trackAIUsageUseCase: jest.Mocked<TrackAIUsageUseCase>;
  let getStatisticsUseCase: jest.Mocked<GetAIUsageStatisticsUseCase>;
  let checkQuotaUseCase: jest.Mocked<CheckUserQuotaUseCase>;
  let trackProviderUsageUseCase: jest.Mocked<TrackProviderUsageUseCase>;
  let incrementUserRequestsUseCase: jest.Mocked<IncrementUserAIRequestsUseCase>;

  beforeEach(async () => {
    const mockTrackAIUsageUseCase = {
      execute: jest.fn(),
    };

    const mockGetStatisticsUseCase = {
      execute: jest.fn(),
    };

    const mockCheckQuotaUseCase = {
      execute: jest.fn(),
      getQuotaInfo: jest.fn(),
    };

    const mockTrackProviderUsageUseCase = {
      execute: jest.fn(),
    };

    const mockIncrementUserRequestsUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIUsageOrchestratorService,
        {
          provide: TrackAIUsageUseCase,
          useValue: mockTrackAIUsageUseCase,
        },
        {
          provide: GetAIUsageStatisticsUseCase,
          useValue: mockGetStatisticsUseCase,
        },
        {
          provide: CheckUserQuotaUseCase,
          useValue: mockCheckQuotaUseCase,
        },
        {
          provide: TrackProviderUsageUseCase,
          useValue: mockTrackProviderUsageUseCase,
        },
        {
          provide: IncrementUserAIRequestsUseCase,
          useValue: mockIncrementUserRequestsUseCase,
        },
      ],
    }).compile();

    service = module.get<AIUsageOrchestratorService>(
      AIUsageOrchestratorService,
    );
    trackAIUsageUseCase = module.get(TrackAIUsageUseCase);
    getStatisticsUseCase = module.get(GetAIUsageStatisticsUseCase);
    checkQuotaUseCase = module.get(CheckUserQuotaUseCase);
    trackProviderUsageUseCase = module.get(TrackProviderUsageUseCase);
    incrementUserRequestsUseCase = module.get(IncrementUserAIRequestsUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('trackUsage', () => {
    it('should delegate to TrackAIUsageUseCase', async () => {
      const data = {
        userId: 1,
        readingId: 1,
        provider: AIProvider.GROQ,
        modelUsed: 'llama-3.1-70b',
        promptTokens: 100,
        completionTokens: 200,
        totalTokens: 300,
        costUsd: 0,
        durationMs: 5000,
        status: AIUsageStatus.SUCCESS,
        errorMessage: null,
        fallbackUsed: false,
      };

      await service.trackUsage(data);

      expect(trackAIUsageUseCase.execute).toHaveBeenCalledWith(data);
    });
  });

  describe('getStatistics', () => {
    it('should delegate to GetAIUsageStatisticsUseCase', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      await service.getStatistics(startDate, endDate);

      expect(getStatisticsUseCase.execute).toHaveBeenCalledWith(
        startDate,
        endDate,
      );
    });
  });

  describe('checkUserQuota', () => {
    it('should delegate to CheckUserQuotaUseCase', async () => {
      const userId = 1;

      await service.checkUserQuota(userId);

      expect(checkQuotaUseCase.execute).toHaveBeenCalledWith(userId);
    });
  });

  describe('getQuotaInfo', () => {
    it('should delegate to CheckUserQuotaUseCase.getQuotaInfo', async () => {
      const userId = 1;

      await service.getQuotaInfo(userId);

      expect(checkQuotaUseCase.getQuotaInfo).toHaveBeenCalledWith(userId);
    });
  });

  describe('trackProviderUsage', () => {
    it('should delegate to TrackProviderUsageUseCase', async () => {
      const provider = AIProvider.GROQ;
      const tokens = 1000;
      const cost = 0;

      await service.trackProviderUsage(provider, tokens, cost);

      expect(trackProviderUsageUseCase.execute).toHaveBeenCalledWith(
        provider,
        tokens,
        cost,
      );
    });
  });

  describe('incrementUserRequests', () => {
    it('should delegate to IncrementUserAIRequestsUseCase', async () => {
      const userId = 1;

      await service.incrementUserRequests(userId);

      expect(incrementUserRequestsUseCase.execute).toHaveBeenCalledWith(
        userId,
      );
    });
  });
});
