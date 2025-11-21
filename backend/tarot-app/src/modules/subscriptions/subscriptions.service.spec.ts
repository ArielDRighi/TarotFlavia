import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import {
  UserTarotistaSubscription,
  SubscriptionType,
  SubscriptionStatus,
} from '../tarotistas/entities/user-tarotista-subscription.entity';
import { User, UserPlan } from '../users/entities/user.entity';
import { Tarotista } from '../tarotistas/entities/tarotista.entity';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let subscriptionRepo: Repository<UserTarotistaSubscription>;
  let userRepo: Repository<User>;
  let tarotistaRepo: Repository<Tarotista>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: getRepositoryToken(UserTarotistaSubscription),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Tarotista),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    subscriptionRepo = module.get<Repository<UserTarotistaSubscription>>(
      getRepositoryToken(UserTarotistaSubscription),
    );
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    tarotistaRepo = module.get<Repository<Tarotista>>(
      getRepositoryToken(Tarotista),
    );
  });

  describe('setFavoriteTarotista', () => {
    it('debería permitir a usuario FREE elegir su primer tarotista favorito', async () => {
      const userId = 1;
      const tarotistaId = 2;
      const user: Partial<User> = {
        id: userId,
        plan: UserPlan.FREE,
      };
      const tarotista: Partial<Tarotista> = {
        id: tarotistaId,
        isActive: true,
      };

      jest.spyOn(userRepo, 'findOne').mockResolvedValue(user as User);
      jest
        .spyOn(tarotistaRepo, 'findOne')
        .mockResolvedValue(tarotista as Tarotista);
      jest.spyOn(subscriptionRepo, 'findOne').mockResolvedValue(null); // No tiene favorito actual

      const newSubscription = {
        id: 1,
        userId,
        tarotistaId,
        subscriptionType: SubscriptionType.FAVORITE,
        status: SubscriptionStatus.ACTIVE,
        startedAt: new Date(),
        canChangeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        changeCount: 0,
      };

      jest
        .spyOn(subscriptionRepo, 'create')
        .mockReturnValue(newSubscription as any);
      jest
        .spyOn(subscriptionRepo, 'save')
        .mockResolvedValue(newSubscription as any);

      const result = await service.setFavoriteTarotista(userId, tarotistaId);

      expect(result).toBeDefined();
      expect(result.tarotistaId).toBe(tarotistaId);
      expect(result.subscriptionType).toBe(SubscriptionType.FAVORITE);
      expect(result.canChangeAt).toBeDefined();
    });

    it('debería lanzar BadRequestException si usuario FREE intenta cambiar antes del cooldown', async () => {
      const userId = 1;
      const newTarotistaId = 3;
      const user: Partial<User> = {
        id: userId,
        plan: UserPlan.FREE,
      };

      const currentSubscription: Partial<UserTarotistaSubscription> = {
        id: 1,
        userId,
        tarotistaId: 2,
        subscriptionType: SubscriptionType.FAVORITE,
        status: SubscriptionStatus.ACTIVE,
        canChangeAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Faltan 10 días
        changeCount: 1,
      };

      jest.spyOn(userRepo, 'findOne').mockResolvedValue(user as User);
      jest
        .spyOn(subscriptionRepo, 'findOne')
        .mockResolvedValue(currentSubscription as UserTarotistaSubscription);

      await expect(
        service.setFavoriteTarotista(userId, newTarotistaId),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería permitir a usuario FREE cambiar favorito después del cooldown de 30 días', async () => {
      const userId = 1;
      const newTarotistaId = 3;
      const user: Partial<User> = {
        id: userId,
        plan: UserPlan.FREE,
      };
      const newTarotista: Partial<Tarotista> = {
        id: newTarotistaId,
        isActive: true,
      };

      const currentSubscription: Partial<UserTarotistaSubscription> = {
        id: 1,
        userId,
        tarotistaId: 2,
        subscriptionType: SubscriptionType.FAVORITE,
        status: SubscriptionStatus.ACTIVE,
        canChangeAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hace 1 día (ya pasó cooldown)
        changeCount: 1,
      };

      jest.spyOn(userRepo, 'findOne').mockResolvedValue(user as User);
      jest
        .spyOn(tarotistaRepo, 'findOne')
        .mockResolvedValue(newTarotista as Tarotista);
      jest
        .spyOn(subscriptionRepo, 'findOne')
        .mockResolvedValue(currentSubscription as UserTarotistaSubscription);
      jest.spyOn(subscriptionRepo, 'save').mockResolvedValue({
        ...currentSubscription,
        tarotistaId: newTarotistaId,
        canChangeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        changeCount: 2,
      } as any);

      const result = await service.setFavoriteTarotista(userId, newTarotistaId);

      expect(result.tarotistaId).toBe(newTarotistaId);
      expect(result.changeCount).toBe(2);
    });

    it('debería permitir a usuario PREMIUM cambiar favorito sin cooldown', async () => {
      const userId = 1;
      const newTarotistaId = 3;
      const user: Partial<User> = {
        id: userId,
        plan: UserPlan.PREMIUM,
      };
      const newTarotista: Partial<Tarotista> = {
        id: newTarotistaId,
        isActive: true,
      };

      const currentSubscription: Partial<UserTarotistaSubscription> = {
        id: 1,
        userId,
        tarotistaId: 2,
        subscriptionType: SubscriptionType.PREMIUM_INDIVIDUAL,
        status: SubscriptionStatus.ACTIVE,
        canChangeAt: null, // PREMIUM no tiene cooldown
        changeCount: 5,
      };

      jest.spyOn(userRepo, 'findOne').mockResolvedValue(user as User);
      jest
        .spyOn(tarotistaRepo, 'findOne')
        .mockResolvedValue(newTarotista as Tarotista);
      jest
        .spyOn(subscriptionRepo, 'findOne')
        .mockResolvedValue(currentSubscription as UserTarotistaSubscription);
      jest.spyOn(subscriptionRepo, 'save').mockResolvedValue({
        ...currentSubscription,
        tarotistaId: newTarotistaId,
        changeCount: 6,
      } as any);

      const result = await service.setFavoriteTarotista(userId, newTarotistaId);

      expect(result.tarotistaId).toBe(newTarotistaId);
      expect(result.changeCount).toBe(6);
    });

    it('debería lanzar NotFoundException si tarotista no existe', async () => {
      const userId = 1;
      const tarotistaId = 999;
      const user: Partial<User> = {
        id: userId,
        plan: UserPlan.FREE,
      };

      jest.spyOn(userRepo, 'findOne').mockResolvedValue(user as User);
      jest.spyOn(tarotistaRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(subscriptionRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.setFavoriteTarotista(userId, tarotistaId),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException si tarotista está inactivo', async () => {
      const userId = 1;
      const tarotistaId = 2;
      const user: Partial<User> = {
        id: userId,
        plan: UserPlan.FREE,
      };
      const tarotista: Partial<Tarotista> = {
        id: tarotistaId,
        isActive: false, // INACTIVO
      };

      jest.spyOn(userRepo, 'findOne').mockResolvedValue(user as User);
      jest
        .spyOn(tarotistaRepo, 'findOne')
        .mockResolvedValue(tarotista as Tarotista);
      jest.spyOn(subscriptionRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.setFavoriteTarotista(userId, tarotistaId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resolveTarotistaForReading', () => {
    it('debería retornar tarotista favorito de usuario FREE', async () => {
      const userId = 1;
      const tarotistaId = 2;

      const subscription: Partial<UserTarotistaSubscription> = {
        id: 1,
        userId,
        tarotistaId,
        subscriptionType: SubscriptionType.FAVORITE,
        status: SubscriptionStatus.ACTIVE,
      };

      jest
        .spyOn(subscriptionRepo, 'findOne')
        .mockResolvedValue(subscription as UserTarotistaSubscription);

      const result = await service.resolveTarotistaForReading(userId);

      expect(result).toBe(tarotistaId);
    });

    it('debería retornar tarotista específico de usuario PREMIUM individual', async () => {
      const userId = 1;
      const tarotistaId = 3;

      const subscription: Partial<UserTarotistaSubscription> = {
        id: 1,
        userId,
        tarotistaId,
        subscriptionType: SubscriptionType.PREMIUM_INDIVIDUAL,
        status: SubscriptionStatus.ACTIVE,
      };

      jest
        .spyOn(subscriptionRepo, 'findOne')
        .mockResolvedValue(subscription as UserTarotistaSubscription);

      const result = await service.resolveTarotistaForReading(userId);

      expect(result).toBe(tarotistaId);
    });

    it('debería retornar tarotista aleatorio para PREMIUM all-access', async () => {
      const userId = 1;

      const subscription: Partial<UserTarotistaSubscription> = {
        id: 1,
        userId,
        tarotistaId: null, // All-access
        subscriptionType: SubscriptionType.PREMIUM_ALL_ACCESS,
        status: SubscriptionStatus.ACTIVE,
      };

      const tarotistas: Partial<Tarotista>[] = [
        { id: 1, isActive: true },
        { id: 2, isActive: true },
        { id: 3, isActive: true },
      ];

      jest
        .spyOn(subscriptionRepo, 'findOne')
        .mockResolvedValue(subscription as UserTarotistaSubscription);
      jest
        .spyOn(tarotistaRepo, 'find')
        .mockResolvedValue(tarotistas as Tarotista[]);

      const result = await service.resolveTarotistaForReading(userId);

      expect(result).toBeDefined();
      expect([1, 2, 3]).toContain(result);
    });

    it('debería retornar ID de Flavia (1) si usuario no tiene suscripción', async () => {
      const userId = 1;
      const FLAVIA_ID = 1;

      jest.spyOn(subscriptionRepo, 'findOne').mockResolvedValue(null);

      const result = await service.resolveTarotistaForReading(userId);

      expect(result).toBe(FLAVIA_ID);
    });

    it('debería lanzar error si all-access pero no hay tarotistas activos', async () => {
      const userId = 1;

      const subscription: Partial<UserTarotistaSubscription> = {
        id: 1,
        userId,
        tarotistaId: null,
        subscriptionType: SubscriptionType.PREMIUM_ALL_ACCESS,
        status: SubscriptionStatus.ACTIVE,
      };

      jest
        .spyOn(subscriptionRepo, 'findOne')
        .mockResolvedValue(subscription as UserTarotistaSubscription);
      jest.spyOn(tarotistaRepo, 'find').mockResolvedValue([]); // Sin tarotistas activos

      await expect(service.resolveTarotistaForReading(userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getSubscriptionInfo', () => {
    it('debería retornar información de suscripción FREE con cooldown', async () => {
      const userId = 1;
      const tarotistaId = 2;
      const canChangeAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

      const subscription: Partial<UserTarotistaSubscription> = {
        id: 1,
        userId,
        tarotistaId,
        subscriptionType: SubscriptionType.FAVORITE,
        status: SubscriptionStatus.ACTIVE,
        canChangeAt,
        changeCount: 1,
        tarotista: {
          id: tarotistaId,
          nombrePublico: 'Tarotista Test',
        } as Tarotista,
      };

      jest
        .spyOn(subscriptionRepo, 'findOne')
        .mockResolvedValue(subscription as UserTarotistaSubscription);

      const result = await service.getSubscriptionInfo(userId);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.tarotistaId).toBe(tarotistaId);
      expect(result!.tarotistaNombre).toBe('Tarotista Test');
      expect(result!.canChange).toBe(false); // Todavía no puede cambiar
      expect(result!.canChangeAt).toEqual(canChangeAt);
    });

    it('debería retornar canChange=true si ya pasó el cooldown', async () => {
      const userId = 1;
      const canChangeAt = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // Ayer

      const subscription: Partial<UserTarotistaSubscription> = {
        id: 1,
        userId,
        tarotistaId: 2,
        subscriptionType: SubscriptionType.FAVORITE,
        status: SubscriptionStatus.ACTIVE,
        canChangeAt,
        changeCount: 1,
        tarotista: {
          id: 2,
          nombrePublico: 'Tarotista Test',
        } as Tarotista,
      };

      jest
        .spyOn(subscriptionRepo, 'findOne')
        .mockResolvedValue(subscription as UserTarotistaSubscription);

      const result = await service.getSubscriptionInfo(userId);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.canChange).toBe(true);
    });

    it('debería retornar información de PREMIUM all-access', async () => {
      const userId = 1;

      const subscription: Partial<UserTarotistaSubscription> = {
        id: 1,
        userId,
        tarotistaId: null,
        subscriptionType: SubscriptionType.PREMIUM_ALL_ACCESS,
        status: SubscriptionStatus.ACTIVE,
        canChangeAt: null,
        changeCount: 0,
      };

      jest
        .spyOn(subscriptionRepo, 'findOne')
        .mockResolvedValue(subscription as UserTarotistaSubscription);

      const result = await service.getSubscriptionInfo(userId);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.subscriptionType).toBe(
        SubscriptionType.PREMIUM_ALL_ACCESS,
      );
      expect(result!.tarotistaId).toBeNull();
      expect(result!.canChange).toBe(true); // PREMIUM siempre puede cambiar
    });

    it('debería retornar null si usuario no tiene suscripción', async () => {
      const userId = 1;

      jest.spyOn(subscriptionRepo, 'findOne').mockResolvedValue(null);

      const result = await service.getSubscriptionInfo(userId);

      expect(result).toBeNull();
    });
  });

  describe('enableAllAccessMode', () => {
    it('debería permitir a usuario PREMIUM activar modo all-access', async () => {
      const userId = 1;
      const user: Partial<User> = {
        id: userId,
        plan: UserPlan.PREMIUM,
      };

      const currentSubscription: Partial<UserTarotistaSubscription> = {
        id: 1,
        userId,
        tarotistaId: 2, // Tiene individual
        subscriptionType: SubscriptionType.PREMIUM_INDIVIDUAL,
        status: SubscriptionStatus.ACTIVE,
      };

      const updatedSubscription = {
        ...currentSubscription,
        tarotistaId: null,
        subscriptionType: SubscriptionType.PREMIUM_ALL_ACCESS,
      };

      jest.spyOn(userRepo, 'findOne').mockResolvedValue(user as User);
      jest
        .spyOn(subscriptionRepo, 'findOne')
        .mockResolvedValue(currentSubscription as UserTarotistaSubscription);
      jest
        .spyOn(subscriptionRepo, 'save')
        .mockResolvedValue(updatedSubscription as UserTarotistaSubscription);

      const result = await service.enableAllAccessMode(userId);

      expect(result.subscriptionType).toBe(SubscriptionType.PREMIUM_ALL_ACCESS);
      expect(result.tarotistaId).toBeNull();
    });

    it('debería lanzar ForbiddenException si usuario es FREE', async () => {
      const userId = 1;
      const user: Partial<User> = {
        id: userId,
        plan: UserPlan.FREE,
      };

      jest.spyOn(userRepo, 'findOne').mockResolvedValue(user as User);

      await expect(service.enableAllAccessMode(userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
