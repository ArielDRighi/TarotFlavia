import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import {
  AIProviderType,
  AIProviderConfig,
  AIMessage,
  AIResponse,
  IAIProvider,
} from '../../domain/interfaces/ai-provider.interface';
import { AIProviderException, AIErrorType } from '../errors/ai-error.types';

@Injectable()
export class GroqProvider implements IAIProvider {
  private client: Groq | null = null;
  /**
   * Modelo por defecto de Groq.
   *
   * ⚠️ 26-ago-2026: Groq decomisionó toda la familia Llama y
   * `llama-3.3-70b-versatile` dejó de existir en la cuenta (404
   * `model_not_found`), lo que dejó a producción sin IA. El reemplazo es
   * `openai/gpt-oss-120b`, verificado contra `/v1/models` de la cuenta.
   * Antes de cambiarlo, confirmá que el modelo siga en el catálogo.
   */
  private readonly DEFAULT_MODEL = 'openai/gpt-oss-120b';
  private readonly DEFAULT_TEMPERATURE = 0.6; // Lower than GPT for more deterministic responses
  private readonly TIMEOUT = 10000; // 10s - Groq is ultra-fast

  /**
   * Esfuerzo de razonamiento de los modelos gpt-oss.
   *
   * Medido el 26-ago-2026 con el prompt real de horóscopo: sin este parámetro
   * el modelo gasta ~565 tokens de razonamiento por llamada (851 de completion
   * sobre un tope de 1.000, al borde de truncar el JSON). Con `'low'` baja a 15
   * tokens de razonamiento y 335 de completion, y el total por llamada cae de
   * 1.874 a 1.345 tokens — lo que además hace entrar la tanda de 12 signos en
   * el techo de 8.000 tokens/minuto del tier gratuito.
   */
  private readonly REASONING_EFFORT = 'low' as const;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (apiKey && apiKey.startsWith('gsk_')) {
      this.client = new Groq({ apiKey });
    }
  }

  async generateCompletion(
    messages: AIMessage[],
    config: Partial<AIProviderConfig>,
  ): Promise<AIResponse> {
    if (!this.client) {
      throw new AIProviderException(
        AIProviderType.GROQ,
        AIErrorType.INVALID_KEY,
        'Groq client not initialized - API key missing',
        false,
        new Error('API key missing'),
      );
    }

    const model =
      config.model ||
      this.configService.get<string>('GROQ_MODEL') ||
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
          reasoning_effort: this.REASONING_EFFORT,
        }),
        this.timeout(this.TIMEOUT),
      ]);

      if (!response || typeof response === 'string') {
        throw new AIProviderException(
          AIProviderType.GROQ,
          AIErrorType.TIMEOUT,
          'Groq request timeout exceeded (>10s)',
          true,
          new Error('Timeout'),
        );
      }

      const durationMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';

      if (!content) {
        throw new AIProviderException(
          AIProviderType.GROQ,
          AIErrorType.SERVER_ERROR,
          'Empty response from Groq',
          true,
          new Error('Empty response'),
        );
      }

      return {
        content,
        provider: AIProviderType.GROQ,
        model,
        tokensUsed: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0,
        },
        durationMs,
      };
    } catch (error) {
      // If already AIProviderException, rethrow
      if (error instanceof AIProviderException) {
        throw error;
      }

      // Handle Groq SDK specific errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Check error object properties first, then fallback to string matching
      // Note: Groq SDK doesn't expose structured error codes, so we combine both approaches
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
          AIProviderType.GROQ,
          AIErrorType.INVALID_KEY,
          `Groq API key invalid: ${errorMessage}`,
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
          AIProviderType.GROQ,
          AIErrorType.RATE_LIMIT,
          `Groq rate limit exceeded: ${errorMessage}`,
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
          AIProviderType.GROQ,
          AIErrorType.SERVER_ERROR,
          `Groq server error: ${errorMessage}`,
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
          AIProviderType.GROQ,
          AIErrorType.TIMEOUT,
          `Groq request timeout: ${errorMessage}`,
          true,
          error as Error,
        );
      }

      if (
        errorMessage.includes('context') ||
        errorMessage.includes('too long')
      ) {
        throw new AIProviderException(
          AIProviderType.GROQ,
          AIErrorType.CONTEXT_LENGTH,
          `Groq context too long: ${errorMessage}`,
          false,
          error as Error,
        );
      }

      // Default to network error for unknown errors
      throw new AIProviderException(
        AIProviderType.GROQ,
        AIErrorType.NETWORK_ERROR,
        `Groq API error: ${errorMessage}`,
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
      // Simple test call to verify connectivity
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
    return AIProviderType.GROQ;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Calculate appropriate max_tokens based on card count
   * Groq is free, so we can be more generous
   */
  private calculateMaxTokens(messages: AIMessage[]): number {
    // Estimate card count from user message length
    const userMessage = messages.find((m) => m.role === 'user')?.content || '';
    const cardCount = (userMessage.match(/Posición \d+:/g) || []).length;

    if (cardCount === 1) return 500;
    if (cardCount <= 3) return 800;
    if (cardCount <= 5) return 1200;
    return 1500; // 10-card spreads
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout exceeded')), ms),
    );
  }
}
