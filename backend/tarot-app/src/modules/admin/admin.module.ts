import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminUsersController } from './admin-users.controller';
import { RateLimitsAdminController } from './rate-limits/rate-limits-admin.controller';
import { IPWhitelistAdminController } from './rate-limits/ip-whitelist-admin.controller';
import { User } from '../users/entities/user.entity';
import { TarotReading } from '../tarot/readings/entities/tarot-reading.entity';
import { AIUsageLog } from '../ai-usage/entities/ai-usage-log.entity';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, TarotReading, AIUsageLog]),
    CacheModule.register({
      ttl: 300000, // 5 minutos default
      max: 100, // Máximo 100 items en caché
    }),
    UsersModule,
    AuditModule,
  ],
  controllers: [
    AdminDashboardController,
    AdminUsersController,
    RateLimitsAdminController,
    IPWhitelistAdminController,
  ],
  providers: [AdminDashboardService],
  exports: [AdminDashboardService],
})
export class AdminModule {}
