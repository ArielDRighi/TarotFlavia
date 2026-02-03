import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import {
  UserNotification,
  NotificationType,
} from '../../entities/user-notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(UserNotification)
    private readonly notificationRepo: Repository<UserNotification>,
  ) {}

  /**
   * Crear una nueva notificación para un usuario
   */
  async createNotification(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
    actionUrl?: string,
  ): Promise<UserNotification> {
    const notification = this.notificationRepo.create({
      userId,
      type,
      title,
      message,
      data,
      actionUrl,
    });

    return this.notificationRepo.save(notification);
  }

  /**
   * Obtener notificaciones del usuario
   */
  async getUserNotifications(
    userId: number,
    unreadOnly = false,
  ): Promise<UserNotification[]> {
    const where: FindOptionsWhere<UserNotification> = { userId };

    if (unreadOnly) {
      where.read = false;
    }

    return this.notificationRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(userId: number, notificationId: number): Promise<void> {
    await this.notificationRepo.update(
      { id: notificationId, userId },
      { read: true, readAt: new Date() },
    );
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepo.update(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );
  }

  /**
   * Obtener conteo de notificaciones no leídas
   */
  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepo.count({
      where: { userId, read: false },
    });
  }
}
