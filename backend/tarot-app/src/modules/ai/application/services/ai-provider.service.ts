import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProviderType,
  AIMessage,
  AIResponse,
  IAIProvider,
} from '../../domain/interfaces/ai-provider.interface';
import { GroqProvider } from '../../infrastructure/providers/groq.provider';
import { DeepSeekProvider } from '../../infrastructure/providers/deepseek.provider';
import { OpenAIProvider } from '../../infrastructure/providers/openai.provider';
import { AIUsageService } from '../../../ai-usage/ai-usage.service';
import {
  AIProvider,
  AIUsageStatus,
} from '../../../ai-usage/entities/ai-usage-log.entity';
import {
  CircuitBreaker,
  CircuitBreakerState,
} from '../../infrastructure/errors/circuit-breaker.utils';
import { retryWithBackoff } from '../../infrastructure/errors/retry.utils';

/**
 * AI Provider Service
 * Orchestrates multiple AI providers with automatic fallback
 * Priority: Groq (free) → DeepSeek (cheap) → OpenAI (fallback)
 */
@Injectable()
export class AIProviderService {
  private readonly logger = new Logger(AIProviderService.name);
  private providers: IAIProvider[] = [];
  private circuitBreakers: Map<AIProviderType, CircuitBreaker> = new Map();

  // Configuration constants
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly CIRCUIT_BREAKER_FAILURE_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

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

    // Initialize circuit breakers for each provider
    this.circuitBreakers.set(
      AIProviderType.GROQ,
      new CircuitBreaker(
        AIProviderType.GROQ,
        this.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
        this.CIRCUIT_BREAKER_TIMEOUT_MS,
      ),
    );
    this.circuitBreakers.set(
      AIProviderType.DEEPSEEK,
      new CircuitBreaker(
        AIProviderType.DEEPSEEK,
        this.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
        this.CIRCUIT_BREAKER_TIMEOUT_MS,
      ),
    );
    this.circuitBreakers.set(
      AIProviderType.OPENAI,
      new CircuitBreaker(
        AIProviderType.OPENAI,
        this.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
        this.CIRCUIT_BREAKER_TIMEOUT_MS,
      ),
    );
  }

  /**
   * Generate completion with automatic fallback, retry, and circuit breaker
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
      const providerType = provider.getProviderType();
      const circuitBreaker = this.circuitBreakers.get(providerType);

      // Check circuit breaker before attempting
      if (circuitBreaker && !circuitBreaker.canExecute()) {
        this.logger.warn(
          `Circuit breaker OPEN for ${providerType}, skipping to next provider`,
        );
        errors.push({
          provider: providerType,
          error: 'Circuit breaker open',
        });
        providerIndex++;
        if (providerIndex > 0) {
          fallbackUsed = true;
        }
        continue;
      }

      const startTime = Date.now();

      try {
        this.logger.log(`Attempting completion with ${providerType}`);

        // Wrap provider call with retry logic
        const response = await retryWithBackoff(async () => {
          return await provider.generateCompletion(messages, {});
        }, this.MAX_RETRY_ATTEMPTS);

        const durationMs = Date.now() - startTime;

        this.logger.log(
          `Success with ${response.provider} (${response.durationMs}ms, ${response.tokensUsed.total} tokens)`,
        );

        // Record success in circuit breaker
        if (circuitBreaker) {
          circuitBreaker.recordSuccess();
        }

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

        // Record failure in circuit breaker
        if (circuitBreaker) {
          circuitBreaker.recordFailure();
        }

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
          this.logger.warn(
            `${providerType} failed after retries: ${errorMessage}`,
          );

          // Log circuit breaker state change
          if (
            circuitBreaker &&
            circuitBreaker.getState() === CircuitBreakerState.OPEN
          ) {
            this.logger.error(
              `⚠️ Circuit breaker OPENED for ${providerType} after ${circuitBreaker.getStats().consecutiveFailures} failures`,
            );
          }
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
    const typeStr = String(providerType);
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

  /**
   * Get circuit breaker statistics for all providers
   */
  getCircuitBreakerStats() {
    const stats: ReturnType<CircuitBreaker['getStats']>[] = [];
    for (const [, circuitBreaker] of this.circuitBreakers) {
      stats.push(circuitBreaker.getStats());
    }
    return stats;
  }
}
