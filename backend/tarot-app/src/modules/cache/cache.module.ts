import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { CachedInterpretation } from './infrastructure/entities/cached-interpretation.entity';
import { CacheMetric } from './infrastructure/entities/cache-metrics.entity';

// Services
import { InterpretationCacheService } from './application/services/interpretation-cache.service';
import { CacheCleanupService } from './application/services/cache-cleanup.service';
import { CacheStrategyService } from './application/services/cache-strategy.service';
import { CacheAnalyticsService } from './application/services/cache-analytics.service';
import { CacheWarmingService } from './application/services/cache-warming.service';

// Controllers
import { CacheAdminController } from './infrastructure/controllers/cache-admin.controller';

// External modules
import { InterpretationsModule } from '../tarot/interpretations/interpretations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CachedInterpretation, CacheMetric]),
    forwardRef(() => InterpretationsModule),
  ],
  controllers: [CacheAdminController],
  providers: [
    InterpretationCacheService,
    CacheCleanupService,
    CacheStrategyService,
    CacheAnalyticsService,
    CacheWarmingService,
  ],
  exports: [
    InterpretationCacheService,
    CacheCleanupService,
    CacheStrategyService,
    CacheAnalyticsService,
    CacheWarmingService,
  ],
})
export class CacheModule {}
