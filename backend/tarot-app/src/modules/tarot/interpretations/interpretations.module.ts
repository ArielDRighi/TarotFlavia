import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { InterpretationsService } from './interpretations.service';
import { InterpretationsController } from './interpretations.controller';
import { TarotInterpretation } from './entities/tarot-interpretation.entity';
import { AIProviderService } from './ai-provider.service';
import { GroqProvider } from './providers/groq.provider';
import { DeepSeekProvider } from './providers/deepseek.provider';
import { OpenAIProvider } from './providers/openai.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([TarotInterpretation]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [InterpretationsController],
  providers: [
    InterpretationsService,
    AIProviderService,
    GroqProvider,
    DeepSeekProvider,
    OpenAIProvider,
  ],
  exports: [InterpretationsService, AIProviderService],
})
export class InterpretationsModule {}
