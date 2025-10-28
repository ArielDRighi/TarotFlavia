import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpreadsController } from './spreads.controller';
import { SpreadsService } from './spreads.service';
import { TarotSpread } from './entities/tarot-spread.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TarotSpread])],
  controllers: [SpreadsController],
  providers: [SpreadsService],
  exports: [SpreadsService, TypeOrmModule],
})
export class SpreadsModule {}
