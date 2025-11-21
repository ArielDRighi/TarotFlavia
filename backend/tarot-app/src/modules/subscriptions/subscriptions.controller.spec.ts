import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  SubscriptionType,
  SubscriptionStatus,
} from '../tarotistas/entities/user-tarotista-subscription.entity';

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;
  let service: SubscriptionsService;

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
      ],
    }).compile();

    controller = module.get<SubscriptionsController>(SubscriptionsController);
    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  describe('setFavoriteTarotista', () => {
    it('debería establecer tarotista favorito para usuario autenticado', async () => {
      const userId = 1;
      const tarotistaId = 2;
      const req = { user: { id: userId } };

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
        .mockResolvedValue(mockSubscription as any);

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
      const req = { user: { id: userId } };

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
      const req = { user: { id: userId } };

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
      const req = { user: { id: userId } };

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
      const req = { user: { id: userId } };

      jest.spyOn(service, 'getSubscriptionInfo').mockResolvedValue(null);

      const result = await controller.getMySubscription(req);

      expect(result).toBeNull();
    });
  });

  describe('enableAllAccess', () => {
    it('debería activar modo all-access para usuario PREMIUM', async () => {
      const userId = 1;
      const req = { user: { id: userId } };

      const mockSubscription = {
        id: 1,
        userId,
        tarotistaId: null,
        subscriptionType: SubscriptionType.PREMIUM_ALL_ACCESS,
        status: SubscriptionStatus.ACTIVE,
      };

      jest
        .spyOn(service, 'enableAllAccessMode')
        .mockResolvedValue(mockSubscription as any);

      const result = await controller.enableAllAccess(req);

      expect(result).toEqual({
        message: 'Modo all-access activado correctamente',
        subscription: mockSubscription,
      });
      expect(service.enableAllAccessMode).toHaveBeenCalledWith(userId);
    });

    it('debería lanzar ForbiddenException si usuario es FREE', async () => {
      const userId = 1;
      const req = { user: { id: userId } };

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
});
