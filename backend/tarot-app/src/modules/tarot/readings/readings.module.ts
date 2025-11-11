import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingsController } from './readings.controller';
import { ReadingsAdminController } from './readings-admin.controller';
import { ReadingsCleanupService } from './readings-cleanup.service';
import { ShareController } from './share.controller';
import { SharedReadingsController } from './shared-readings.controller';
import { TarotReading } from './entities/tarot-reading.entity';
import { TarotInterpretation } from '../interpretations/entities/tarot-interpretation.entity';
import { User } from '../../users/entities/user.entity';
import { RequiresPremiumForCustomQuestionGuard } from './guards/requires-premium-for-custom-question.guard';
import { ReadingsCacheInterceptor } from './interceptors/readings-cache.interceptor';
import { InterpretationsModule } from '../interpretations/interpretations.module';
import { CardsModule } from '../cards/cards.module';
import { SpreadsModule } from '../spreads/spreads.module';
import { PredefinedQuestionsModule } from '../../predefined-questions/predefined-questions.module';
import { UsageLimitsModule } from '../../usage-limits/usage-limits.module';

// ==================== Clean Architecture ====================
// Repositories
import { TypeOrmReadingRepository } from './infrastructure/repositories/typeorm-reading.repository';

// Services
import { ReadingValidatorService } from './application/services/reading-validator.service';
import { ReadingShareService } from './application/services/reading-share.service';
import { ReadingsOrchestratorService } from './application/services/readings-orchestrator.service';

// Use Cases
import { CreateReadingUseCase } from './application/use-cases/create-reading.use-case';
import { ListReadingsUseCase } from './application/use-cases/list-readings.use-case';
import { GetReadingUseCase } from './application/use-cases/get-reading.use-case';
import { ShareReadingUseCase } from './application/use-cases/share-reading.use-case';
import { RegenerateReadingUseCase } from './application/use-cases/regenerate-reading.use-case';
import { DeleteReadingUseCase } from './application/use-cases/delete-reading.use-case';
import { RestoreReadingUseCase } from './application/use-cases/restore-reading.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([TarotReading, TarotInterpretation, User]),
    InterpretationsModule,
    CardsModule,
    SpreadsModule,
    PredefinedQuestionsModule,
    UsageLimitsModule,
  ],
  controllers: [
    ReadingsController,
    ReadingsAdminController,
    ShareController,
    SharedReadingsController,
  ],
  providers: [
    ReadingsCleanupService,
    RequiresPremiumForCustomQuestionGuard,
    ReadingsCacheInterceptor,

    // Clean Architecture
    // Repository
    {
      provide: 'IReadingRepository',
      useClass: TypeOrmReadingRepository,
    },

    // Services
    ReadingValidatorService,
    ReadingShareService,
    ReadingsOrchestratorService,

    // Use Cases
    CreateReadingUseCase,
    ListReadingsUseCase,
    GetReadingUseCase,
    ShareReadingUseCase,
    RegenerateReadingUseCase,
    DeleteReadingUseCase,
    RestoreReadingUseCase,
  ],
  exports: [ReadingsOrchestratorService],
})
export class ReadingsModule {}
