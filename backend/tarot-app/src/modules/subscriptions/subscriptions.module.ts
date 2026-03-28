import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { UserTarotistaSubscription } from '../tarotistas/entities/user-tarotista-subscription.entity';
import { User } from '../users/entities/user.entity';
import { Tarotista } from '../tarotistas/entities/tarotista.entity';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { CreatePreapprovalUseCase } from './application/use-cases/create-preapproval.use-case';
import { CancelSubscriptionUseCase } from './application/use-cases/cancel-subscription.use-case';
import { CheckSubscriptionStatusUseCase } from './application/use-cases/check-subscription-status.use-case';
import { ProcessSubscriptionWebhookUseCase } from './application/use-cases/process-subscription-webhook.use-case';
import { SubscriptionCronService } from './application/services/subscription-cron.service';
import { SubscriptionReconciliationService } from './application/services/subscription-reconciliation.service';
import { SUBSCRIPTION_WEBHOOK_USE_CASE } from '../payments/tokens/payment.tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserTarotistaSubscription, User, Tarotista]),
    UsersModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    CreatePreapprovalUseCase,
    CancelSubscriptionUseCase,
    CheckSubscriptionStatusUseCase,
    ProcessSubscriptionWebhookUseCase,
    SubscriptionCronService,
    SubscriptionReconciliationService,
    {
      provide: SUBSCRIPTION_WEBHOOK_USE_CASE,
      useExisting: ProcessSubscriptionWebhookUseCase,
    },
  ],
  exports: [SubscriptionsService, SUBSCRIPTION_WEBHOOK_USE_CASE],
})
export class SubscriptionsModule {}
