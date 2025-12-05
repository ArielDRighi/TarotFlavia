import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmAIUsageLogRepository } from './typeorm-ai-usage-log.repository';
import {
  AIUsageLog,
  AIProvider,
  AIUsageStatus,
} from '../../entities/ai-usage-log.entity';

describe('TypeOrmAIUsageLogRepository', () => {
  let repository: TypeOrmAIUsageLogRepository;
  let typeormRepo: jest.Mocked<Repository<AIUsageLog>>;

  beforeEach(async () => {
    const mockTypeormRepo = {
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmAIUsageLogRepository,
        {
          provide: getRepositoryToken(AIUsageLog),
          useValue: mockTypeormRepo,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmAIUsageLogRepository>(
      TypeOrmAIUsageLogRepository,
    );
    typeormRepo = module.get(getRepositoryToken(AIUsageLog));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createLog', () => {
    it('should create and save an AI usage log', async () => {
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

      const mockLog = { id: '123', ...data } as AIUsageLog;

      typeormRepo.create.mockReturnValue(mockLog);
      typeormRepo.save.mockResolvedValue(mockLog);

      const result = await repository.createLog(data);

      expect(result).toEqual(mockLog);
      expect(typeormRepo.create).toHaveBeenCalledWith(data);
      expect(typeormRepo.save).toHaveBeenCalledWith(mockLog);
    });
  });

  describe('getTotalRequestsByUserThisMonth', () => {
    it('should count successful requests for user in current month', async () => {
      typeormRepo.count.mockResolvedValue(42);

      const result = await repository.getTotalRequestsByUserThisMonth(1);

      expect(result).toBe(42);
      expect(typeormRepo.count).toHaveBeenCalled();
    });
  });
});
