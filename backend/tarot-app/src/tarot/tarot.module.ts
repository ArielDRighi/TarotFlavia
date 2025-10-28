import { Module } from '@nestjs/common';
import { CardsModule } from '../cards/cards.module';
import { DecksModule } from '../decks/decks.module';
import { SpreadsModule } from '../spreads/spreads.module';
import { ReadingsModule } from '../readings/readings.module';
import { InterpretationsModule } from '../interpretations/interpretations.module';

/**
 * TarotModule - Módulo orquestador que agrupa todos los submódulos del sistema de tarot
 *
 * Este módulo actúa como punto de entrada principal para todas las funcionalidades
 * relacionadas con el tarot, importando y re-exportando los módulos especializados.
 */
@Module({
  imports: [
    CardsModule,
    DecksModule,
    SpreadsModule,
    ReadingsModule,
    InterpretationsModule,
  ],
  exports: [
    CardsModule,
    DecksModule,
    SpreadsModule,
    ReadingsModule,
    InterpretationsModule,
  ],
})
export class TarotModule {}
