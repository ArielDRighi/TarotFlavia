import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import {
  AIProviderType,
  AIProviderConfig,
  AIMessage,
  AIResponse,
  IAIProvider,
} from '../ai-provider.interface';

@Injectable()
export class GroqProvider implements IAIProvider {
  private client: Groq | null = null;
  private readonly DEFAULT_MODEL = 'llama-3.1-70b-versatile';
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
      throw new Error('Groq client not initialized - API key missing');
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
        }),
        this.timeout(this.TIMEOUT),
      ]);

      if (!response || typeof response === 'string') {
        throw new Error('Timeout exceeded');
      }

      const durationMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';

      if (!content) {
        throw new Error('Empty response from Groq');
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
      if (error instanceof Error) {
        throw new Error(`Groq API error: ${error.message}`);
      }
      throw error;
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
