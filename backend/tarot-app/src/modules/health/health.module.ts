import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIHealthController } from './ai-health.controller';
import { AIHealthService } from './ai-health.service';
import { InterpretationsModule } from '../tarot/interpretations/interpretations.module';

@Module({
  imports: [ConfigModule, forwardRef(() => InterpretationsModule)],
  controllers: [AIHealthController],
  providers: [AIHealthService],
  exports: [AIHealthService],
})
export class HealthModule {}
