import { Module, Global } from '@nestjs/common';
import { IPBlockingService } from '../services/ip-blocking.service';
import { IPWhitelistService } from '../services/ip-whitelist.service';

/**
 * Global module that provides rate limiting services.
 * Services are exported so they can be injected in any module without explicit import.
 */
@Global()
@Module({
  providers: [IPBlockingService, IPWhitelistService],
  exports: [IPBlockingService, IPWhitelistService],
})
export class RateLimitingModule {}
