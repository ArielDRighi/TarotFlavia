import { Module } from '@nestjs/common';
import { NumerologyService } from './numerology.service';

@Module({
  providers: [NumerologyService],
  exports: [NumerologyService],
})
export class NumerologyModule {}
