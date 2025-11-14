import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyReadingController } from './daily-reading.controller';
import { DailyReadingService } from './daily-reading.service';
import { DailyReading } from './entities/daily-reading.entity';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { InterpretationsModule } from '../interpretations/interpretations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyReading, TarotCard]),
    InterpretationsModule,
  ],
  controllers: [DailyReadingController],
  providers: [DailyReadingService],
  exports: [DailyReadingService],
})
export class DailyReadingModule {}
