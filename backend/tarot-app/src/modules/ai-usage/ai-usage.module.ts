import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIUsageLog } from './entities/ai-usage-log.entity';
import { AIUsageService } from './ai-usage.service';
import { AIUsageController } from './ai-usage.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AIUsageLog])],
  controllers: [AIUsageController],
  providers: [AIUsageService],
  exports: [AIUsageService],
})
export class AIUsageModule {}
