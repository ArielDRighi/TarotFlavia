import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NumerologyService } from './numerology.service';
import { NumerologyInterpretation } from './entities/numerology-interpretation.entity';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([NumerologyInterpretation]), AIModule],
  providers: [NumerologyService],
  exports: [NumerologyService],
})
export class NumerologyModule {}
