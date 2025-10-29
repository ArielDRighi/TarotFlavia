import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { InterpretationsService } from './interpretations.service';
import { InterpretationsController } from './interpretations.controller';
import { TarotInterpretation } from './entities/tarot-interpretation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TarotInterpretation]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [InterpretationsController],
  providers: [InterpretationsService],
  exports: [InterpretationsService],
})
export class InterpretationsModule {}
