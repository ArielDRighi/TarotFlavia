import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotification } from './entities/user-notification.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from './application/services/notifications.service';
import { SacredEventNotificationCronService } from './application/services/sacred-event-notification-cron.service';
import { NotificationsController } from './infrastructure/controllers/notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserNotification, User])],
  providers: [NotificationsService, SacredEventNotificationCronService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
