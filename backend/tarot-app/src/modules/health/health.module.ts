import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { AIHealthController } from './ai-health.controller';
import { AIHealthService } from './ai-health.service';
import { DatabaseHealthService } from './database-health.service';
import { HealthController } from './health.controller';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [ConfigModule, TerminusModule, AIModule],
  controllers: [AIHealthController, HealthController],
  providers: [AIHealthService, DatabaseHealthService],
  exports: [AIHealthService, DatabaseHealthService],
})
export class HealthModule {}
