import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Tarotista } from '../tarotistas/entities/tarotista.entity';
import { AuthModule } from '../auth/auth.module';

// Infrastructure
import { TypeOrmUserRepository } from './infrastructure/repositories/typeorm-user.repository';
import { TypeOrmTarotistaRepository } from './infrastructure/repositories/typeorm-tarotista.repository';
import { UsersController } from './infrastructure/controllers/users.controller';

// Application
import { UsersOrchestratorService } from './application/services/users-orchestrator.service';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { UpdateUserPlanUseCase } from './application/use-cases/update-user-plan.use-case';
import { ManageUserRolesUseCase } from './application/use-cases/manage-user-roles.use-case';
import { ManageUserBanUseCase } from './application/use-cases/manage-user-ban.use-case';
import { GetUserDetailUseCase } from './application/use-cases/get-user-detail.use-case';

// Domain
import {
  USER_REPOSITORY,
  TAROTISTA_REPOSITORY,
} from './domain/interfaces/repository.tokens';

// Legacy service (temporary - for backward compatibility)
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tarotista]),
    forwardRef(() => AuthModule),
  ],
  providers: [
    // DI tokens para repositories
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: TAROTISTA_REPOSITORY,
      useClass: TypeOrmTarotistaRepository,
    },

    // Orchestrator (facade)
    UsersOrchestratorService,

    // Use cases
    CreateUserUseCase,
    UpdateUserUseCase,
    UpdateUserPlanUseCase,
    ManageUserRolesUseCase,
    ManageUserBanUseCase,
    GetUserDetailUseCase,

    // Legacy service (temporary - for backward compatibility)
    UsersService,
  ],
  exports: [
    UsersOrchestratorService,
    UsersService, // Mantener para backward compatibility
    USER_REPOSITORY,
    TAROTISTA_REPOSITORY,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
