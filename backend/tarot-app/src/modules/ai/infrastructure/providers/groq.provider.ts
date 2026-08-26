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
import {
  DEFAULT_GROQ_MODEL,
  GROQ_REASONING_EFFORT,
  GROQ_REASONING_MODEL_PREFIX,
} from '../../domain/constants/ai-models.constants';

@Injectable()
export class GroqProvider implements IAIProvider {
  private client: Groq | null = null;
  private readonly DEFAULT_MODEL = DEFAULT_GROQ_MODEL;
  private readonly DEFAULT_TEMPERATURE = 0.6; // Lower than GPT for more deterministic responses
  private readonly TIMEOUT = 10000; // 10s - Groq is ultra-fast

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
    const timeout = this.createTimeout(this.TIMEOUT);

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
          // Solo los gpt-oss aceptan este parámetro; mandárselo a los demás
          // modelos del catálogo rompería el "migrar es cambiar la env var".
          ...(model.startsWith(GROQ_REASONING_MODEL_PREFIX)
            ? { reasoning_effort: GROQ_REASONING_EFFORT }
            : {}),
        }),
        timeout.promise,
      ]);

      if (!response || typeof response === 'string') {
        throw new AIProviderException(
          AIProviderType.GROQ,
          AIErrorType.TIMEOUT,
          `Groq request timeout exceeded (>${this.TIMEOUT / 1000}s)`,
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

      // Check for 404 (modelo inexistente o sin acceso)
      // NO es reintentable: el modelo no va a aparecer entre reintento y
      // reintento. Marcarlo como tal hacía que cada llamada gastara los 3
      // intentos de MAX_RETRY_ATTEMPTS antes de pasar al siguiente proveedor
      // — exactamente lo que pasó en la caída del 26-ago-2026.
      if (
        statusCode === 404 ||
        errorMessage.toLowerCase().includes('model_not_found') ||
        errorMessage.toLowerCase().includes('does not exist')
      ) {
        throw new AIProviderException(
          AIProviderType.GROQ,
          AIErrorType.PROVIDER_UNAVAILABLE,
          `Groq model unavailable: ${errorMessage}`,
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
    } finally {
      timeout.cancel();
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      // Simple test call to verify connectivity
      const timeout = this.createTimeout(5000);
      try {
        await Promise.race([
          this.client.chat.completions.create({
            model: this.DEFAULT_MODEL,
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 5,
          }),
          timeout.promise,
        ]);
      } finally {
        timeout.cancel();
      }
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

  /**
   * Crea la promesa de timeout junto con su cancelación.
   *
   * `Promise.race` no cancela al perdedor: sin el `clearTimeout` explícito,
   * cada llamada exitosa dejaba un `setTimeout` retenido hasta vencer, que
   * mantiene vivo el event loop y ensucia el apagado del proceso.
   */
  private createTimeout(ms: number): {
    promise: Promise<never>;
    cancel: () => void;
  } {
    let handle: NodeJS.Timeout | undefined;

    const promise = new Promise<never>((_, reject) => {
      handle = setTimeout(
        () => reject(new Error(`Timeout exceeded (>${ms / 1000}s)`)),
        ms,
      );
    });

    return { promise, cancel: () => clearTimeout(handle) };
  }
}
