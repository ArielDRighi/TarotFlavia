import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProviderType,
  AIMessage,
  AIResponse,
  IAIProvider,
} from './ai-provider.interface';
import { GroqProvider } from './providers/groq.provider';
import { DeepSeekProvider } from './providers/deepseek.provider';
import { OpenAIProvider } from './providers/openai.provider';

/**
 * AI Provider Service
 * Orchestrates multiple AI providers with automatic fallback
 * Priority: Groq (free) → DeepSeek (cheap) → OpenAI (fallback)
 */
@Injectable()
export class AIProviderService {
  private readonly logger = new Logger(AIProviderService.name);
  private providers: IAIProvider[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly groqProvider: GroqProvider,
    private readonly deepseekProvider: DeepSeekProvider,
    private readonly openaiProvider: OpenAIProvider,
  ) {
    // Initialize providers in priority order
    this.providers = [
      this.groqProvider, // Primary: Free and fast
      this.deepseekProvider, // Secondary: Low cost
      this.openaiProvider, // Tertiary: Fallback
    ];
  }

  /**
   * Generate completion with automatic fallback
   * Tries providers in priority order until one succeeds
   */
  async generateCompletion(messages: AIMessage[]): Promise<AIResponse> {
    const errors: Array<{ provider: string; error: string }> = [];

    for (const provider of this.providers) {
      try {
        this.logger.log(
          `Attempting completion with ${provider.getProviderType()}`,
        );

        const response = await provider.generateCompletion(messages, {});

        this.logger.log(
          `Success with ${response.provider} (${response.durationMs}ms, ${response.tokensUsed.total} tokens)`,
        );

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          provider: provider.getProviderType(),
          error: errorMessage,
        });

        if (process.env.NODE_ENV !== 'test') {
          this.logger.warn(
            `${provider.getProviderType()} failed: ${errorMessage}`,
          );
        }
      }
    }

    // All providers failed
    const errorSummary = errors
      .map((e) => `${e.provider}: ${e.error}`)
      .join('; ');
    throw new Error(`All AI providers failed: ${errorSummary}`);
  }

  /**
   * Get status of all providers
   */
  async getProvidersStatus(): Promise<
    Array<{ provider: AIProviderType; available: boolean }>
  > {
    const statuses = await Promise.all(
      this.providers.map(async (provider) => ({
        provider: provider.getProviderType(),
        available: await provider.isAvailable(),
      })),
    );

    return statuses;
  }

  /**
   * Get primary provider (first available)
   */
  async getPrimaryProvider(): Promise<AIProviderType | null> {
    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        return provider.getProviderType();
      }
    }
    return null;
  }
}
