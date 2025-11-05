import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { InterpretationsService } from './interpretations.service';
import { InterpretationsController } from './interpretations.controller';
import { TarotInterpretation } from './entities/tarot-interpretation.entity';
import { CachedInterpretation } from './entities/cached-interpretation.entity';
import { AIProviderService } from './ai-provider.service';
import { InterpretationCacheService } from './interpretation-cache.service';
import { CacheCleanupService } from './cache-cleanup.service';
import { GroqProvider } from './providers/groq.provider';
import { DeepSeekProvider } from './providers/deepseek.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AIUsageModule } from '../../ai-usage/ai-usage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TarotInterpretation, CachedInterpretation]),
    HttpModule,
    ConfigModule,
    AIUsageModule,
  ],
  controllers: [InterpretationsController],
  providers: [
    InterpretationsService,
    AIProviderService,
    InterpretationCacheService,
    CacheCleanupService,
    GroqProvider,
    DeepSeekProvider,
    OpenAIProvider,
  ],
  exports: [
    InterpretationsService,
    AIProviderService,
    InterpretationCacheService,
  ],
})
export class InterpretationsModule {}
