import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  BadGatewayException,
  NotFoundException,
} from '@nestjs/common';
import { CancelSubscriptionUseCase } from './cancel-subscription.use-case';
import { MercadoPagoService } from '../../../payments/infrastructure/services/mercadopago.service';
import {
  User,
  UserPlan,
  SubscriptionStatus,
} from '../../../users/entities/user.entity';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/repository.tokens';

describe('CancelSubscriptionUseCase', () => {
  let useCase: CancelSubscriptionUseCase;

  const mockUserRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const mockMercadoPagoService: jest.Mocked<
    Pick<MercadoPagoService, 'cancelPreapproval'>
  > = {
    cancelPreapproval: jest.fn(),
  };

  const buildUser = (overrides: Partial<User> = {}): User => {
    const user = new User();
    user.id = 42;
    user.email = 'test@example.com';
    user.plan = UserPlan.PREMIUM;
    user.subscriptionStatus = SubscriptionStatus.ACTIVE;
    user.mpPreapprovalId = 'preapproval_active_123';
    user.planExpiresAt = new Date('2026-04-30T00:00:00.000Z');
    return Object.assign(user, overrides);
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelSubscriptionUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepo },
        { provide: MercadoPagoService, useValue: mockMercadoPagoService },
      ],
    }).compile();

    useCase = module.get<CancelSubscriptionUseCase>(CancelSubscriptionUseCase);
  });

  describe('execute', () => {
    it('cancelar suscripción activa → subscriptionStatus=cancelled, plan no cambia', async () => {
      // Arrange
      const activeUser = buildUser();
      mockUserRepo.findById.mockResolvedValue(activeUser);
      mockMercadoPagoService.cancelPreapproval.mockResolvedValue(undefined);
      mockUserRepo.save.mockResolvedValue({
        ...activeUser,
        subscriptionStatus: SubscriptionStatus.CANCELLED,
      });

      // Act
      const result = await useCase.execute(42);

      // Assert
      expect(result.message).toBeDefined();
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionStatus: SubscriptionStatus.CANCELLED,
          plan: UserPlan.PREMIUM,
        }),
      );
    });

    it('cancelar suscripción activa → retorna message y planExpiresAt', async () => {
      // Arrange
      const expiresAt = new Date('2026-04-30T00:00:00.000Z');
      const activeUser = buildUser({ planExpiresAt: expiresAt });
      mockUserRepo.findById.mockResolvedValue(activeUser);
      mockMercadoPagoService.cancelPreapproval.mockResolvedValue(undefined);
      mockUserRepo.save.mockResolvedValue({
        ...activeUser,
        subscriptionStatus: SubscriptionStatus.CANCELLED,
      });

      // Act
      const result = await useCase.execute(42);

      // Assert
      expect(result.planExpiresAt).toBe(expiresAt.toISOString());
      expect(result.message).toContain('cancelad');
    });

    it('cancelar suscripción activa → plan sigue siendo PREMIUM (no cambia a free)', async () => {
      // Arrange
      const activeUser = buildUser();
      mockUserRepo.findById.mockResolvedValue(activeUser);
      mockMercadoPagoService.cancelPreapproval.mockResolvedValue(undefined);
      mockUserRepo.save.mockResolvedValue({
        ...activeUser,
        subscriptionStatus: SubscriptionStatus.CANCELLED,
      });

      // Act
      await useCase.execute(42);

      // Assert
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          plan: UserPlan.PREMIUM,
        }),
      );
      expect(mockUserRepo.save).not.toHaveBeenCalledWith(
        expect.objectContaining({
          plan: UserPlan.FREE,
        }),
      );
    });

    it('cancelar suscripción activa → llama a cancelPreapproval con el mpPreapprovalId correcto', async () => {
      // Arrange
      const activeUser = buildUser({ mpPreapprovalId: 'preapproval_xyz' });
      mockUserRepo.findById.mockResolvedValue(activeUser);
      mockMercadoPagoService.cancelPreapproval.mockResolvedValue(undefined);
      mockUserRepo.save.mockResolvedValue({
        ...activeUser,
        subscriptionStatus: SubscriptionStatus.CANCELLED,
      });

      // Act
      await useCase.execute(42);

      // Assert
      expect(mockMercadoPagoService.cancelPreapproval).toHaveBeenCalledWith(
        'preapproval_xyz',
      );
    });

    it('usuario no encontrado → lanza NotFoundException', async () => {
      // Arrange
      mockUserRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
      expect(mockMercadoPagoService.cancelPreapproval).not.toHaveBeenCalled();
    });

    it('usuario no encontrado → mensaje de error en español', async () => {
      // Arrange
      mockUserRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(999)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });

    it('cancelar sin suscripción activa (mpPreapprovalId null) → lanza BadRequestException', async () => {
      // Arrange
      const userWithoutSub = buildUser({
        plan: UserPlan.FREE,
        subscriptionStatus: null as unknown as SubscriptionStatus,
        mpPreapprovalId: null,
      });
      mockUserRepo.findById.mockResolvedValue(userWithoutSub);

      // Act & Assert
      await expect(useCase.execute(42)).rejects.toThrow(BadRequestException);
      expect(mockMercadoPagoService.cancelPreapproval).not.toHaveBeenCalled();
    });

    it('cancelar sin suscripción activa → mensaje de error en español', async () => {
      // Arrange
      const userWithoutSub = buildUser({
        plan: UserPlan.FREE,
        subscriptionStatus: null as unknown as SubscriptionStatus,
        mpPreapprovalId: null,
      });
      mockUserRepo.findById.mockResolvedValue(userWithoutSub);

      // Act & Assert
      await expect(useCase.execute(42)).rejects.toThrow(
        'No tenés una suscripción activa',
      );
    });

    it('suscripción ya cancelada (subscriptionStatus=cancelled) → lanza BadRequestException', async () => {
      // Arrange
      const cancelledUser = buildUser({
        subscriptionStatus: SubscriptionStatus.CANCELLED,
      });
      mockUserRepo.findById.mockResolvedValue(cancelledUser);

      // Act & Assert
      await expect(useCase.execute(42)).rejects.toThrow(BadRequestException);
      expect(mockMercadoPagoService.cancelPreapproval).not.toHaveBeenCalled();
    });

    it('suscripción ya cancelada → mensaje de error en español', async () => {
      // Arrange
      const cancelledUser = buildUser({
        subscriptionStatus: SubscriptionStatus.CANCELLED,
      });
      mockUserRepo.findById.mockResolvedValue(cancelledUser);

      // Act & Assert
      await expect(useCase.execute(42)).rejects.toThrow(
        'La suscripción ya está cancelada',
      );
    });

    it('MP API falla al cancelar → lanza BadGatewayException con mensaje claro', async () => {
      // Arrange
      const activeUser = buildUser();
      mockUserRepo.findById.mockResolvedValue(activeUser);
      mockMercadoPagoService.cancelPreapproval.mockRejectedValue(
        new Error('MP timeout'),
      );

      // Act & Assert
      await expect(useCase.execute(42)).rejects.toThrow(BadGatewayException);
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('MP API falla → mensaje de error en español', async () => {
      // Arrange
      const activeUser = buildUser();
      mockUserRepo.findById.mockResolvedValue(activeUser);
      mockMercadoPagoService.cancelPreapproval.mockRejectedValue(
        new Error('connection error'),
      );

      // Act & Assert
      await expect(useCase.execute(42)).rejects.toThrow(
        'Error al cancelar la suscripción en Mercado Pago',
      );
    });

    it('planExpiresAt null → retorna planExpiresAt como null en la respuesta', async () => {
      // Arrange
      const activeUser = buildUser({ planExpiresAt: null as unknown as Date });
      mockUserRepo.findById.mockResolvedValue(activeUser);
      mockMercadoPagoService.cancelPreapproval.mockResolvedValue(undefined);
      mockUserRepo.save.mockResolvedValue({
        ...activeUser,
        subscriptionStatus: SubscriptionStatus.CANCELLED,
      });

      // Act
      const result = await useCase.execute(42);

      // Assert
      expect(result.planExpiresAt).toBeNull();
    });
  });
});
