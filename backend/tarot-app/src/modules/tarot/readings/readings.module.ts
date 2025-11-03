import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingsService } from './readings.service';
import { ReadingsController } from './readings.controller';
import { ShareController } from './share.controller';
import { TarotReading } from './entities/tarot-reading.entity';
import { RequiresPremiumForCustomQuestionGuard } from './guards/requires-premium-for-custom-question.guard';
import { InterpretationsModule } from '../interpretations/interpretations.module';
import { CardsModule } from '../cards/cards.module';
import { SpreadsModule } from '../spreads/spreads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TarotReading]),
    InterpretationsModule,
    CardsModule,
    SpreadsModule,
  ],
  controllers: [ReadingsController, ShareController],
  providers: [ReadingsService, RequiresPremiumForCustomQuestionGuard],
  exports: [ReadingsService],
})
export class ReadingsModule {}
