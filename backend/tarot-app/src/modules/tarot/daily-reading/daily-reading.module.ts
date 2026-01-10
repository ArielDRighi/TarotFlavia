import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DailyReadingController,
  DailyReadingPublicController,
} from './daily-reading.controller';
import { DailyReadingService } from './daily-reading.service';
import { DailyReading } from './entities/daily-reading.entity';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { TarotReading } from '../readings/entities/tarot-reading.entity';
import { InterpretationsModule } from '../interpretations/interpretations.module';
import { AIUsageModule } from '../../ai-usage/ai-usage.module';
import { UsageLimitsModule } from '../../usage-limits/usage-limits.module';
import { UsersModule } from '../../users/users.module';
import { PlanConfigModule } from '../../plan-config/plan-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyReading, TarotCard, TarotReading]),
    InterpretationsModule,
    AIUsageModule,
    UsageLimitsModule,
    UsersModule,
    PlanConfigModule,
  ],
  controllers: [DailyReadingController, DailyReadingPublicController],
  providers: [DailyReadingService],
  exports: [DailyReadingService, TypeOrmModule],
})
export class DailyReadingModule {}
