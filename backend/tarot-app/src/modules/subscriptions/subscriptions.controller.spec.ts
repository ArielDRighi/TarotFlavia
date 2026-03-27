import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import {
  BadRequestException,
  BadGatewayException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  SubscriptionType,
  SubscriptionStatus,
  UserTarotistaSubscription,
} from '../tarotistas/entities/user-tarotista-subscription.entity';
import { CreatePreapprovalUseCase } from './application/use-cases/create-preapproval.use-case';
import { CancelSubscriptionUseCase } from './application/use-cases/cancel-subscription.use-case';
import { CheckSubscriptionStatusUseCase } from './application/use-cases/check-subscription-status.use-case';
import {
  UserPlan,
  SubscriptionStatus as UserSubscriptionStatus,
} from '../users/entities/user.entity';

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;
  let service: SubscriptionsService;
  let cancelSubscriptionUseCase: CancelSubscriptionUseCase;
  let checkSubscriptionStatusUseCase: CheckSubscriptionStatusUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionsController],
      providers: [
        {
          provide: SubscriptionsService,
          useValue: {
            setFavoriteTarotista: jest.fn(),
            getSubscriptionInfo: jest.fn(),
            enableAllAccessMode: jest.fn(),
            resolveTarotistaForReading: jest.fn(),
          },
        },
        {
          provide: CreatePreapprovalUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: CancelSubscriptionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: CheckSubscriptionStatusUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SubscriptionsController>(SubscriptionsController);
    service = module.get<SubscriptionsService>(SubscriptionsService);
    cancelSubscriptionUseCase = module.get<CancelSubscriptionUseCase>(
      CancelSubscriptionUseCase,
    );
    checkSubscriptionStatusUseCase = module.get<CheckSubscriptionStatusUseCase>(
      CheckSubscriptionStatusUseCase,
    );
  });

  describe('setFavoriteTarotista', () => {
    it('debería establecer tarotista favorito para usuario autenticado', async () => {
      const userId = 1;
      const tarotistaId = 2;
      const req = { user: { userId } };

      const mockSubscription = {
        id: 1,
        userId,
        tarotistaId,
        subscriptionType: SubscriptionType.FAVORITE,
        status: SubscriptionStatus.ACTIVE,
        canChangeAt: new Date(),
      };

      jest
        .spyOn(service, 'setFavoriteTarotista')
        .mockResolvedValue(
          mockSubscription as unknown as UserTarotistaSubscription,
        );

      const result = await controller.setFavoriteTarotista(req, {
        tarotistaId,
      });

      expect(result).toEqual({
        message: 'Tarotista favorito establecido correctamente',
        subscription: mockSubscription,
      });
      expect(service.setFavoriteTarotista).toHaveBeenCalledWith(
        userId,
        tarotistaId,
      );
    });

    it('debería lanzar BadRequestException si intenta cambiar antes del cooldown', async () => {
      const userId = 1;
      const tarotistaId = 3;
      const req = { user: { userId } };

      jest
        .spyOn(service, 'setFavoriteTarotista')
        .mockRejectedValue(
          new BadRequestException(
            'No puedes cambiar de tarotista favorito aún',
          ),
        );

      await expect(
        controller.setFavoriteTarotista(req, { tarotistaId }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si tarotista no existe', async () => {
      const userId = 1;
      const tarotistaId = 999;
      const req = { user: { userId } };

      jest
        .spyOn(service, 'setFavoriteTarotista')
        .mockRejectedValue(new NotFoundException('Tarotista no encontrado'));

      await expect(
        controller.setFavoriteTarotista(req, { tarotistaId }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMySubscription', () => {
    it('debería retornar información de suscripción del usuario', async () => {
      const userId = 1;
      const req = { user: { userId } };

      const mockInfo = {
        subscriptionType: SubscriptionType.FAVORITE,
        tarotistaId: 2,
        tarotistaNombre: 'Flavia',
        canChange: false,
        canChangeAt: new Date(),
        changeCount: 1,
      };

      jest.spyOn(service, 'getSubscriptionInfo').mockResolvedValue(mockInfo);

      const result = await controller.getMySubscription(req);

      expect(result).toEqual(mockInfo);
      expect(service.getSubscriptionInfo).toHaveBeenCalledWith(userId);
    });

    it('debería retornar null si usuario no tiene suscripción', async () => {
      const userId = 1;
      const req = { user: { userId } };

      jest.spyOn(service, 'getSubscriptionInfo').mockResolvedValue(null);

      const result = await controller.getMySubscription(req);

      expect(result).toBeNull();
    });
  });

  describe('enableAllAccess', () => {
    it('debería activar modo all-access para usuario PREMIUM', async () => {
      const userId = 1;
      const req = { user: { userId } };

      const mockSubscription = {
        id: 1,
        userId,
        tarotistaId: null,
        subscriptionType: SubscriptionType.PREMIUM_ALL_ACCESS,
        status: SubscriptionStatus.ACTIVE,
      };

      jest
        .spyOn(service, 'enableAllAccessMode')
        .mockResolvedValue(
          mockSubscription as unknown as UserTarotistaSubscription,
        );

      const result = await controller.enableAllAccess(req);

      expect(result).toEqual({
        message: 'Modo all-access activado correctamente',
        subscription: mockSubscription,
      });
      expect(service.enableAllAccessMode).toHaveBeenCalledWith(userId);
    });

    it('debería lanzar ForbiddenException si usuario es FREE', async () => {
      const userId = 1;
      const req = { user: { userId } };

      jest
        .spyOn(service, 'enableAllAccessMode')
        .mockRejectedValue(
          new ForbiddenException(
            'Solo usuarios PREMIUM pueden activar modo all-access',
          ),
        );

      await expect(controller.enableAllAccess(req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('cancelSubscription', () => {
    it('debería cancelar suscripción activa y retornar message y planExpiresAt', async () => {
      // Arrange
      const userId = 1;
      const req = { user: { userId } };
      const planExpiresAt = new Date('2026-04-30T00:00:00.000Z').toISOString();
      const mockResponse = {
        message: 'Suscripción cancelada exitosamente',
        planExpiresAt,
      };

      jest
        .spyOn(cancelSubscriptionUseCase, 'execute')
        .mockResolvedValue(mockResponse);

      // Act
      const result = await controller.cancelSubscription(req);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(cancelSubscriptionUseCase.execute).toHaveBeenCalledWith(userId);
    });

    it('debería lanzar BadRequestException si no hay suscripción activa', async () => {
      // Arrange
      const userId = 1;
      const req = { user: { userId } };

      jest
        .spyOn(cancelSubscriptionUseCase, 'execute')
        .mockRejectedValue(
          new BadRequestException('No tenés una suscripción activa'),
        );

      // Act & Assert
      await expect(controller.cancelSubscription(req)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar BadRequestException si suscripción ya está cancelada', async () => {
      // Arrange
      const userId = 1;
      const req = { user: { userId } };

      jest
        .spyOn(cancelSubscriptionUseCase, 'execute')
        .mockRejectedValue(
          new BadRequestException('La suscripción ya está cancelada'),
        );

      // Act & Assert
      await expect(controller.cancelSubscription(req)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar NotFoundException si usuario no existe', async () => {
      // Arrange
      const userId = 999;
      const req = { user: { userId } };

      jest
        .spyOn(cancelSubscriptionUseCase, 'execute')
        .mockRejectedValue(new NotFoundException('Usuario no encontrado'));

      // Act & Assert
      await expect(controller.cancelSubscription(req)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar BadGatewayException si MP API falla', async () => {
      // Arrange
      const userId = 1;
      const req = { user: { userId } };

      jest
        .spyOn(cancelSubscriptionUseCase, 'execute')
        .mockRejectedValue(
          new BadGatewayException(
            'Error al cancelar la suscripción en Mercado Pago',
          ),
        );

      // Act & Assert
      await expect(controller.cancelSubscription(req)).rejects.toThrow(
        BadGatewayException,
      );
    });
  });

  describe('getSubscriptionStatus', () => {
    it('debería retornar estado de suscripción para usuario free', async () => {
      // Arrange
      const userId = 1;
      const req = { user: { userId } };
      const mockStatus = {
        plan: UserPlan.FREE,
        subscriptionStatus: null,
        planExpiresAt: null,
        mpPreapprovalId: null,
      };

      jest
        .spyOn(checkSubscriptionStatusUseCase, 'execute')
        .mockResolvedValue(mockStatus);

      // Act
      const result = await controller.getSubscriptionStatus(req);

      // Assert
      expect(result).toEqual(mockStatus);
      expect(checkSubscriptionStatusUseCase.execute).toHaveBeenCalledWith(
        userId,
      );
    });

    it('debería retornar estado premium activo', async () => {
      // Arrange
      const userId = 1;
      const req = { user: { userId } };
      const planExpiresAt = new Date('2026-04-30T00:00:00.000Z').toISOString();
      const mockStatus = {
        plan: UserPlan.PREMIUM,
        subscriptionStatus: UserSubscriptionStatus.ACTIVE,
        planExpiresAt,
        mpPreapprovalId: 'preapproval_abc123',
      };

      jest
        .spyOn(checkSubscriptionStatusUseCase, 'execute')
        .mockResolvedValue(mockStatus);

      // Act
      const result = await controller.getSubscriptionStatus(req);

      // Assert
      expect(result).toEqual(mockStatus);
    });

    it('debería retornar estado premium cancelado', async () => {
      // Arrange
      const userId = 1;
      const req = { user: { userId } };
      const planExpiresAt = new Date('2026-04-30T00:00:00.000Z').toISOString();
      const mockStatus = {
        plan: UserPlan.PREMIUM,
        subscriptionStatus: UserSubscriptionStatus.CANCELLED,
        planExpiresAt,
        mpPreapprovalId: 'preapproval_abc123',
      };

      jest
        .spyOn(checkSubscriptionStatusUseCase, 'execute')
        .mockResolvedValue(mockStatus);

      // Act
      const result = await controller.getSubscriptionStatus(req);

      // Assert
      expect(result.subscriptionStatus).toBe(UserSubscriptionStatus.CANCELLED);
    });

    it('debería lanzar NotFoundException si usuario no existe', async () => {
      // Arrange
      const userId = 999;
      const req = { user: { userId } };

      jest
        .spyOn(checkSubscriptionStatusUseCase, 'execute')
        .mockRejectedValue(new NotFoundException('Usuario no encontrado'));

      // Act & Assert
      await expect(controller.getSubscriptionStatus(req)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
