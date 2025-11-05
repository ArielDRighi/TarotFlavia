import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ReadingsService } from './readings.service';
import { ReadingsController } from './readings.controller';
import { ReadingsAdminController } from './readings-admin.controller';
import { ReadingsCleanupService } from './readings-cleanup.service';
import { ShareController } from './share.controller';
import { TarotReading } from './entities/tarot-reading.entity';
import { TarotInterpretation } from '../interpretations/entities/tarot-interpretation.entity';
import { User } from '../../users/entities/user.entity';
import { RequiresPremiumForCustomQuestionGuard } from './guards/requires-premium-for-custom-question.guard';
import { ReadingsCacheInterceptor } from './interceptors/readings-cache.interceptor';
import { InterpretationsModule } from '../interpretations/interpretations.module';
import { CardsModule } from '../cards/cards.module';
import { SpreadsModule } from '../spreads/spreads.module';
import { PredefinedQuestionsModule } from '../../predefined-questions/predefined-questions.module';
import { UsageLimitsModule } from '../../usage-limits/usage-limits.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TarotReading, TarotInterpretation, User]),
    ScheduleModule.forRoot(),
    InterpretationsModule,
    CardsModule,
    SpreadsModule,
    PredefinedQuestionsModule,
    UsageLimitsModule,
  ],
  controllers: [ReadingsController, ReadingsAdminController, ShareController],
  providers: [
    ReadingsService,
    ReadingsCleanupService,
    RequiresPremiumForCustomQuestionGuard,
    ReadingsCacheInterceptor,
  ],
  exports: [ReadingsService],
})
export class ReadingsModule {}
