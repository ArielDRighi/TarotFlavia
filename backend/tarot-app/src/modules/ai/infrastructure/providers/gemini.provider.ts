import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import {
  AIProviderType,
  AIProviderConfig,
  AIMessage,
  AIResponse,
  IAIProvider,
} from '../../domain/interfaces/ai-provider.interface';
import { AIProviderException, AIErrorType } from '../errors/ai-error.types';

@Injectable()
export class GeminiProvider implements IAIProvider {
  private client: GoogleGenerativeAI | null = null;
  private readonly DEFAULT_MODEL = 'gemini-1.5-flash';
  private readonly DEFAULT_TEMPERATURE = 0.7;
  private readonly TIMEOUT = 30000; // 30s - Gemini can be slower than Groq

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateCompletion(
    messages: AIMessage[],
    config: Partial<AIProviderConfig>,
  ): Promise<AIResponse> {
    if (!this.client) {
      throw new AIProviderException(
        AIProviderType.GEMINI,
        AIErrorType.INVALID_KEY,
        'Gemini client not initialized - API key missing',
        false,
        new Error('API key missing'),
      );
    }

    const model =
      config.model ||
      this.configService.get<string>('GEMINI_MODEL') ||
      this.DEFAULT_MODEL;
    const temperature = config.temperature ?? this.DEFAULT_TEMPERATURE;
    const maxTokens = config.maxTokens ?? this.calculateMaxTokens(messages);

    // Extract system instruction and convert messages
    const systemInstruction =
      messages.find((m) => m.role === 'system')?.content || '';
    const contents = this.convertMessages(messages);

    const startTime = Date.now();

    try {
      // Create model with system instruction and generation config
      const geminiModel = this.client.getGenerativeModel({
        model,
        systemInstruction,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const response = await Promise.race([
        geminiModel.generateContent({
          contents,
        }),
        this.timeout(this.TIMEOUT),
      ]);

      if (!response || typeof response === 'string') {
        throw new AIProviderException(
          AIProviderType.GEMINI,
          AIErrorType.TIMEOUT,
          'Gemini request timeout exceeded (>30s)',
          true,
          new Error('Timeout'),
        );
      }

      const durationMs = Date.now() - startTime;
      const content = response.response.text();

      if (!content) {
        throw new AIProviderException(
          AIProviderType.GEMINI,
          AIErrorType.SERVER_ERROR,
          'Empty response from Gemini',
          true,
          new Error('Empty response'),
        );
      }

      const usageMetadata = response.response.usageMetadata || {
        promptTokenCount: 0,
        candidatesTokenCount: 0,
        totalTokenCount: 0,
      };

      return {
        content,
        provider: AIProviderType.GEMINI,
        model,
        tokensUsed: {
          prompt: usageMetadata.promptTokenCount,
          completion: usageMetadata.candidatesTokenCount,
          total: usageMetadata.totalTokenCount,
        },
        durationMs,
      };
    } catch (error) {
      // If already AIProviderException, rethrow
      if (error instanceof AIProviderException) {
        throw error;
      }

      // Handle Gemini SDK specific errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Check error object properties
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
          AIProviderType.GEMINI,
          AIErrorType.INVALID_KEY,
          `Gemini API key invalid: ${errorMessage}`,
          false,
          error as Error,
        );
      }

      // Check for 429 (Rate limit)
      if (
        statusCode === 429 ||
        errorMessage.includes('429') ||
        errorMessage.toLowerCase().includes('rate limit') ||
        errorMessage.toLowerCase().includes('resource exhausted')
      ) {
        throw new AIProviderException(
          AIProviderType.GEMINI,
          AIErrorType.RATE_LIMIT,
          `Gemini rate limit exceeded: ${errorMessage}`,
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
          AIProviderType.GEMINI,
          AIErrorType.SERVER_ERROR,
          `Gemini server error: ${errorMessage}`,
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
          AIProviderType.GEMINI,
          AIErrorType.TIMEOUT,
          `Gemini request timeout: ${errorMessage}`,
          true,
          error as Error,
        );
      }

      if (
        errorMessage.includes('context') ||
        errorMessage.includes('too long') ||
        errorMessage.includes('length')
      ) {
        throw new AIProviderException(
          AIProviderType.GEMINI,
          AIErrorType.CONTEXT_LENGTH,
          `Gemini context too long: ${errorMessage}`,
          false,
          error as Error,
        );
      }

      // Default to network error for unknown errors
      throw new AIProviderException(
        AIProviderType.GEMINI,
        AIErrorType.NETWORK_ERROR,
        `Gemini API error: ${errorMessage}`,
        true,
        error as Error,
      );
    }
  }

  isAvailable(): Promise<boolean> {
    return Promise.resolve(this.client !== null);
  }

  getProviderType(): AIProviderType {
    return AIProviderType.GEMINI;
  }

  /**
   * Convert OpenAI-style messages to Gemini Content format
   * Gemini uses 'user' and 'model' roles instead of 'user' and 'assistant'
   * System messages are handled separately as systemInstruction
   */
  private convertMessages(messages: AIMessage[]): Content[] {
    return messages
      .filter((m) => m.role !== 'system') // System messages handled separately
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));
  }

  /**
   * Calculate appropriate max_tokens based on card count
   * Gemini has generous free tier, so we can be more lenient
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
