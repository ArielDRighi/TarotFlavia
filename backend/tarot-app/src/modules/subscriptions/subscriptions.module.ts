import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { UserTarotistaSubscription } from '../tarotistas/entities/user-tarotista-subscription.entity';
import { User } from '../users/entities/user.entity';
import { Tarotista } from '../tarotistas/entities/tarotista.entity';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { CreatePreapprovalUseCase } from './application/use-cases/create-preapproval.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserTarotistaSubscription, User, Tarotista]),
    UsersModule,
    PaymentsModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, CreatePreapprovalUseCase],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
