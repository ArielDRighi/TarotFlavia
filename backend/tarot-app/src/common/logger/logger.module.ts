import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { CorrelationIdService } from './correlation-id.service';

@Global()
@Module({
  providers: [LoggerService, CorrelationIdService],
  exports: [LoggerService, CorrelationIdService],
})
export class LoggerModule {}
