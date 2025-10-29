import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIHealthController } from './ai-health.controller';
import { AIHealthService } from './ai-health.service';

@Module({
  imports: [ConfigModule],
  controllers: [AIHealthController],
  providers: [AIHealthService],
  exports: [AIHealthService],
})
export class HealthModule {}
