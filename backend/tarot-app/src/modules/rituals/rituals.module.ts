import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Ritual,
  RitualStep,
  RitualMaterial,
  UserRitualHistory,
  SacredEvent,
} from './entities';
import { LunarPhaseService } from './application/services/lunar-phase.service';
import { RitualsService } from './application/services/rituals.service';
import { RitualHistoryService } from './application/services/ritual-history.service';
import { RitualsAdminService } from './application/services/rituals-admin.service';
import { SacredCalendarService } from './application/services/sacred-calendar.service';
import { SacredCalendarCronService } from './application/cron/sacred-calendar-cron.service';
import { RitualsController } from './infrastructure/controllers/rituals.controller';
import { RitualsAdminController } from './infrastructure/controllers/rituals-admin.controller';

/**
 * Módulo de Rituales
 * Gestiona rituales espirituales, pasos, materiales, historial de usuarios y calendario sagrado
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ritual,
      RitualStep,
      RitualMaterial,
      UserRitualHistory,
      SacredEvent,
    ]),
  ],
  controllers: [RitualsController, RitualsAdminController],
  providers: [
    LunarPhaseService,
    RitualsService,
    RitualHistoryService,
    RitualsAdminService,
    SacredCalendarService,
    SacredCalendarCronService,
  ],
  exports: [
    LunarPhaseService,
    RitualsService,
    RitualHistoryService,
    RitualsAdminService,
    SacredCalendarService,
    SacredCalendarCronService,
  ],
})
export class RitualsModule {}
