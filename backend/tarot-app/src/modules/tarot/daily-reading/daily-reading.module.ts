import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DailyReadingController,
  DailyReadingPublicController,
} from './daily-reading.controller';
import { DailyReadingService } from './daily-reading.service';
import { DailyReading } from './entities/daily-reading.entity';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { InterpretationsModule } from '../interpretations/interpretations.module';
import { AIUsageModule } from '../../ai-usage/ai-usage.module';
import { UsageLimitsModule } from '../../usage-limits/usage-limits.module';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyReading, TarotCard]),
    InterpretationsModule,
    AIUsageModule,
    UsageLimitsModule,
    UsersModule,
  ],
  controllers: [DailyReadingController, DailyReadingPublicController],
  providers: [DailyReadingService],
  exports: [DailyReadingService],
})
export class DailyReadingModule {}
