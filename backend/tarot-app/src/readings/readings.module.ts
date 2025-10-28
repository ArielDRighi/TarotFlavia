import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingsService } from './readings.service';
import { ReadingsController } from './readings.controller';
import { ShareController } from './share.controller';
import { TarotReading } from './entities/tarot-reading.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TarotReading])],
  controllers: [ReadingsController, ShareController],
  providers: [ReadingsService],
  exports: [ReadingsService],
})
export class ReadingsModule {}
