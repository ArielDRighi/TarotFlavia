import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { CheckUserQuotaUseCase } from './check-user-quota.use-case';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { UserPlan } from '../../../users/entities/user.entity';

describe('CheckUserQuotaUseCase', () => {
  let useCase: CheckUserQuotaUseCase;
  let userRepo: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockUserRepo = {
      findById: jest.fn(),
      incrementAIRequestsMonth: jest.fn(),
      resetMonthlyAIRequests: jest.fn(),
      findUsersApproachingQuota: jest.fn(),
      updateQuotaWarning: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckUserQuotaUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    useCase = module.get<CheckUserQuotaUseCase>(CheckUserQuotaUseCase);
    userRepo = module.get(USER_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return true for PREMIUM users regardless of usage', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        plan: UserPlan.PREMIUM,
        aiRequestsUsedMonth: 1000,
      } as any;

      userRepo.findById.mockResolvedValue(user);

      const result = await useCase.execute(1);

      expect(result).toBe(true);
      expect(userRepo.findById).toHaveBeenCalledWith(1);
    });

    it('should return true for FREE users within quota', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        plan: UserPlan.FREE,
        aiRequestsUsedMonth: 50,
      } as any;

      userRepo.findById.mockResolvedValue(user);

      const result = await useCase.execute(1);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException for FREE users exceeding quota', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        plan: UserPlan.FREE,
        aiRequestsUsedMonth: 100,
      } as any;

      userRepo.findById.mockResolvedValue(user);

      await expect(useCase.execute(1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getQuotaInfo', () => {
    it('should return unlimited quota info for PREMIUM users', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        plan: UserPlan.PREMIUM,
        aiRequestsUsedMonth: 500,
      } as any;

      userRepo.findById.mockResolvedValue(user);

      const result = await useCase.getQuotaInfo(1);

      expect(result.quotaLimit).toBe(-1);
      expect(result.requestsRemaining).toBe(-1);
      expect(result.plan).toBe(UserPlan.PREMIUM);
    });

    it('should return correct quota info for FREE users', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        plan: UserPlan.FREE,
        aiRequestsUsedMonth: 30,
      } as any;

      userRepo.findById.mockResolvedValue(user);

      const result = await useCase.getQuotaInfo(1);

      expect(result.quotaLimit).toBe(100);
      expect(result.requestsUsed).toBe(30);
      expect(result.requestsRemaining).toBe(70);
      expect(result.percentageUsed).toBe(30);
      expect(result.plan).toBe(UserPlan.FREE);
    });
  });
});
