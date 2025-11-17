import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIUsageLog } from './entities/ai-usage-log.entity';
import { AIProviderUsage } from './entities/ai-provider-usage.entity';
import { User } from '../users/entities/user.entity';
import { AIUsageService } from './ai-usage.service';
import { AIUsageController } from './ai-usage.controller';
import { AIQuotaService } from './ai-quota.service';
import { AIQuotaController } from './ai-quota.controller';
import { AIQuotaGuard } from './ai-quota.guard';
import { AIProviderCostService } from './ai-provider-cost.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AIUsageLog, AIProviderUsage, User]),
    EmailModule,
  ],
  controllers: [AIUsageController, AIQuotaController],
  providers: [
    AIUsageService,
    AIQuotaService,
    AIQuotaGuard,
    AIProviderCostService,
  ],
  exports: [
    AIUsageService,
    AIQuotaService,
    AIQuotaGuard,
    AIProviderCostService,
  ],
})
export class AIUsageModule {}
