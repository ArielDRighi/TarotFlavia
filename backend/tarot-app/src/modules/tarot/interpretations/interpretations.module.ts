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
import { PromptBuilderService } from './prompt-builder.service';
import { GroqProvider } from './providers/groq.provider';
import { DeepSeekProvider } from './providers/deepseek.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AIUsageModule } from '../../ai-usage/ai-usage.module';
import { TarotistaConfig } from '../../tarotistas/entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../../tarotistas/entities/tarotista-card-meaning.entity';
import { Tarotista } from '../../tarotistas/entities/tarotista.entity';
import { TarotCard } from '../cards/entities/tarot-card.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TarotInterpretation,
      CachedInterpretation,
      TarotistaConfig,
      TarotistaCardMeaning,
      Tarotista,
      TarotCard,
    ]),
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
    PromptBuilderService,
    GroqProvider,
    DeepSeekProvider,
    OpenAIProvider,
  ],
  exports: [
    InterpretationsService,
    AIProviderService,
    InterpretationCacheService,
    PromptBuilderService,
  ],
})
export class InterpretationsModule {}
