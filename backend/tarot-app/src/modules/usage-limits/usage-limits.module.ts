import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageLimitsService } from './usage-limits.service';
import { UsageLimit } from './entities/usage-limit.entity';
import { UsersModule } from '../users/users.module';
import { CheckUsageLimitGuard } from './guards/check-usage-limit.guard';
import { IncrementUsageInterceptor } from './interceptors/increment-usage.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([UsageLimit]), UsersModule],
  providers: [
    UsageLimitsService,
    CheckUsageLimitGuard,
    IncrementUsageInterceptor,
  ],
  exports: [
    UsageLimitsService,
    CheckUsageLimitGuard,
    IncrementUsageInterceptor,
  ],
})
export class UsageLimitsModule {}
