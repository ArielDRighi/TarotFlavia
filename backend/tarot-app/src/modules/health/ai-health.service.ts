import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { AIProviderService } from '../ai/application/services/ai-provider.service';
import {
  DEEPSEEK_THINKING_DISABLED,
  DEFAULT_DEEPSEEK_MODEL,
  DEFAULT_GROQ_MODEL,
  GROQ_FREE_TIER_REQUESTS_PER_DAY,
} from '../ai/domain/constants/ai-models.constants';
import { DeepSeekChatCompletionParams } from '../ai/infrastructure/providers/deepseek.provider';

export interface AIProviderHealth {
  provider: string;
  configured: boolean;
  status: 'ok' | 'error' | 'not_configured';
  model?: string;
  error?: string;
  responseTime?: number;
  rateLimits?: {
    remaining?: number;
    limit?: number;
    reset?: string;
  };
}

/** Las tres sondas, en el orden en que las lanza `probeAllProviders()`. */
type ProviderProbes = [AIProviderHealth, AIProviderHealth, AIProviderHealth];

export interface AIHealthCheckResult {
  /** Hay credenciales para al menos un proveedor. */
  configured: boolean;
  /**
   * Al menos un proveedor **respondió** la sonda. Es lo único que dice si la
   * IA funciona: tener la API key seteada no alcanza (T-IA-004).
   */
  available: boolean;
  primary: AIProviderHealth;
  fallback: AIProviderHealth[];
  circuitBreakers?: ReturnType<AIProviderService['getCircuitBreakerStats']>;
  timestamp: string;
}

@Injectable()
export class AIHealthService {
  private readonly logger = new Logger(AIHealthService.name);
  private readonly GROQ_TIMEOUT = 10000; // 10s - Groq is ultra-fast
  private readonly DEEPSEEK_TIMEOUT = 15000; // 15s
  private readonly OPENAI_TIMEOUT = 30000; // 30s

  /**
   * Cada sonda es una llamada real a la API del proveedor y `/health` es
   * público y sin auth. Groq da **1.000 requests por día** en el tier gratuito
   * (medido, ver BACKLOG_INCIDENTE_IA_2026_08), así que un monitor a 1/min
   * gastaría 1.440 sondas diarias: el health se comería la cuota entera y se
   * auto-provocaría el 429 que después reporta como caída. Con 30s de TTL el
   * techo queda en ~2.880 sondas/día repartidas entre los tres proveedores,
   * y cualquier ráfaga de tráfico anónimo cuesta lo mismo que una sola.
   *
   * El `timestamp` de la respuesta es el de la sonda, no el del request, así
   * que la antigüedad del dato siempre está a la vista.
   */
  private readonly PROBE_CACHE_TTL_MS = 30000;

  private probeCache: {
    probedAt: number;
    probes: Promise<ProviderProbes>;
  } | null = null;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AIProviderService))
    private readonly aiProviderService?: AIProviderService,
  ) {}

  /**
   * Check Groq provider health (Primary - Free)
   */
  async checkGroqHealth(): Promise<AIProviderHealth> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    const model = this.configService.get<string>('GROQ_MODEL');

    if (!apiKey) {
      return {
        provider: 'groq',
        configured: false,
        status: 'error',
        error: 'API key not configured',
      };
    }

    if (!apiKey.startsWith('gsk_')) {
      // La credencial está, solo que mal escrita: `configured: true` para que
      // el proveedor entre en el reporte y el health diga *por qué* falla, en
      // vez de contestar "no hay ningún proveedor configurado" (T-IA-004).
      return {
        provider: 'groq',
        configured: true,
        status: 'error',
        model,
        error: 'Invalid API key format (must start with gsk_)',
      };
    }

    try {
      const startTime = Date.now();
      await this.testGroqConnection(apiKey);
      const responseTime = Date.now() - startTime;

      this.logger.log(`Groq health check passed (${responseTime}ms)`);

      return {
        provider: 'groq',
        configured: true,
        status: 'ok',
        model,
        responseTime,
        rateLimits: {
          // Tier gratuito, leído de los headers `x-ratelimit-*` el 26-ago-2026.
          // Antes decía 14.400: ese número ya no existe.
          limit: GROQ_FREE_TIER_REQUESTS_PER_DAY,
          remaining: undefined, // Will be populated from actual API response
        },
      };
    } catch (error) {
      const errorMessage = this.parseProviderError(error, 'groq');
      if (process.env.NODE_ENV !== 'test') {
        this.logger.error(`Groq health check failed: ${errorMessage}`);
      }

      return {
        provider: 'groq',
        configured: true,
        status: 'error',
        model,
        error: errorMessage,
      };
    }
  }

  /**
   * Check DeepSeek provider health (Growth - Low Cost)
   */
  async checkDeepSeekHealth(): Promise<AIProviderHealth> {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    const model = this.configService.get<string>('DEEPSEEK_MODEL');

    if (!apiKey) {
      return {
        provider: 'deepseek',
        configured: false,
        status: 'not_configured',
      };
    }

    try {
      const startTime = Date.now();
      await this.testDeepSeekConnection(apiKey);
      const responseTime = Date.now() - startTime;

      this.logger.log(`DeepSeek health check passed (${responseTime}ms)`);

      return {
        provider: 'deepseek',
        configured: true,
        status: 'ok',
        model,
        responseTime,
      };
    } catch (error) {
      const errorMessage = this.parseProviderError(error, 'deepseek');
      if (process.env.NODE_ENV !== 'test') {
        this.logger.error(`DeepSeek health check failed: ${errorMessage}`);
      }

      return {
        provider: 'deepseek',
        configured: true,
        status: 'error',
        model,
        error: errorMessage,
      };
    }
  }

  /**
   * Check OpenAI provider health (Fallback/Premium - Optional)
   */
  async checkOpenAIHealth(): Promise<AIProviderHealth> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const model = this.configService.get<string>('OPENAI_MODEL');

    if (!apiKey) {
      return {
        provider: 'openai',
        configured: false,
        status: 'not_configured',
      };
    }

    if (!apiKey.startsWith('sk-')) {
      // Ídem Groq: una key mal escrita es un proveedor configurado y roto, no
      // un proveedor ausente.
      return {
        provider: 'openai',
        configured: true,
        status: 'error',
        model,
        error: 'Invalid API key format (must start with sk-)',
      };
    }

    try {
      const startTime = Date.now();
      await this.testOpenAIConnection(apiKey);
      const responseTime = Date.now() - startTime;

      this.logger.log(`OpenAI health check passed (${responseTime}ms)`);

      return {
        provider: 'openai',
        configured: true,
        status: 'ok',
        model,
        responseTime,
      };
    } catch (error) {
      const errorMessage = this.parseProviderError(error, 'openai');
      if (process.env.NODE_ENV !== 'test') {
        this.logger.error(`OpenAI health check failed: ${errorMessage}`);
      }

      return {
        provider: 'openai',
        configured: true,
        status: 'error',
        model,
        error: errorMessage,
      };
    }
  }

  /**
   * Check all configured AI providers
   */
  async checkAllProviders(): Promise<AIHealthCheckResult> {
    const { probedAt, probes } = this.getProbes();
    const [groq, deepseek, openai] = await probes;

    const fallback: AIProviderHealth[] = [];

    if (deepseek.configured) {
      fallback.push(deepseek);
    }

    if (openai.configured) {
      fallback.push(openai);
    }

    // Get circuit breaker statistics if available
    const circuitBreakers = this.aiProviderService
      ? this.aiProviderService.getCircuitBreakerStats()
      : undefined;

    // T-IA-004: `configured` y `available` son cosas distintas y confundirlas
    // fue lo que hizo que el health reportara `ok` con la IA caída. La única
    // señal de que la IA funciona es que algún proveedor haya respondido.
    const configured = groq.configured || fallback.length > 0;
    const available =
      groq.status === 'ok' || fallback.some((f) => f.status === 'ok');

    return {
      configured,
      available,
      primary: groq,
      fallback,
      circuitBreakers,
      timestamp: new Date(probedAt).toISOString(),
    };
  }

  /**
   * Devuelve las sondas vigentes, lanzándolas solo si el TTL venció. Se cachea
   * la **promesa**, no el resultado, así dos requests concurrentes comparten
   * una sola tanda de llamadas a los proveedores. Ningún `check*Health()`
   * rechaza (todos capturan), así que el cache nunca queda envenenado.
   */
  private getProbes(): { probedAt: number; probes: Promise<ProviderProbes> } {
    const now = Date.now();

    if (
      this.probeCache &&
      now - this.probeCache.probedAt < this.PROBE_CACHE_TTL_MS
    ) {
      return this.probeCache;
    }

    this.probeCache = {
      probedAt: now,
      probes: Promise.all([
        this.checkGroqHealth(),
        this.checkDeepSeekHealth(),
        this.checkOpenAIHealth(),
      ]),
    };

    return this.probeCache;
  }

  /**
   * Test Groq API connection with minimal request
   */
  private async testGroqConnection(apiKey: string): Promise<void> {
    const groq = new Groq({ apiKey });

    await Promise.race([
      groq.chat.completions.create({
        messages: [{ role: 'user', content: 'test' }],
        model:
          this.configService.get<string>('GROQ_MODEL') || DEFAULT_GROQ_MODEL,
        max_tokens: 1,
      }),
      this.timeout(this.GROQ_TIMEOUT),
    ]);
  }

  /**
   * Test DeepSeek API connection with minimal request
   */
  private async testDeepSeekConnection(apiKey: string): Promise<void> {
    // DeepSeek uses OpenAI-compatible API
    const deepseek = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
    });

    // Misma configuración que la generación real: con el modo pensante
    // encendido la sonda tarda 18–32s y daría un falso negativo.
    const probe: DeepSeekChatCompletionParams = {
      messages: [{ role: 'user', content: 'test' }],
      model:
        this.configService.get<string>('DEEPSEEK_MODEL') ||
        DEFAULT_DEEPSEEK_MODEL,
      max_tokens: 1,
      thinking: DEEPSEEK_THINKING_DISABLED,
    };

    await Promise.race([
      deepseek.chat.completions.create(probe),
      this.timeout(this.DEEPSEEK_TIMEOUT),
    ]);
  }

  /**
   * Test OpenAI API connection with minimal request
   */
  private async testOpenAIConnection(apiKey: string): Promise<void> {
    const openai = new OpenAI({ apiKey });

    await Promise.race([
      openai.chat.completions.create({
        messages: [{ role: 'user', content: 'test' }],
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini',
        max_tokens: 1,
      }),
      this.timeout(this.OPENAI_TIMEOUT),
    ]);
  }

  /**
   * Create a timeout promise
   */
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), ms),
    );
  }

  /**
   * Parse provider error into user-friendly message
   */
  private parseProviderError(error: unknown, provider: string): string {
    const err = error as {
      message?: string;
      response?: { status?: number };
    };

    if (err.message?.includes('timeout')) {
      return `Request timeout (${provider} took too long to respond)`;
    }

    if (err.response?.status === 401) {
      return 'Invalid API key (authentication failed)';
    }

    if (err.response?.status === 429) {
      return 'Rate limit exceeded (too many requests)';
    }

    if (err.response?.status && err.response.status >= 500) {
      return `Server error (${provider} service unavailable)`;
    }

    return err.message || 'Unknown error';
  }
}
