import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CheckSubscriptionStatusUseCase } from './check-subscription-status.use-case';
import {
  User,
  UserPlan,
  SubscriptionStatus,
} from '../../../users/entities/user.entity';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/repository.tokens';

describe('CheckSubscriptionStatusUseCase', () => {
  let useCase: CheckSubscriptionStatusUseCase;

  const mockUserRepo = {
    findById: jest.fn(),
  };

  const buildUser = (overrides: Partial<User> = {}): User => {
    const user = new User();
    user.id = 42;
    user.email = 'test@example.com';
    user.plan = UserPlan.FREE;
    user.subscriptionStatus = null as unknown as SubscriptionStatus;
    user.planExpiresAt = null as unknown as Date;
    user.mpPreapprovalId = null;
    return Object.assign(user, overrides);
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckSubscriptionStatusUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepo },
      ],
    }).compile();

    useCase = module.get<CheckSubscriptionStatusUseCase>(
      CheckSubscriptionStatusUseCase,
    );
  });

  describe('execute', () => {
    it('usuario free → retorna datos correctos', async () => {
      // Arrange
      const freeUser = buildUser({ plan: UserPlan.FREE });
      mockUserRepo.findById.mockResolvedValue(freeUser);

      // Act
      const result = await useCase.execute(42);

      // Assert
      expect(result).toEqual({
        plan: UserPlan.FREE,
        subscriptionStatus: null,
        planExpiresAt: null,
        mpPreapprovalId: null,
      });
    });

    it('usuario premium activo → retorna datos correctos', async () => {
      // Arrange
      const expiresAt = new Date('2026-04-30T00:00:00.000Z');
      const premiumUser = buildUser({
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        planExpiresAt: expiresAt,
        mpPreapprovalId: 'preapproval_abc123',
      });
      mockUserRepo.findById.mockResolvedValue(premiumUser);

      // Act
      const result = await useCase.execute(42);

      // Assert
      expect(result).toEqual({
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        planExpiresAt: expiresAt.toISOString(),
        mpPreapprovalId: 'preapproval_abc123',
      });
    });

    it('usuario premium cancelado → retorna subscriptionStatus=cancelled con plan premium', async () => {
      // Arrange
      const expiresAt = new Date('2026-04-30T00:00:00.000Z');
      const cancelledUser = buildUser({
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.CANCELLED,
        planExpiresAt: expiresAt,
        mpPreapprovalId: 'preapproval_abc123',
      });
      mockUserRepo.findById.mockResolvedValue(cancelledUser);

      // Act
      const result = await useCase.execute(42);

      // Assert
      expect(result.plan).toBe(UserPlan.PREMIUM);
      expect(result.subscriptionStatus).toBe(SubscriptionStatus.CANCELLED);
      expect(result.planExpiresAt).toBe(expiresAt.toISOString());
    });

    it('usuario con plan expired → retorna subscriptionStatus=expired', async () => {
      // Arrange
      const expiredUser = buildUser({
        plan: UserPlan.FREE,
        subscriptionStatus: SubscriptionStatus.EXPIRED,
        planExpiresAt: new Date('2025-01-01T00:00:00.000Z'),
        mpPreapprovalId: 'preapproval_old',
      });
      mockUserRepo.findById.mockResolvedValue(expiredUser);

      // Act
      const result = await useCase.execute(42);

      // Assert
      expect(result.subscriptionStatus).toBe(SubscriptionStatus.EXPIRED);
    });

    it('planExpiresAt null → retorna planExpiresAt como null', async () => {
      // Arrange
      const userNoExpiry = buildUser({
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        planExpiresAt: null as unknown as Date,
      });
      mockUserRepo.findById.mockResolvedValue(userNoExpiry);

      // Act
      const result = await useCase.execute(42);

      // Assert
      expect(result.planExpiresAt).toBeNull();
    });

    it('usuario no encontrado → lanza NotFoundException', async () => {
      // Arrange
      mockUserRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    });

    it('usuario no encontrado → mensaje de error en español', async () => {
      // Arrange
      mockUserRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(999)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });

    it('lee directamente de la DB (llama a findById con el userId correcto)', async () => {
      // Arrange
      const freeUser = buildUser({ id: 77 });
      mockUserRepo.findById.mockResolvedValue(freeUser);

      // Act
      await useCase.execute(77);

      // Assert
      expect(mockUserRepo.findById).toHaveBeenCalledWith(77);
    });
  });
});
