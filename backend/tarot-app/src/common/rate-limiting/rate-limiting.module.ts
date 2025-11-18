import { Module, Global } from '@nestjs/common';
import { IPBlockingService } from '../services/ip-blocking.service';
import { IPWhitelistService } from '../services/ip-whitelist.service';
import { RateLimitController } from './rate-limit.controller';
import { RateLimitService } from './rate-limit.service';
import { UsersModule } from '../../modules/users/users.module';

/**
 * Global module that provides rate limiting services.
 * Services are exported so they can be injected in any module without explicit import.
 */
@Global()
@Module({
  imports: [UsersModule],
  controllers: [RateLimitController],
  providers: [IPBlockingService, IPWhitelistService, RateLimitService],
  exports: [IPBlockingService, IPWhitelistService, RateLimitService],
})
export class RateLimitingModule {}
