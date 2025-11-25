import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ==================== Old Structure (PRESERVING) ====================
import { TarotistasService } from './tarotistas.service';
import { TarotistasAdminService } from './services/tarotistas-admin.service';
import { TarotistasPublicService } from './services/tarotistas-public.service';
import { RevenueCalculationService } from './services/revenue-calculation.service';
import { MetricsService } from './services/metrics.service';
import { ReportsService } from './services/reports.service';
import { TarotistasAdminController } from './controllers/tarotistas-admin.controller';
import { TarotistasPublicController } from './controllers/tarotistas-public.controller';
import { MetricsController } from './controllers/metrics.controller';
import { ReportsController } from './controllers/reports.controller';

// ==================== Entities ====================
import { TarotistaConfig } from './entities/tarotista-config.entity';
import { TarotistaCardMeaning } from './entities/tarotista-card-meaning.entity';
import { TarotistaApplication } from './entities/tarotista-application.entity';
import { Tarotista } from './entities/tarotista.entity';
import { TarotistaRevenueMetrics } from './entities/tarotista-revenue-metrics.entity';
import { UserTarotistaSubscription } from './entities/user-tarotista-subscription.entity';
import { User } from '../users/entities/user.entity';
import { TarotReading } from '../tarot/readings/entities/tarot-reading.entity';

// ==================== Clean Architecture (NEW) ====================
// Repositories
import { TypeOrmTarotistaRepository } from './infrastructure/repositories/typeorm-tarotista.repository';
import { TypeOrmMetricsRepository } from './infrastructure/repositories/typeorm-metrics.repository';

// Use Cases
import { CreateTarotistaUseCase } from './application/use-cases/create-tarotista.use-case';
import { ListTarotistasUseCase } from './application/use-cases/list-tarotistas.use-case';
import { UpdateConfigUseCase } from './application/use-cases/update-config.use-case';
import { SetCustomMeaningUseCase } from './application/use-cases/set-custom-meaning.use-case';
import { ApproveApplicationUseCase } from './application/use-cases/approve-application.use-case';
import { RejectApplicationUseCase } from './application/use-cases/reject-application.use-case';
import { ToggleActiveStatusUseCase } from './application/use-cases/toggle-active-status.use-case';
import { GetTarotistaDetailsUseCase } from './application/use-cases/get-tarotista-details.use-case';

// Orchestrator
import { TarotistasOrchestratorService } from './application/services/tarotistas-orchestrator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tarotista,
      TarotistaConfig,
      TarotistaCardMeaning,
      TarotistaApplication,
      TarotistaRevenueMetrics,
      UserTarotistaSubscription,
      User,
      TarotReading,
    ]),
  ],
  controllers: [
    TarotistasAdminController,
    TarotistasPublicController,
    MetricsController,
    ReportsController,
  ],
  providers: [
    // ==================== Old Services (PRESERVING - will be deprecated later) ====================
    TarotistasService,
    TarotistasAdminService,
    TarotistasPublicService,
    RevenueCalculationService,
    MetricsService,
    ReportsService,

    // ==================== Clean Architecture (NEW) ====================
    // Repositories
    {
      provide: 'ITarotistaRepository',
      useClass: TypeOrmTarotistaRepository,
    },
    {
      provide: 'IMetricsRepository',
      useClass: TypeOrmMetricsRepository,
    },

    // Use-cases
    CreateTarotistaUseCase,
    ListTarotistasUseCase,
    UpdateConfigUseCase,
    SetCustomMeaningUseCase,
    ApproveApplicationUseCase,
    RejectApplicationUseCase,
    ToggleActiveStatusUseCase,
    GetTarotistaDetailsUseCase,

    // Orchestrator
    TarotistasOrchestratorService,
  ],
  exports: [
    TarotistasService,
    TarotistasAdminService,
    TarotistasPublicService,
    RevenueCalculationService,
    MetricsService,
    ReportsService,
    TarotistasOrchestratorService, // Export orchestrator
    TypeOrmModule,
  ],
})
export class TarotistasModule {}
