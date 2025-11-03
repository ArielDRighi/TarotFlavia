import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai'; // DeepSeek uses OpenAI-compatible API
import {
  AIProviderType,
  AIProviderConfig,
  AIMessage,
  AIResponse,
  IAIProvider,
} from '../ai-provider.interface';

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
      throw new Error('DeepSeek client not initialized - API key missing');
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
        throw new Error('Timeout exceeded');
      }

      const durationMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';

      if (!content) {
        throw new Error('Empty response from DeepSeek');
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
      if (error instanceof Error) {
        throw new Error(`DeepSeek API error: ${error.message}`);
      }
      throw error;
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
