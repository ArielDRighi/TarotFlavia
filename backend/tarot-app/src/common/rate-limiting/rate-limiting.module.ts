import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPBlockingService } from '../services/ip-blocking.service';
import { IPWhitelistService } from '../services/ip-whitelist.service';
import { RateLimitController } from './rate-limit.controller';
import { RateLimitService } from './rate-limit.service';
import { IpBlock } from '../entities/ip-block.entity';
import { TypeOrmIpBlockRepository } from '../repositories/typeorm-ip-block.repository';
import { UsersModule } from '../../modules/users/users.module';

/**
 * Global module that provides rate limiting services.
 * Services are exported so they can be injected in any module without explicit import.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([IpBlock]), UsersModule],
  controllers: [RateLimitController],
  providers: [
    TypeOrmIpBlockRepository,
    {
      provide: 'IIpBlockRepository',
      useExisting: TypeOrmIpBlockRepository,
    },
    {
      provide: IPBlockingService,
      useFactory: (ipBlockRepository: TypeOrmIpBlockRepository) =>
        new IPBlockingService(ipBlockRepository),
      inject: [TypeOrmIpBlockRepository],
    },
    IPWhitelistService,
    RateLimitService,
  ],
  exports: [IPBlockingService, IPWhitelistService, RateLimitService],
})
export class RateLimitingModule {}
