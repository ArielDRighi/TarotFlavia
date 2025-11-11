import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { CachedInterpretation } from './infrastructure/entities/cached-interpretation.entity';

// Services
import { InterpretationCacheService } from './application/services/interpretation-cache.service';
import { CacheCleanupService } from './application/services/cache-cleanup.service';

// Controllers
import { CacheAdminController } from './infrastructure/controllers/cache-admin.controller';

// TODO: TASK-ARCH-004 - Enable repository pattern
// import { TypeOrmCacheRepository } from './infrastructure/repositories/typeorm-cache.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CachedInterpretation])],
  controllers: [CacheAdminController],
  providers: [
    InterpretationCacheService,
    CacheCleanupService,
    // TODO: TASK-ARCH-004 (Repository Pattern) - Refactor InterpretationCacheService
    // to use ICacheRepository instead of TypeORM directly. Currently the service
    // uses TypeORM-specific methods (createQueryBuilder, findOne with relations, etc.)
    // that would require significant refactoring to abstract behind the repository interface.
    // This is deferred to Phase 2 where we apply explicit repository pattern across all modules.
  ],
  exports: [InterpretationCacheService, CacheCleanupService],
})
export class CacheModule {}
