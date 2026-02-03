import { Test, TestingModule } from '@nestjs/testing';
import { SacredEventNotificationCronService } from './sacred-event-notification-cron.service';
import { NotificationsService } from './notifications.service';
import { Repository } from 'typeorm';
import {
  User,
  UserPlan,
  SubscriptionStatus,
} from '../../../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationType } from '../../entities/user-notification.entity';
import { Hemisphere } from '../../../users/enums/hemisphere.enum';

describe('SacredEventNotificationCronService', () => {
  let service: SacredEventNotificationCronService;
  let notificationsService: jest.Mocked<NotificationsService>;
  let _userRepository: jest.Mocked<Repository<User>>;

  const mockNotificationsService = {
    createNotification: jest.fn(),
  };

  const mockUserRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SacredEventNotificationCronService,
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<SacredEventNotificationCronService>(
      SacredEventNotificationCronService,
    );
    notificationsService = module.get(NotificationsService);
    _userRepository = module.get(getRepositoryToken(User));

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPremiumUsers', () => {
    it('should retrieve only premium users with active subscriptions', async () => {
      const mockUsers: Partial<User>[] = [
        {
          id: 1,
          email: 'premium1@test.com',
          plan: UserPlan.PREMIUM,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          hemisphere: Hemisphere.NORTH,
          planExpiresAt: new Date('2099-12-31'),
        },
        {
          id: 2,
          email: 'premium2@test.com',
          plan: UserPlan.PREMIUM,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          hemisphere: Hemisphere.SOUTH,
          planExpiresAt: new Date('2099-12-31'),
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers as User[]);

      const result = await service['getPremiumUsers']();

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: {
          plan: UserPlan.PREMIUM,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
        },
        select: ['id', 'email', 'hemisphere'],
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
    });

    it('should return empty array when no premium users exist', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service['getPremiumUsers']();

      expect(result).toEqual([]);
    });
  });

  describe('createNotificationForEvent', () => {
    it('should create notification for sacred event with correct data', async () => {
      const userId = 1;
      const event = {
        name: 'Luna Llena',
        date: '2024-01-15',
        description: 'Luna llena en Cáncer',
        hemisphere: Hemisphere.NORTH,
      };

      await service['createNotificationForEvent'](userId, event, false);

      expect(notificationsService.createNotification).toHaveBeenCalledWith(
        userId,
        NotificationType.SACRED_EVENT,
        'Evento Sagrado Hoy: Luna Llena',
        'Luna llena en Cáncer',
        {
          eventName: 'Luna Llena',
          eventDate: '2024-01-15',
          hemisphere: Hemisphere.NORTH,
        },
        '/calendar',
      );
    });

    it('should create reminder notification with correct type', async () => {
      const userId = 2;
      const event = {
        name: 'Solsticio de Verano',
        date: '2024-06-21',
        description: 'Día más largo del año',
        hemisphere: Hemisphere.NORTH,
      };

      await service['createNotificationForEvent'](userId, event, true);

      expect(notificationsService.createNotification).toHaveBeenCalledWith(
        userId,
        NotificationType.SACRED_EVENT_REMINDER,
        'Recordatorio: Solsticio de Verano mañana',
        'Día más largo del año',
        {
          eventName: 'Solsticio de Verano',
          eventDate: '2024-06-21',
          hemisphere: Hemisphere.NORTH,
        },
        '/calendar',
      );
    });
  });

  describe('processUserNotifications (without CalendarService)', () => {
    it('should skip processing when CalendarService is not available', () => {
      const mockUser: Partial<User> = {
        id: 1,
        email: 'premium@test.com',
        hemisphere: Hemisphere.NORTH,
      };

      // Este test verifica que el método no falla cuando CalendarService no existe
      service['processUserNotifications'](mockUser as User);

      // No debe crear notificaciones si CalendarService no existe
      expect(notificationsService.createNotification).not.toHaveBeenCalled();
    });
  });

  describe('handleDailySacredEventNotifications', () => {
    it('should log when cron job starts', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const loggerSpy = jest.spyOn(service['logger'], 'log');

      await service.handleDailySacredEventNotifications();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Iniciando cron job de notificaciones de eventos sagrados',
        ),
      );
    });

    it('should handle errors gracefully without throwing', async () => {
      mockUserRepository.find.mockRejectedValue(new Error('Database error'));

      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      // Should not throw
      await expect(
        service.handleDailySacredEventNotifications(),
      ).resolves.not.toThrow();

      expect(loggerErrorSpy).toHaveBeenCalled();
    });

    it('should process all premium users sequentially', async () => {
      const mockUsers: Partial<User>[] = [
        {
          id: 1,
          email: 'user1@test.com',
          hemisphere: Hemisphere.NORTH,
          plan: UserPlan.PREMIUM,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
        },
        {
          id: 2,
          email: 'user2@test.com',
          hemisphere: Hemisphere.SOUTH,
          plan: UserPlan.PREMIUM,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers as User[]);

      await service.handleDailySacredEventNotifications();

      expect(mockUserRepository.find).toHaveBeenCalled();
      // Como CalendarService no existe, no se crean notificaciones aún
      expect(notificationsService.createNotification).not.toHaveBeenCalled();
    });
  });
});
