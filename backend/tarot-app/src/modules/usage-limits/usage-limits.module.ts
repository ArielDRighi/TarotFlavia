import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageLimitsService } from './usage-limits.service';
import { UsageLimitsResetService } from './services/usage-limits-reset.service';
import { AnonymousTrackingService } from './services/anonymous-tracking.service';
import { UsageLimit } from './entities/usage-limit.entity';
import { AnonymousUsage } from './entities/anonymous-usage.entity';
import { UsersModule } from '../users/users.module';
import { PlanConfigModule } from '../plan-config/plan-config.module';
import { CheckUsageLimitGuard } from './guards/check-usage-limit.guard';
import { IncrementUsageInterceptor } from './interceptors/increment-usage.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsageLimit, AnonymousUsage]),
    forwardRef(() => UsersModule),
    PlanConfigModule,
  ],
  providers: [
    UsageLimitsService,
    UsageLimitsResetService,
    AnonymousTrackingService,
    CheckUsageLimitGuard,
    IncrementUsageInterceptor,
  ],
  exports: [
    UsageLimitsService,
    UsageLimitsResetService,
    AnonymousTrackingService,
    CheckUsageLimitGuard,
    IncrementUsageInterceptor,
  ],
})
export class UsageLimitsModule {}
