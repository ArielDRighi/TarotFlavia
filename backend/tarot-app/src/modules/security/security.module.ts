import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityEvent } from './entities/security-event.entity';
import { SecurityEventService } from './security-event.service';
import { SecurityEventsController } from './security-events.controller';
import { LoggerModule } from '../../common/logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([SecurityEvent]), LoggerModule],
  controllers: [SecurityEventsController],
  providers: [SecurityEventService],
  exports: [SecurityEventService],
})
export class SecurityModule {}
