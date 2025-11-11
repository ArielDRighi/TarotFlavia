/**
 * Interface for AI Provider abstraction
 * Allows swapping between Groq, DeepSeek, OpenAI seamlessly
 */

export enum AIProviderType {
  GROQ = 'groq',
  DEEPSEEK = 'deepseek',
  OPENAI = 'openai',
}

export interface AIProviderConfig {
  provider: AIProviderType;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  provider: AIProviderType;
  model: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  durationMs: number;
  fromCache?: boolean;
}

export interface IAIProvider {
  generateCompletion(
    messages: AIMessage[],
    config: Partial<AIProviderConfig>,
  ): Promise<AIResponse>;

  isAvailable(): Promise<boolean>;

  getProviderType(): AIProviderType;
}
