import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CheckUserQuotaUseCase } from './check-user-quota.use-case';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { UserPlan } from '../../../users/entities/user.entity';
import { User } from '../../../users/entities/user.entity';

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
      } as unknown as User;

      userRepo.findById.mockResolvedValue(user);

      const result = await useCase.execute(1);

      expect(result).toBe(true);
      expect(userRepo.findById).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException for FREE users (sin IA: cuota 0)', async () => {
      // T-FBK-006: Free NO consume IA. Incluso sin uso previo, el guard bloquea
      // toda IA para Free (aiQuota = 0).
      const user = {
        id: 1,
        email: 'test@example.com',
        plan: UserPlan.FREE,
        aiRequestsUsedMonth: 0,
      } as unknown as User;

      userRepo.findById.mockResolvedValue(user);

      await expect(useCase.execute(1)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getQuotaInfo', () => {
    it('should throw NotFoundException when user not found', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(useCase.getQuotaInfo(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return unlimited quota info for PREMIUM users', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        plan: UserPlan.PREMIUM,
        aiRequestsUsedMonth: 500,
      } as unknown as User;

      userRepo.findById.mockResolvedValue(user);

      const result = await useCase.getQuotaInfo(1);

      expect(result.quotaLimit).toBe(-1);
      expect(result.requestsRemaining).toBe(-1);
      expect(result.plan).toBe(UserPlan.PREMIUM);
    });

    it('should return zero-quota info for FREE users without division-by-zero', async () => {
      // T-FBK-006: Free tiene cuota de IA 0. getQuotaInfo debe devolver 0 sin
      // producir NaN/Infinity al calcular el porcentaje.
      const user = {
        id: 1,
        email: 'test@example.com',
        plan: UserPlan.FREE,
        aiRequestsUsedMonth: 0,
      } as unknown as User;

      userRepo.findById.mockResolvedValue(user);

      const result = await useCase.getQuotaInfo(1);

      expect(result.quotaLimit).toBe(0);
      expect(result.requestsUsed).toBe(0);
      expect(result.requestsRemaining).toBe(0);
      expect(result.percentageUsed).toBe(0);
      expect(Number.isFinite(result.percentageUsed)).toBe(true);
      expect(result.plan).toBe(UserPlan.FREE);
    });
  });
});
