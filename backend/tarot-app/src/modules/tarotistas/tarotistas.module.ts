import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ==================== Controllers ====================
import { TarotistasAdminController } from './infrastructure/controllers/tarotistas-admin.controller';
import { MetricsController } from './infrastructure/controllers/metrics.controller';
import { ReportsController } from './infrastructure/controllers/reports.controller';
import { TarotistasPublicController } from './infrastructure/controllers/tarotistas-public.controller';

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
import { TypeOrmReportsRepository } from './infrastructure/repositories/typeorm-reports.repository';

// Use Cases
import { CreateTarotistaUseCase } from './application/use-cases/create-tarotista.use-case';
import { ListTarotistasUseCase } from './application/use-cases/list-tarotistas.use-case';
import { UpdateConfigUseCase } from './application/use-cases/update-config.use-case';
import { SetCustomMeaningUseCase } from './application/use-cases/set-custom-meaning.use-case';
import { ApproveApplicationUseCase } from './application/use-cases/approve-application.use-case';
import { RejectApplicationUseCase } from './application/use-cases/reject-application.use-case';
import { ToggleActiveStatusUseCase } from './application/use-cases/toggle-active-status.use-case';
import { GetTarotistaDetailsUseCase } from './application/use-cases/get-tarotista-details.use-case';
import { UpdateTarotistaUseCase } from './application/use-cases/update-tarotista.use-case';
import { GetConfigUseCase } from './application/use-cases/get-config.use-case';
import { ListApplicationsUseCase } from './application/use-cases/list-applications.use-case';
import { BulkImportMeaningsUseCase } from './application/use-cases/bulk-import-meanings.use-case';
import { ListPublicTarotistasUseCase } from './application/use-cases/list-public-tarotistas.use-case';
import { GetPublicProfileUseCase } from './application/use-cases/get-public-profile.use-case';
import { GetTarotistaMetricsUseCase } from './application/use-cases/get-tarotista-metrics.use-case';
import { GetPlatformMetricsUseCase } from './application/use-cases/get-platform-metrics.use-case';
import { GenerateReportUseCase } from './application/use-cases/generate-report.use-case';

// Orchestrator
import { TarotistasOrchestratorService } from './application/services/tarotistas-orchestrator.service';

// Legacy Services (still used by other modules)
import { RevenueCalculationService } from './services/revenue-calculation.service';

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
    MetricsController,
    ReportsController,
    TarotistasPublicController,
  ],
  providers: [
    // ==================== Repositories ====================
    {
      provide: 'ITarotistaRepository',
      useClass: TypeOrmTarotistaRepository,
    },
    {
      provide: 'IMetricsRepository',
      useClass: TypeOrmMetricsRepository,
    },
    {
      provide: 'IReportsRepository',
      useClass: TypeOrmReportsRepository,
    },

    // ==================== Use-cases ====================
    CreateTarotistaUseCase,
    ListTarotistasUseCase,
    UpdateConfigUseCase,
    SetCustomMeaningUseCase,
    ApproveApplicationUseCase,
    RejectApplicationUseCase,
    ToggleActiveStatusUseCase,
    GetTarotistaDetailsUseCase,
    UpdateTarotistaUseCase,
    GetConfigUseCase,
    ListApplicationsUseCase,
    BulkImportMeaningsUseCase,
    ListPublicTarotistasUseCase,
    GetPublicProfileUseCase,
    GetTarotistaMetricsUseCase,
    GetPlatformMetricsUseCase,
    GenerateReportUseCase,

    // ==================== Orchestrator ====================
    TarotistasOrchestratorService,

    // ==================== Legacy Services ====================
    RevenueCalculationService,
  ],
  exports: [
    TarotistasOrchestratorService,
    RevenueCalculationService,
    TypeOrmModule,
  ],
})
export class TarotistasModule {}
