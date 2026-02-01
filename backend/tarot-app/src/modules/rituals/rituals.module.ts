import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Ritual,
  RitualStep,
  RitualMaterial,
  UserRitualHistory,
} from './entities';
import { LunarPhaseService } from './application/services/lunar-phase.service';
import { RitualsService } from './application/services/rituals.service';
import { RitualHistoryService } from './application/services/ritual-history.service';
import { RitualsAdminService } from './application/services/rituals-admin.service';
import { RitualsController } from './infrastructure/controllers/rituals.controller';
import { RitualsAdminController } from './infrastructure/controllers/rituals-admin.controller';

/**
 * Módulo de Rituales
 * Gestiona rituales espirituales, pasos, materiales e historial de usuarios
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ritual,
      RitualStep,
      RitualMaterial,
      UserRitualHistory,
    ]),
  ],
  controllers: [RitualsController, RitualsAdminController],
  providers: [
    LunarPhaseService,
    RitualsService,
    RitualHistoryService,
    RitualsAdminService,
  ],
  exports: [
    LunarPhaseService,
    RitualsService,
    RitualHistoryService,
    RitualsAdminService,
  ],
})
export class RitualsModule {}
