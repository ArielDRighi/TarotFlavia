import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarotistAvailability, TarotistException, Session } from './entities';
import { AvailabilityService, SessionService } from './services';
import {
  TarotistSchedulingController,
  UserSchedulingController,
  AdminSchedulingController,
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
import { AdminGetWeeklyAvailabilityUseCase } from './application/use-cases/admin-get-weekly-availability.use-case';
import { AdminSetWeeklyAvailabilityUseCase } from './application/use-cases/admin-set-weekly-availability.use-case';
import { AdminRemoveWeeklyAvailabilityUseCase } from './application/use-cases/admin-remove-weekly-availability.use-case';
import { AdminGetExceptionsUseCase } from './application/use-cases/admin-get-exceptions.use-case';
import { AdminAddExceptionUseCase } from './application/use-cases/admin-add-exception.use-case';
import { AdminRemoveExceptionUseCase } from './application/use-cases/admin-remove-exception.use-case';

// Application - Orchestrators
import { AvailabilityOrchestratorService } from './application/services/availability-orchestrator.service';
import { SessionOrchestratorService } from './application/services/session-orchestrator.service';
import { AdminSchedulingOrchestratorService } from './application/services/admin-scheduling-orchestrator.service';

// External Modules
import { HolisticServicesModule } from '../holistic-services/holistic-services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TarotistAvailability,
      TarotistException,
      Session,
    ]),
    forwardRef(() => HolisticServicesModule),
  ],
  controllers: [
    TarotistSchedulingController,
    UserSchedulingController,
    AdminSchedulingController,
  ],
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

    // Admin use cases
    AdminGetWeeklyAvailabilityUseCase,
    AdminSetWeeklyAvailabilityUseCase,
    AdminRemoveWeeklyAvailabilityUseCase,
    AdminGetExceptionsUseCase,
    AdminAddExceptionUseCase,
    AdminRemoveExceptionUseCase,

    // Orchestrators
    AvailabilityOrchestratorService,
    SessionOrchestratorService,
    AdminSchedulingOrchestratorService,
  ],
  exports: [
    // Exportar tanto legacy como nuevos para transición gradual
    AvailabilityService,
    SessionService,
    AvailabilityOrchestratorService,
    SessionOrchestratorService,
    // Repository tokens para uso en otros módulos (via forwardRef)
    AVAILABILITY_REPOSITORY,
    EXCEPTION_REPOSITORY,
    SESSION_REPOSITORY,
  ],
})
export class SchedulingModule {}
