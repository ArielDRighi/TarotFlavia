import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Services
import { AIProviderService } from './application/services/ai-provider.service';
import { PromptBuilderService } from './application/services/prompt-builder.service';

// Providers
import { GroqProvider } from './infrastructure/providers/groq.provider';
import { DeepSeekProvider } from './infrastructure/providers/deepseek.provider';
import { OpenAIProvider } from './infrastructure/providers/openai.provider';

// External dependencies for PromptBuilderService
import { TarotistaConfig } from '../tarotistas/infrastructure/entities/tarotista-config.entity';
import { TarotCard } from '../tarot/cards/entities/tarot-card.entity';
import { TarotistaCardMeaning } from '../tarotistas/infrastructure/entities/tarotista-card-meaning.entity';
import { Tarotista } from '../tarotistas/infrastructure/entities/tarotista.entity';

// External dependency for AIProviderService
import { AIUsageModule } from '../ai-usage/ai-usage.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      TarotistaConfig,
      TarotCard,
      TarotistaCardMeaning,
      Tarotista,
    ]),
    AIUsageModule,
  ],
  providers: [
    AIProviderService,
    PromptBuilderService,
    GroqProvider,
    DeepSeekProvider,
    OpenAIProvider,
  ],
  exports: [AIProviderService, PromptBuilderService],
})
export class AIModule {}
