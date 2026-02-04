import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendulumQuery } from './entities/pendulum-query.entity';
import { PendulumInterpretation } from './entities/pendulum-interpretation.entity';
import { RitualsModule } from '../rituals/rituals.module';
import { UsageLimitsModule } from '../usage-limits/usage-limits.module';
import { UsersModule } from '../users/users.module';
import { PendulumService } from './application/services/pendulum.service';
import { PendulumHistoryService } from './application/services/pendulum-history.service';
import { PendulumInterpretationService } from './application/services/pendulum-interpretation.service';
import { PendulumContentValidatorService } from './application/services/pendulum-content-validator.service';
import { PendulumController } from './infrastructure/controllers/pendulum.controller';

/**
 * Módulo del Péndulo Digital
 *
 * Proporciona funcionalidad para:
 * - Consultar el péndulo digital (40% Sí, 40% No, 20% Quizás)
 * - Validar contenido de preguntas (bloqueo de temas sensibles)
 * - Gestionar historial de consultas (solo Premium)
 * - Obtener estadísticas de respuestas (solo Premium)
 * - Integración con fases lunares y límites de uso
 *
 * Dependencias:
 * - RitualsModule: Para obtener fase lunar actual (LunarPhaseService)
 * - UsageLimitsModule: Para guards e interceptors de límites de uso
 * - UsersModule: Para validación de usuarios (usado por CheckUsageLimitGuard)
 * - TypeORM: Para persistencia de consultas e interpretaciones
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([PendulumQuery, PendulumInterpretation]),
    RitualsModule, // Proporciona LunarPhaseService
    UsageLimitsModule, // Proporciona CheckUsageLimitGuard e IncrementUsageInterceptor
    forwardRef(() => UsersModule), // Proporciona UsersService (necesario para CheckUsageLimitGuard)
  ],
  controllers: [PendulumController],
  providers: [
    PendulumService,
    PendulumHistoryService,
    PendulumInterpretationService,
    PendulumContentValidatorService,
  ],
  exports: [PendulumService],
})
export class PendulumModule {}
