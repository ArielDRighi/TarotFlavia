import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NumerologyService } from './numerology.service';
import { NumerologyController } from './numerology.controller';
import { NumerologyInterpretation } from './entities/numerology-interpretation.entity';
import { RequiresPremiumForNumerologyAIGuard } from './guards/requires-premium-for-numerology-ai.guard';
import { AIModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';
import { AIUsageModule } from '../ai-usage/ai-usage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NumerologyInterpretation]),
    AIModule,
    UsersModule,
    AIUsageModule,
  ],
  providers: [NumerologyService, RequiresPremiumForNumerologyAIGuard],
  controllers: [NumerologyController],
  exports: [NumerologyService],
})
export class NumerologyModule {}
