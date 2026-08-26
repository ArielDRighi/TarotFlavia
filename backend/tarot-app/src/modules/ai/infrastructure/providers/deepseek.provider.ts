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
import {
  DEEPSEEK_THINKING_DISABLED,
  DEFAULT_DEEPSEEK_MODEL,
} from '../../domain/constants/ai-models.constants';

/**
 * Parámetros de chat con la extensión `thinking` de DeepSeek.
 *
 * El SDK de OpenAI no la tipa porque es propia de DeepSeek, así que se declara
 * acá para pasarla sin recurrir a `any` ni a `@ts-ignore`.
 * Doc: https://api-docs.deepseek.com/guides/thinking_mode
 */
export type DeepSeekChatCompletionParams =
  OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming & {
    thinking: { type: 'enabled' | 'disabled' };
  };

@Injectable()
export class DeepSeekProvider implements IAIProvider {
  private client: OpenAI | null = null;
  private readonly DEFAULT_MODEL = DEFAULT_DEEPSEEK_MODEL;
  private readonly DEFAULT_TEMPERATURE = 0.6; // Más determinista que el default de OpenAI
  /**
   * Timeout de la llamada a DeepSeek.
   *
   * El presupuesto NO lo fija este provider sino el cliente: el axios del
   * frontend aborta a los 30s (`frontend/src/lib/api/axios-config.ts`). Un
   * timeout más largo que eso solo consigue que el backend siga trabajando en
   * una lectura que el usuario ya vio fallar (y que igual se le descuenta del
   * límite diario).
   *
   * 25s deja margen sobre los 14–17,6s medidos el 26-ago-2026 con el prompt
   * real de una tirada de 3 cartas y el modo pensante apagado, y entra en el
   * presupuesto del cliente. Los 15s que había antes cortaban toda tirada.
   */
  private readonly TIMEOUT = 25000; // 25s
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
    const timeout = this.createTimeout(this.TIMEOUT);

    try {
      const params: DeepSeekChatCompletionParams = {
        model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature,
        max_tokens: maxTokens,
        thinking: DEEPSEEK_THINKING_DISABLED,
      };

      const response = await Promise.race([
        this.client.chat.completions.create(params),
        timeout.promise,
      ]);

      if (!response || typeof response === 'string') {
        throw new AIProviderException(
          AIProviderType.DEEPSEEK,
          AIErrorType.TIMEOUT,
          `DeepSeek request timeout exceeded (>${this.TIMEOUT / 1000}s)`,
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

      // Check for 402 (Insufficient balance - FREE TOKENS EXHAUSTED)
      // This is NOT retryable - we don't want to fallback to paid providers
      if (
        statusCode === 402 ||
        errorMessage.includes('402') ||
        errorMessage.toLowerCase().includes('insufficient balance') ||
        errorMessage.toLowerCase().includes('insufficient_balance') ||
        errorMessage.toLowerCase().includes('quota exceeded') ||
        errorMessage.toLowerCase().includes('balance')
      ) {
        throw new AIProviderException(
          AIProviderType.DEEPSEEK,
          AIErrorType.INSUFFICIENT_BALANCE,
          `DeepSeek free credits exhausted: ${errorMessage}. Provider disabled to prevent paid usage.`,
          false, // NOT retryable - prevents fallback to paid providers
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
    } finally {
      timeout.cancel();
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      // Misma configuración que la generación real: una sonda que no ejercita
      // el modo no pensante puede dar un falso resultado justo cuando se está
      // verificando el despliegue.
      const probe: DeepSeekChatCompletionParams = {
        model: this.DEFAULT_MODEL,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
        thinking: DEEPSEEK_THINKING_DISABLED,
      };
      const timeout = this.createTimeout(5000);
      try {
        await Promise.race([
          this.client.chat.completions.create(probe),
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
    return AIProviderType.DEEPSEEK;
  }

  isConfigured(): boolean {
    return this.client !== null;
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
