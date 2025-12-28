import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageLimitsService } from './usage-limits.service';
import { UsageLimitsResetService } from './services/usage-limits-reset.service';
import { UsageLimit } from './entities/usage-limit.entity';
import { UsersModule } from '../users/users.module';
import { PlanConfigModule } from '../plan-config/plan-config.module';
import { CheckUsageLimitGuard } from './guards/check-usage-limit.guard';
import { IncrementUsageInterceptor } from './interceptors/increment-usage.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsageLimit]),
    forwardRef(() => UsersModule),
    PlanConfigModule,
  ],
  providers: [
    UsageLimitsService,
    UsageLimitsResetService,
    CheckUsageLimitGuard,
    IncrementUsageInterceptor,
  ],
  exports: [
    UsageLimitsService,
    UsageLimitsResetService,
    CheckUsageLimitGuard,
    IncrementUsageInterceptor,
  ],
})
export class UsageLimitsModule {}
