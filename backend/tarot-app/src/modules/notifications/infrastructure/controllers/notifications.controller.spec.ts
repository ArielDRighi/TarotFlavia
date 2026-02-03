import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '../../application/services/notifications.service';
import { NotificationType } from '../../entities/user-notification.entity';
import { User } from '../../../users/entities/user.entity';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockNotificationsService = {
    getUserNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  const mockUser: Partial<User> = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNotifications', () => {
    it('should return all notifications for the user', async () => {
      const mockNotifications = [
        {
          id: 1,
          userId: 1,
          type: NotificationType.SACRED_EVENT,
          title: 'Luna Nueva',
          message: 'Test',
          data: null,
          actionUrl: null,
          read: false,
          readAt: null,
          createdAt: new Date(),
        },
      ];

      mockNotificationsService.getUserNotifications.mockResolvedValue(
        mockNotifications,
      );

      const result = await controller.getNotifications(mockUser as User);

      expect(service.getUserNotifications).toHaveBeenCalledWith(1, false);
      expect(result).toEqual(mockNotifications);
    });

    it('should return only unread notifications when unreadOnly is true', async () => {
      const mockNotifications = [
        {
          id: 1,
          userId: 1,
          type: NotificationType.SACRED_EVENT,
          title: 'Luna Nueva',
          message: 'Test',
          data: null,
          actionUrl: null,
          read: false,
          readAt: null,
          createdAt: new Date(),
        },
      ];

      mockNotificationsService.getUserNotifications.mockResolvedValue(
        mockNotifications,
      );

      const result = await controller.getNotifications(mockUser as User, true);

      expect(service.getUserNotifications).toHaveBeenCalledWith(1, true);
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notifications count', async () => {
      const count = 5;
      mockNotificationsService.getUnreadCount.mockResolvedValue(count);

      const result = await controller.getUnreadCount(mockUser as User);

      expect(service.getUnreadCount).toHaveBeenCalledWith(1);
      expect(result).toEqual({ count });
    });

    it('should return 0 when no unread notifications', async () => {
      mockNotificationsService.getUnreadCount.mockResolvedValue(0);

      const result = await controller.getUnreadCount(mockUser as User);

      expect(result).toEqual({ count: 0 });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notificationId = 10;
      mockNotificationsService.markAsRead.mockResolvedValue(undefined);

      await controller.markAsRead(mockUser as User, notificationId);

      expect(service.markAsRead).toHaveBeenCalledWith(1, notificationId);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockNotificationsService.markAllAsRead.mockResolvedValue(undefined);

      await controller.markAllAsRead(mockUser as User);

      expect(service.markAllAsRead).toHaveBeenCalledWith(1);
    });
  });
});
