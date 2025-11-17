import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIUsageLog } from './entities/ai-usage-log.entity';
import { User } from '../users/entities/user.entity';
import { AIUsageService } from './ai-usage.service';
import { AIUsageController } from './ai-usage.controller';
import { AIQuotaService } from './ai-quota.service';
import { AIQuotaController } from './ai-quota.controller';
import { AIQuotaGuard } from './ai-quota.guard';

@Module({
  imports: [TypeOrmModule.forFeature([AIUsageLog, User])],
  controllers: [AIUsageController, AIQuotaController],
  providers: [AIUsageService, AIQuotaService, AIQuotaGuard],
  exports: [AIUsageService, AIQuotaService, AIQuotaGuard],
})
export class AIUsageModule {}
