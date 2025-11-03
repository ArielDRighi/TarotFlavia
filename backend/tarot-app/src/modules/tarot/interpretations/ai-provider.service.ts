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
import { AIUsageService } from '../../ai-usage/ai-usage.service';
import {
  AIProvider,
  AIUsageStatus,
} from '../../ai-usage/entities/ai-usage-log.entity';

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
    private readonly aiUsageService: AIUsageService,
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
  async generateCompletion(
    messages: AIMessage[],
    userId?: number | null,
    readingId?: number | null,
  ): Promise<AIResponse> {
    const errors: Array<{ provider: string; error: string }> = [];
    let fallbackUsed = false;
    let providerIndex = 0;

    for (const provider of this.providers) {
      const startTime = Date.now();
      const providerType = provider.getProviderType();

      try {
        this.logger.log(`Attempting completion with ${providerType}`);

        const response = await provider.generateCompletion(messages, {});
        const durationMs = Date.now() - startTime;

        this.logger.log(
          `Success with ${response.provider} (${durationMs}ms, ${response.tokensUsed.total} tokens)`,
        );

        // Log successful call
        const costUsd = this.aiUsageService.calculateCost(
          this.mapProviderToEnum(response.provider),
          response.tokensUsed.prompt,
          response.tokensUsed.completion,
        );

        await this.aiUsageService.createLog({
          userId: userId || null,
          readingId: readingId || null,
          provider: this.mapProviderToEnum(response.provider),
          modelUsed: response.model,
          promptTokens: response.tokensUsed.prompt,
          completionTokens: response.tokensUsed.completion,
          totalTokens: response.tokensUsed.total,
          costUsd,
          durationMs,
          status: AIUsageStatus.SUCCESS,
          errorMessage: null,
          fallbackUsed,
        });

        return response;
      } catch (error) {
        const durationMs = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          provider: providerType,
          error: errorMessage,
        });

        // Log failed call
        await this.aiUsageService.createLog({
          userId: userId || null,
          readingId: readingId || null,
          provider: this.mapProviderToEnum(providerType),
          modelUsed: 'unknown',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          costUsd: 0,
          durationMs,
          status: AIUsageStatus.ERROR,
          errorMessage,
          fallbackUsed,
        });

        if (process.env.NODE_ENV !== 'test') {
          this.logger.warn(`${providerType} failed: ${errorMessage}`);
        }

        providerIndex++;
        if (providerIndex > 0) {
          fallbackUsed = true;
        }
      }
    }

    // All providers failed
    const errorSummary = errors
      .map((e) => `${e.provider}: ${e.error}`)
      .join('; ');
    throw new Error(`All AI providers failed: ${errorSummary}`);
  }

  private mapProviderToEnum(providerType: AIProviderType | string): AIProvider {
    const typeStr =
      typeof providerType === 'string' ? providerType : providerType;
    switch (typeStr.toLowerCase()) {
      case 'groq':
        return AIProvider.GROQ;
      case 'deepseek':
        return AIProvider.DEEPSEEK;
      case 'openai':
        return AIProvider.OPENAI;
      case 'gemini':
        return AIProvider.GEMINI;
      default:
        return AIProvider.GROQ;
    }
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
