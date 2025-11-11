import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai'; // DeepSeek uses OpenAI-compatible API
import {
  AIProviderType,
  AIProviderConfig,
  AIMessage,
  AIResponse,
  IAIProvider,
} from '../../domain/interfaces/ai-provider.interface';
import { AIProviderException, AIErrorType } from '../errors/ai-error.types';

@Injectable()
export class DeepSeekProvider implements IAIProvider {
  private client: OpenAI | null = null;
  private readonly DEFAULT_MODEL = 'deepseek-chat';
  private readonly DEFAULT_TEMPERATURE = 0.6; // Similar to Llama
  private readonly TIMEOUT = 15000; // 15s
  private readonly BASE_URL = 'https://api.deepseek.com';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    if (apiKey && apiKey.startsWith('sk-')) {
      this.client = new OpenAI({
        apiKey,
        baseURL: this.BASE_URL,
      });
    }
  }

  async generateCompletion(
    messages: AIMessage[],
    config: Partial<AIProviderConfig>,
  ): Promise<AIResponse> {
    if (!this.client) {
      throw new AIProviderException(
        AIProviderType.DEEPSEEK,
        AIErrorType.INVALID_KEY,
        'DeepSeek client not initialized - API key missing',
        false,
        new Error('API key missing'),
      );
    }

    const model =
      config.model ||
      this.configService.get<string>('DEEPSEEK_MODEL') ||
      this.DEFAULT_MODEL;
    const temperature = config.temperature ?? this.DEFAULT_TEMPERATURE;
    const maxTokens = config.maxTokens ?? this.calculateMaxTokens(messages);

    const startTime = Date.now();

    try {
      const response = await Promise.race([
        this.client.chat.completions.create({
          model,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature,
          max_tokens: maxTokens,
        }),
        this.timeout(this.TIMEOUT),
      ]);

      if (!response || typeof response === 'string') {
        throw new AIProviderException(
          AIProviderType.DEEPSEEK,
          AIErrorType.TIMEOUT,
          'DeepSeek request timeout exceeded (>15s)',
          true,
          new Error('Timeout'),
        );
      }

      const durationMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';

      if (!content) {
        throw new AIProviderException(
          AIProviderType.DEEPSEEK,
          AIErrorType.SERVER_ERROR,
          'Empty response from DeepSeek',
          true,
          new Error('Empty response'),
        );
      }

      return {
        content,
        provider: AIProviderType.DEEPSEEK,
        model,
        tokensUsed: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0,
        },
        durationMs,
      };
    } catch (error) {
      if (error instanceof AIProviderException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Check error object properties first, then fallback to string matching
      const errorObj = error as Error & {
        status?: number;
        statusCode?: number;
        code?: string;
        response?: { status?: number };
      };
      const statusCode =
        errorObj?.status || errorObj?.statusCode || errorObj?.response?.status;

      // Check for 401 (Invalid API key)
      if (
        statusCode === 401 ||
        errorMessage.includes('401') ||
        errorMessage.includes('API key')
      ) {
        throw new AIProviderException(
          AIProviderType.DEEPSEEK,
          AIErrorType.INVALID_KEY,
          `DeepSeek API key invalid: ${errorMessage}`,
          false,
          error as Error,
        );
      }

      // Check for 429 (Rate limit)
      if (
        statusCode === 429 ||
        errorMessage.includes('429') ||
        errorMessage.toLowerCase().includes('rate limit')
      ) {
        throw new AIProviderException(
          AIProviderType.DEEPSEEK,
          AIErrorType.RATE_LIMIT,
          `DeepSeek rate limit exceeded: ${errorMessage}`,
          true,
          error as Error,
        );
      }

      // Check for 5xx (Server errors)
      if (
        (statusCode && statusCode >= 500) ||
        errorMessage.includes('500') ||
        errorMessage.includes('502') ||
        errorMessage.includes('503')
      ) {
        throw new AIProviderException(
          AIProviderType.DEEPSEEK,
          AIErrorType.SERVER_ERROR,
          `DeepSeek server error: ${errorMessage}`,
          true,
          error as Error,
        );
      }

      // Check for timeout
      if (
        errorObj?.code === 'ETIMEDOUT' ||
        errorMessage.toLowerCase().includes('timeout')
      ) {
        throw new AIProviderException(
          AIProviderType.DEEPSEEK,
          AIErrorType.TIMEOUT,
          `DeepSeek request timeout: ${errorMessage}`,
          true,
          error as Error,
        );
      }

      if (
        errorMessage.includes('context') ||
        errorMessage.includes('too long')
      ) {
        throw new AIProviderException(
          AIProviderType.DEEPSEEK,
          AIErrorType.CONTEXT_LENGTH,
          `DeepSeek context too long: ${errorMessage}`,
          false,
          error as Error,
        );
      }

      throw new AIProviderException(
        AIProviderType.DEEPSEEK,
        AIErrorType.NETWORK_ERROR,
        `DeepSeek API error: ${errorMessage}`,
        true,
        error as Error,
      );
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await Promise.race([
        this.client.chat.completions.create({
          model: this.DEFAULT_MODEL,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5,
        }),
        this.timeout(5000),
      ]);
      return true;
    } catch {
      return false;
    }
  }

  getProviderType(): AIProviderType {
    return AIProviderType.DEEPSEEK;
  }

  /**
   * Calculate appropriate max_tokens based on card count
   * DeepSeek is economical - moderate limits
   */
  private calculateMaxTokens(messages: AIMessage[]): number {
    const userMessage = messages.find((m) => m.role === 'user')?.content || '';
    const cardCount = (userMessage.match(/Posición \d+:/g) || []).length;

    if (cardCount === 1) return 450;
    if (cardCount <= 3) return 700;
    if (cardCount <= 5) return 1000;
    return 1200; // 10-card spreads
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout exceeded')), ms),
    );
  }
}
