import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageLimitsService } from './usage-limits.service';
import { UsageLimit } from './entities/usage-limit.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([UsageLimit]), UsersModule],
  providers: [UsageLimitsService],
  exports: [UsageLimitsService],
})
export class UsageLimitsModule {}
