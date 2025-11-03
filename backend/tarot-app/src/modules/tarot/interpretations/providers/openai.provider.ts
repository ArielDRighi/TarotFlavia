import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  AIProviderType,
  AIProviderConfig,
  AIMessage,
  AIResponse,
  IAIProvider,
} from '../ai-provider.interface';

@Injectable()
export class OpenAIProvider implements IAIProvider {
  private client: OpenAI | null = null;
  private readonly DEFAULT_MODEL = 'gpt-4o-mini';
  private readonly DEFAULT_TEMPERATURE = 0.7; // GPT can be more creative
  private readonly TIMEOUT = 30000; // 30s - OpenAI can be slower

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey.startsWith('sk-')) {
      this.client = new OpenAI({ apiKey });
    }
  }

  async generateCompletion(
    messages: AIMessage[],
    config: Partial<AIProviderConfig>,
  ): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized - API key missing');
    }

    const model =
      config.model ||
      this.configService.get<string>('OPENAI_MODEL') ||
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
        throw new Error('Empty response from OpenAI');
      }

      return {
        content,
        provider: AIProviderType.OPENAI,
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
        throw new Error(`OpenAI API error: ${error.message}`);
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
    return AIProviderType.OPENAI;
  }

  /**
   * Calculate appropriate max_tokens based on card count
   * OpenAI is costly, so we're more restrictive
   */
  private calculateMaxTokens(messages: AIMessage[]): number {
    const userMessage = messages.find((m) => m.role === 'user')?.content || '';
    const cardCount = (userMessage.match(/Posición \d+:/g) || []).length;

    if (cardCount === 1) return 400;
    if (cardCount <= 3) return 600;
    if (cardCount <= 5) return 800;
    return 1000; // 10-card spreads
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout exceeded')), ms),
    );
  }
}
