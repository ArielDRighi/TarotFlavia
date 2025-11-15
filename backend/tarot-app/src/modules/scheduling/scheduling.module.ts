import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarotistAvailability, TarotistException, Session } from './entities';
import { AvailabilityService, SessionService } from './services';
import {
  TarotistSchedulingController,
  UserSchedulingController,
} from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TarotistAvailability,
      TarotistException,
      Session,
    ]),
  ],
  controllers: [TarotistSchedulingController, UserSchedulingController],
  providers: [AvailabilityService, SessionService],
  exports: [AvailabilityService, SessionService],
})
export class SchedulingModule {}
