import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIHealthController } from './ai-health.controller';
import { AIHealthService } from './ai-health.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [ConfigModule, AIModule],
  controllers: [AIHealthController],
  providers: [AIHealthService],
  exports: [AIHealthService],
})
export class HealthModule {}
