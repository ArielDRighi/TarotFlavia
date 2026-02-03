import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Ritual,
  RitualStep,
  RitualMaterial,
  UserRitualHistory,
  SacredEvent,
} from './entities';
import { TarotReading } from '../tarot/readings/entities/tarot-reading.entity';
import { ReadingCategory } from '../categories/entities/reading-category.entity';
import { LunarPhaseService } from './application/services/lunar-phase.service';
import { RitualsService } from './application/services/rituals.service';
import { RitualHistoryService } from './application/services/ritual-history.service';
import { RitualsAdminService } from './application/services/rituals-admin.service';
import { SacredCalendarService } from './application/services/sacred-calendar.service';
import { SacredCalendarCronService } from './application/cron/sacred-calendar-cron.service';
import { ReadingPatternAnalyzerService } from './application/services/reading-pattern-analyzer.service';
import { RitualsController } from './infrastructure/controllers/rituals.controller';
import { RitualsAdminController } from './infrastructure/controllers/rituals-admin.controller';
import { SacredCalendarController } from './infrastructure/controllers/sacred-calendar.controller';

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
      TarotReading,
      ReadingCategory,
    ]),
  ],
  controllers: [
    RitualsController,
    RitualsAdminController,
    SacredCalendarController,
  ],
  providers: [
    LunarPhaseService,
    RitualsService,
    RitualHistoryService,
    RitualsAdminService,
    SacredCalendarService,
    SacredCalendarCronService,
    ReadingPatternAnalyzerService,
  ],
  exports: [
    LunarPhaseService,
    RitualsService,
    RitualHistoryService,
    RitualsAdminService,
    SacredCalendarService,
    SacredCalendarCronService,
    ReadingPatternAnalyzerService,
  ],
})
export class RitualsModule {}
