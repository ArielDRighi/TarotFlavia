import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarotistAvailability, TarotistException, Session } from './entities';
import { AvailabilityService, SessionService } from './services';
import {
  TarotistSchedulingController,
  UserSchedulingController,
} from './infrastructure/controllers';

// Domain
import {
  AVAILABILITY_REPOSITORY,
  EXCEPTION_REPOSITORY,
  SESSION_REPOSITORY,
} from './domain/interfaces/repository.tokens';

// Infrastructure - Repositories
import { TypeOrmAvailabilityRepository } from './infrastructure/repositories/typeorm-availability.repository';
import { TypeOrmExceptionRepository } from './infrastructure/repositories/typeorm-exception.repository';
import { TypeOrmSessionRepository } from './infrastructure/repositories/typeorm-session.repository';

// Application - Use Cases
import { GetAvailableSlotsUseCase } from './application/use-cases/get-available-slots.use-case';
import { BookSessionUseCase } from './application/use-cases/book-session.use-case';
import { CancelSessionUseCase } from './application/use-cases/cancel-session.use-case';
import { ConfirmSessionUseCase } from './application/use-cases/confirm-session.use-case';
import { CompleteSessionUseCase } from './application/use-cases/complete-session.use-case';

// Application - Orchestrators
import { AvailabilityOrchestratorService } from './application/services/availability-orchestrator.service';
import { SessionOrchestratorService } from './application/services/session-orchestrator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TarotistAvailability,
      TarotistException,
      Session,
    ]),
  ],
  controllers: [TarotistSchedulingController, UserSchedulingController],
  providers: [
    // Legacy services (mantener temporalmente para compatibilidad)
    AvailabilityService,
    SessionService,

    // DI Tokens para repositories
    {
      provide: AVAILABILITY_REPOSITORY,
      useClass: TypeOrmAvailabilityRepository,
    },
    {
      provide: EXCEPTION_REPOSITORY,
      useClass: TypeOrmExceptionRepository,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: TypeOrmSessionRepository,
    },

    // Use cases
    GetAvailableSlotsUseCase,
    BookSessionUseCase,
    CancelSessionUseCase,
    ConfirmSessionUseCase,
    CompleteSessionUseCase,

    // Orchestrators
    AvailabilityOrchestratorService,
    SessionOrchestratorService,
  ],
  exports: [
    // Exportar tanto legacy como nuevos para transición gradual
    AvailabilityService,
    SessionService,
    AvailabilityOrchestratorService,
    SessionOrchestratorService,
  ],
})
export class SchedulingModule {}
