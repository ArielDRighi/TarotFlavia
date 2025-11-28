import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanConfigController } from './plan-config.controller';
import { PlanConfigService } from './plan-config.service';
import { Plan } from './entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan])],
  controllers: [PlanConfigController],
  providers: [PlanConfigService],
  exports: [PlanConfigService],
})
export class PlanConfigModule {}
