import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// ==================== Entities ====================
import { HolisticService } from './entities/holistic-service.entity';
import { ServicePurchase } from './entities/service-purchase.entity';

// ==================== Controllers ====================
import { HolisticServicesPublicController } from './infrastructure/controllers/holistic-services-public.controller';
import { HolisticServicesController } from './infrastructure/controllers/holistic-services.controller';
import { HolisticServicesAdminController } from './infrastructure/controllers/holistic-services-admin.controller';
import { WebhookController } from './infrastructure/controllers/webhook.controller';

// ==================== Repositories ====================
import { TypeOrmHolisticServiceRepository } from './infrastructure/repositories/typeorm-holistic-service.repository';
import { TypeOrmServicePurchaseRepository } from './infrastructure/repositories/typeorm-service-purchase.repository';
import {
  HOLISTIC_SERVICE_REPOSITORY,
  SERVICE_PURCHASE_REPOSITORY,
} from './domain/interfaces/repository.tokens';

// ==================== Use Cases ====================
import { GetAllActiveServicesUseCase } from './application/use-cases/get-all-active-services.use-case';
import { AdminGetAllServicesUseCase } from './application/use-cases/admin-get-all-services.use-case';
import { GetServiceBySlugUseCase } from './application/use-cases/get-service-by-slug.use-case';
import { AdminCreateServiceUseCase } from './application/use-cases/admin-create-service.use-case';
import { AdminUpdateServiceUseCase } from './application/use-cases/admin-update-service.use-case';
import { CreatePurchaseUseCase } from './application/use-cases/create-purchase.use-case';
import { GetUserPurchasesUseCase } from './application/use-cases/get-user-purchases.use-case';
import { GetAllPurchasesUseCase } from './application/use-cases/get-all-purchases.use-case';
import { CancelPurchaseUseCase } from './application/use-cases/cancel-purchase.use-case';
import { GetPurchaseByIdUseCase } from './application/use-cases/get-purchase-by-id.use-case';
import { GetServiceAvailabilityUseCase } from './application/use-cases/get-service-availability.use-case';
import { ProcessMercadoPagoWebhookUseCase } from './application/use-cases/process-mercadopago-webhook.use-case';

// ==================== Orchestrator ====================
import { HolisticServicesOrchestratorService } from './application/orchestrators/holistic-services-orchestrator.service';

// ==================== External Modules ====================
import { EmailModule } from '../email/email.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([HolisticService, ServicePurchase]),
    EmailModule,
    forwardRef(() => SchedulingModule),
    PaymentsModule,
  ],
  controllers: [
    HolisticServicesPublicController,
    HolisticServicesController,
    HolisticServicesAdminController,
    WebhookController,
  ],
  providers: [
    // Repositories
    {
      provide: HOLISTIC_SERVICE_REPOSITORY,
      useClass: TypeOrmHolisticServiceRepository,
    },
    {
      provide: SERVICE_PURCHASE_REPOSITORY,
      useClass: TypeOrmServicePurchaseRepository,
    },

    // Services
    // (MercadoPagoService is provided via PaymentsModule)

    // Use Cases
    GetAllActiveServicesUseCase,
    AdminGetAllServicesUseCase,
    GetServiceBySlugUseCase,
    AdminCreateServiceUseCase,
    AdminUpdateServiceUseCase,
    CreatePurchaseUseCase,
    GetUserPurchasesUseCase,
    GetAllPurchasesUseCase,
    CancelPurchaseUseCase,
    GetPurchaseByIdUseCase,
    GetServiceAvailabilityUseCase,
    ProcessMercadoPagoWebhookUseCase,

    // Orchestrator
    HolisticServicesOrchestratorService,
  ],
  exports: [HolisticServicesOrchestratorService, SERVICE_PURCHASE_REPOSITORY],
})
export class HolisticServicesModule {}
