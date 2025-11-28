import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UpdateUserPlanUseCase } from './update-user-plan.use-case';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { IRefreshTokenRepository } from '../../../auth/domain/interfaces/refresh-token-repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { REFRESH_TOKEN_REPOSITORY } from '../../../auth/domain/interfaces/repository.tokens';
import {
  User,
  UserRole,
  UserPlan,
  SubscriptionStatus,
} from '../../entities/user.entity';

describe('UpdateUserPlanUseCase', () => {
  let useCase: UpdateUserPlanUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const mockRefreshTokenRepository = {
      revokeAllUserTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserPlanUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: REFRESH_TOKEN_REPOSITORY,
          useValue: mockRefreshTokenRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserPlanUseCase>(UpdateUserPlanUseCase);
    userRepository = module.get(USER_REPOSITORY);
    refreshTokenRepository = module.get(REFRESH_TOKEN_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update user plan successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        roles: [UserRole.CONSUMER],
        plan: UserPlan.FREE,
      } as unknown as User;

      const updateDto = {
        plan: UserPlan.PREMIUM,
      };

      const updatedUser = {
        ...mockUser,
        plan: UserPlan.PREMIUM,
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(updatedUser);
      refreshTokenRepository.revokeAllUserTokens.mockResolvedValue();

      const result = await useCase.execute(1, updateDto);

      expect(mockUser.plan).toBe(UserPlan.PREMIUM);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(refreshTokenRepository.revokeAllUserTokens).toHaveBeenCalledWith(
        1,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should update all plan fields when provided', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        plan: UserPlan.FREE,
      } as unknown as User;

      const updateDto = {
        plan: UserPlan.PREMIUM,
        planStartedAt: new Date('2025-01-01'),
        planExpiresAt: new Date('2026-01-01'),
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        stripeCustomerId: 'cus_123456',
      };

      const updatedUser = { ...mockUser, ...updateDto } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(updatedUser);
      refreshTokenRepository.revokeAllUserTokens.mockResolvedValue();

      const result = await useCase.execute(1, updateDto);

      expect(mockUser.plan).toBe(UserPlan.PREMIUM);
      expect(mockUser.planStartedAt).toEqual(new Date('2025-01-01'));
      expect(mockUser.planExpiresAt).toEqual(new Date('2026-01-01'));
      expect(mockUser.subscriptionStatus).toBe(SubscriptionStatus.ACTIVE);
      expect(mockUser.stripeCustomerId).toBe('cus_123456');
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(999, { plan: UserPlan.PREMIUM }),
      ).rejects.toThrow(new NotFoundException('User with ID 999 not found'));

      expect(userRepository.save).not.toHaveBeenCalled();
      expect(refreshTokenRepository.revokeAllUserTokens).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on save error', async () => {
      const mockUser = {
        id: 1,
        plan: UserPlan.FREE,
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        useCase.execute(1, { plan: UserPlan.PREMIUM }),
      ).rejects.toThrow(InternalServerErrorException);

      expect(refreshTokenRepository.revokeAllUserTokens).not.toHaveBeenCalled();
    });

    it('should revoke refresh tokens even if save succeeds', async () => {
      const mockUser = {
        id: 1,
        plan: UserPlan.FREE,
      } as unknown as User;

      const updatedUser = {
        ...mockUser,
        plan: UserPlan.PREMIUM,
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(updatedUser);
      refreshTokenRepository.revokeAllUserTokens.mockResolvedValue();

      await useCase.execute(1, { plan: UserPlan.PREMIUM });

      expect(refreshTokenRepository.revokeAllUserTokens).toHaveBeenCalledWith(
        1,
      );
    });
  });
});
