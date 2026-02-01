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
  controllers: [],
  providers: [LunarPhaseService, RitualsService, RitualHistoryService],
  exports: [LunarPhaseService, RitualsService, RitualHistoryService],
})
export class RitualsModule {}
