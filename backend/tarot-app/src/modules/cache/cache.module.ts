import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { CachedInterpretation } from './infrastructure/entities/cached-interpretation.entity';

// Services
import { InterpretationCacheService } from './application/services/interpretation-cache.service';
import { CacheCleanupService } from './application/services/cache-cleanup.service';

// Controllers
import { CacheAdminController } from './infrastructure/controllers/cache-admin.controller';

// Repositories
import { TypeOrmCacheRepository } from './infrastructure/repositories/typeorm-cache.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CachedInterpretation])],
  controllers: [CacheAdminController],
  providers: [
    InterpretationCacheService,
    CacheCleanupService,
    {
      provide: 'ICacheRepository',
      useClass: TypeOrmCacheRepository,
    },
  ],
  exports: [InterpretationCacheService, CacheCleanupService],
})
export class CacheModule {}
