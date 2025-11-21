import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { UserTarotistaSubscription } from '../tarotistas/entities/user-tarotista-subscription.entity';
import { User } from '../users/entities/user.entity';
import { Tarotista } from '../tarotistas/entities/tarotista.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserTarotistaSubscription, User, Tarotista]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
