import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIUsageLog } from './entities/ai-usage-log.entity';
import { AIProviderUsage } from './entities/ai-provider-usage.entity';
import { User } from '../users/entities/user.entity';
import { EmailModule } from '../email/email.module';

// Legacy services (for backward compatibility)
import { AIUsageService } from './ai-usage.service';
import { AIQuotaService } from './ai-quota.service';
import { AIProviderCostService } from './ai-provider-cost.service';

// New layered architecture
import { AIUsageOrchestratorService } from './application/services/ai-usage-orchestrator.service';
import { TrackAIUsageUseCase } from './application/use-cases/track-ai-usage.use-case';
import { GetAIUsageStatisticsUseCase } from './application/use-cases/get-ai-usage-statistics.use-case';
import { CheckUserQuotaUseCase } from './application/use-cases/check-user-quota.use-case';
import { TrackProviderUsageUseCase } from './application/use-cases/track-provider-usage.use-case';
import { IncrementUserAIRequestsUseCase } from './application/use-cases/increment-user-ai-requests.use-case';

import { TypeOrmAIUsageLogRepository } from './infrastructure/repositories/typeorm-ai-usage-log.repository';
import { TypeOrmAIProviderUsageRepository } from './infrastructure/repositories/typeorm-ai-provider-usage.repository';
import { TypeOrmUserRepository } from './infrastructure/repositories/typeorm-user.repository';

import { AIUsageController } from './infrastructure/controllers/ai-usage.controller';
import { AIQuotaController } from './infrastructure/controllers/ai-quota.controller';
import { AIQuotaGuard } from './infrastructure/guards/ai-quota.guard';

import {
  AI_USAGE_LOG_REPOSITORY,
  AI_PROVIDER_USAGE_REPOSITORY,
  USER_REPOSITORY,
} from './domain/interfaces/repository.tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([AIUsageLog, AIProviderUsage, User]),
    EmailModule,
  ],
  controllers: [AIUsageController, AIQuotaController],
  providers: [
    // DI tokens for repositories
    {
      provide: AI_USAGE_LOG_REPOSITORY,
      useClass: TypeOrmAIUsageLogRepository,
    },
    {
      provide: AI_PROVIDER_USAGE_REPOSITORY,
      useClass: TypeOrmAIProviderUsageRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },

    // Orchestrator (facade)
    AIUsageOrchestratorService,

    // Use cases
    TrackAIUsageUseCase,
    GetAIUsageStatisticsUseCase,
    CheckUserQuotaUseCase,
    TrackProviderUsageUseCase,
    IncrementUserAIRequestsUseCase,

    // Infrastructure
    AIQuotaGuard,

    // Legacy services (backward compatibility - to be removed later)
    AIUsageService,
    AIQuotaService,
    AIProviderCostService,
  ],
  exports: [
    // New layered exports
    AIUsageOrchestratorService,
    AI_USAGE_LOG_REPOSITORY,
    AI_PROVIDER_USAGE_REPOSITORY,
    USER_REPOSITORY,
    AIQuotaGuard,

    // Legacy exports (backward compatibility - to be removed later)
    AIUsageService,
    AIQuotaService,
    AIProviderCostService,
  ],
})
export class AIUsageModule {}
