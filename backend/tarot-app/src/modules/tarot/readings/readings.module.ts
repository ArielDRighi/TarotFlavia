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
import { PredefinedQuestionsModule } from '../../predefined-questions/predefined-questions.module';
import { UsageLimitsModule } from '../../usage-limits/usage-limits.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TarotReading]),
    InterpretationsModule,
    CardsModule,
    SpreadsModule,
    PredefinedQuestionsModule,
    UsageLimitsModule,
  ],
  controllers: [ReadingsController, ShareController],
  providers: [ReadingsService, RequiresPremiumForCustomQuestionGuard],
  exports: [ReadingsService],
})
export class ReadingsModule {}
