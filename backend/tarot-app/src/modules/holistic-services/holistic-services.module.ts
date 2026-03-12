import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// ==================== Entities ====================
import { HolisticService } from './entities/holistic-service.entity';
import { ServicePurchase } from './entities/service-purchase.entity';

// ==================== Controllers ====================
import { HolisticServicesPublicController } from './infrastructure/controllers/holistic-services-public.controller';
import { HolisticServicesController } from './infrastructure/controllers/holistic-services.controller';
import { HolisticServicesAdminController } from './infrastructure/controllers/holistic-services-admin.controller';

// ==================== Repositories ====================
import { TypeOrmHolisticServiceRepository } from './infrastructure/repositories/typeorm-holistic-service.repository';
import { TypeOrmServicePurchaseRepository } from './infrastructure/repositories/typeorm-service-purchase.repository';
import {
  HOLISTIC_SERVICE_REPOSITORY,
  SERVICE_PURCHASE_REPOSITORY,
} from './domain/interfaces/repository.tokens';

// ==================== Use Cases ====================
import { GetAllActiveServicesUseCase } from './application/use-cases/get-all-active-services.use-case';
import { GetServiceBySlugUseCase } from './application/use-cases/get-service-by-slug.use-case';
import { AdminCreateServiceUseCase } from './application/use-cases/admin-create-service.use-case';
import { AdminUpdateServiceUseCase } from './application/use-cases/admin-update-service.use-case';
import { CreatePurchaseUseCase } from './application/use-cases/create-purchase.use-case';
import { ApprovePurchaseUseCase } from './application/use-cases/approve-purchase.use-case';
import { GetUserPurchasesUseCase } from './application/use-cases/get-user-purchases.use-case';
import { GetPendingPaymentsUseCase } from './application/use-cases/get-pending-payments.use-case';
import { CancelPurchaseUseCase } from './application/use-cases/cancel-purchase.use-case';
import { GetPurchaseByIdUseCase } from './application/use-cases/get-purchase-by-id.use-case';

// ==================== Orchestrator ====================
import { HolisticServicesOrchestratorService } from './application/orchestrators/holistic-services-orchestrator.service';

// ==================== External Modules ====================
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([HolisticService, ServicePurchase]),
    EmailModule,
  ],
  controllers: [
    HolisticServicesPublicController,
    HolisticServicesController,
    HolisticServicesAdminController,
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

    // Use Cases
    GetAllActiveServicesUseCase,
    GetServiceBySlugUseCase,
    AdminCreateServiceUseCase,
    AdminUpdateServiceUseCase,
    CreatePurchaseUseCase,
    ApprovePurchaseUseCase,
    GetUserPurchasesUseCase,
    GetPendingPaymentsUseCase,
    CancelPurchaseUseCase,
    GetPurchaseByIdUseCase,

    // Orchestrator
    HolisticServicesOrchestratorService,
  ],
  exports: [HolisticServicesOrchestratorService, SERVICE_PURCHASE_REPOSITORY],
})
export class HolisticServicesModule {}
