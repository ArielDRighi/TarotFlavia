import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  UserNotification,
  NotificationType,
} from '../../entities/user-notification.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(UserNotification),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const userId = 1;
      const type = NotificationType.SACRED_EVENT;
      const title = 'Hoy: Luna Nueva';
      const message = 'Energía de nuevos comienzos';
      const data = { eventId: 5 };
      const actionUrl = '/rituales?lunar=new_moon';

      const mockNotification = {
        id: 1,
        userId,
        type,
        title,
        message,
        data,
        actionUrl,
        read: false,
        readAt: null,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createNotification(
        userId,
        type,
        title,
        message,
        data,
        actionUrl,
      );

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        type,
        title,
        message,
        data,
        actionUrl,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(result).toEqual(mockNotification);
    });

    it('should create notification without optional data and actionUrl', async () => {
      const userId = 1;
      const type = NotificationType.PATTERN_INSIGHT;
      const title = 'Patrón detectado';
      const message = 'Has hecho muchas lecturas sobre amor';

      const mockNotification = {
        id: 2,
        userId,
        type,
        title,
        message,
        data: null,
        actionUrl: null,
        read: false,
        readAt: null,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createNotification(
        userId,
        type,
        title,
        message,
      );

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        type,
        title,
        message,
        data: undefined,
        actionUrl: undefined,
      });
      expect(result).toEqual(mockNotification);
    });
  });

  describe('getUserNotifications', () => {
    it('should return all notifications for a user', async () => {
      const userId = 1;
      const mockNotifications = [
        {
          id: 1,
          userId,
          type: NotificationType.SACRED_EVENT,
          title: 'Luna Nueva',
          message: 'Test',
          read: false,
          createdAt: new Date(),
        },
        {
          id: 2,
          userId,
          type: NotificationType.RITUAL_REMINDER,
          title: 'Ritual pendiente',
          message: 'Test 2',
          read: true,
          createdAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(mockNotifications);

      const result = await service.getUserNotifications(userId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 20,
      });
      expect(result).toEqual(mockNotifications);
    });

    it('should return only unread notifications when unreadOnly is true', async () => {
      const userId = 1;
      const mockNotifications = [
        {
          id: 1,
          userId,
          type: NotificationType.SACRED_EVENT,
          title: 'Luna Nueva',
          message: 'Test',
          read: false,
          createdAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(mockNotifications);

      const result = await service.getUserNotifications(userId, true);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId, read: false },
        order: { createdAt: 'DESC' },
        take: 20,
      });
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const userId = 1;
      const notificationId = 10;

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.markAsRead(userId, notificationId);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: notificationId, userId },
        { read: true, readAt: expect.any(Date) },
      );
    });

    it('should throw NotFoundException when notification does not exist', async () => {
      const userId = 1;
      const notificationId = 999;

      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.markAsRead(userId, notificationId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.markAsRead(userId, notificationId)).rejects.toThrow(
        'Notification with id 999 not found or does not belong to user',
      );
    });

    it('should throw NotFoundException when notification belongs to another user', async () => {
      const userId = 1;
      const notificationId = 10;

      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.markAsRead(userId, notificationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read for a user', async () => {
      const userId = 1;

      mockRepository.update.mockResolvedValue({ affected: 5 });

      await service.markAllAsRead(userId);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { userId, read: false },
        { read: true, readAt: expect.any(Date) },
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return the count of unread notifications', async () => {
      const userId = 1;
      const unreadCount = 3;

      mockRepository.count.mockResolvedValue(unreadCount);

      const result = await service.getUnreadCount(userId);

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { userId, read: false },
      });
      expect(result).toBe(unreadCount);
    });

    it('should return 0 when no unread notifications', async () => {
      const userId = 1;

      mockRepository.count.mockResolvedValue(0);

      const result = await service.getUnreadCount(userId);

      expect(result).toBe(0);
    });
  });
});
