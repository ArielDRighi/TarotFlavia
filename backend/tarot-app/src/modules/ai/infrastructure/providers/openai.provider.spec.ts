import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OpenAIProvider } from './openai.provider';
import {
  AIProviderType,
  AIMessage,
} from '../../domain/interfaces/ai-provider.interface';
import { AIProviderException, AIErrorType } from '../errors/ai-error.types';
import OpenAI from 'openai';

// Mock OpenAI SDK
jest.mock('openai');

interface MockCreateParams {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature: number;
  max_tokens: number;
}

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;
  let mockOpenAIClient: {
    chat: {
      completions: {
        create: jest.Mock<Promise<unknown>, [MockCreateParams]>;
      };
    };
  };

  const mockApiKey = 'sk-test-key-123';
  const mockMessages: AIMessage[] = [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Interpret The Fool card' },
  ];

  beforeEach(async () => {
    // Create mock OpenAI client with explicit typing
    mockOpenAIClient = {
      chat: {
        completions: {
          create: jest.fn<Promise<unknown>, [MockCreateParams]>(),
        },
      },
    };

    // Mock OpenAI constructor to return our mock client
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => {
      return mockOpenAIClient as unknown as OpenAI;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'OPENAI_API_KEY') return mockApiKey;
              if (key === 'OPENAI_MODEL') return 'gpt-4o-mini';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<OpenAIProvider>(OpenAIProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize client when valid API key is provided', () => {
      expect(OpenAI).toHaveBeenCalledWith({ apiKey: mockApiKey });
    });

    it('should not initialize client when API key is missing', async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OpenAIProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
        ],
      }).compile();

      const providerWithoutKey = module.get<OpenAIProvider>(OpenAIProvider);

      await expect(
        providerWithoutKey.generateCompletion(mockMessages, {}),
      ).rejects.toThrow(AIProviderException);
    });

    it('should not initialize client when API key is invalid format', async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OpenAIProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => 'invalid-key-format'),
            },
          },
        ],
      }).compile();

      const providerWithInvalidKey = module.get<OpenAIProvider>(OpenAIProvider);

      await expect(
        providerWithInvalidKey.generateCompletion(mockMessages, {}),
      ).rejects.toThrow(AIProviderException);
    });
  });

  describe('generateCompletion', () => {
    const mockSuccessResponse = {
      choices: [
        {
          message: {
            content: 'The Fool represents new beginnings...',
          },
        },
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 150,
        total_tokens: 200,
      },
    };

    it('should generate completion successfully with default config', async () => {
      mockOpenAIClient.chat.completions.create.mockResolvedValue(
        mockSuccessResponse,
      );

      const result = await provider.generateCompletion(mockMessages, {});

      expect(result.content).toBe('The Fool represents new beginnings...');
      expect(result.provider).toBe(AIProviderType.OPENAI);
      expect(result.model).toBe('gpt-4o-mini');
      expect(result.tokensUsed).toEqual({
        prompt: 50,
        completion: 150,
        total: 200,
      });
      expect(typeof result.durationMs).toBe('number');

      expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Interpret The Fool card' },
        ],
        temperature: 0.7,
        max_tokens: 600, // 0 matches (no "Posición \d+:") → cardCount <= 3 → 600
      });
    });

    it('should use custom config when provided', async () => {
      mockOpenAIClient.chat.completions.create.mockResolvedValue(
        mockSuccessResponse,
      );

      await provider.generateCompletion(mockMessages, {
        model: 'gpt-4',
        temperature: 0.5,
        maxTokens: 1000,
      });

      const calls = mockOpenAIClient.chat.completions.create.mock.calls;
      const callArgs = calls[0][0] as unknown as MockCreateParams;
      expect(callArgs.model).toBe('gpt-4');
      expect(callArgs.temperature).toBe(0.5);
      expect(callArgs.max_tokens).toBe(1000);
    });

    it('should calculate max tokens based on card count (3 cards)', async () => {
      const threeCardMessages: AIMessage[] = [
        { role: 'system', content: 'System prompt' },
        {
          role: 'user',
          content:
            'Posición 1: The Fool\nPosición 2: The Magician\nPosición 3: The High Priestess',
        },
      ];

      mockOpenAIClient.chat.completions.create.mockResolvedValue(
        mockSuccessResponse,
      );

      await provider.generateCompletion(threeCardMessages, {});

      const calls = mockOpenAIClient.chat.completions.create.mock.calls;
      const callArgs = calls[0][0] as unknown as MockCreateParams;
      expect(callArgs.max_tokens).toBe(600); // 3 cards = 600 tokens
    });

    it('should calculate max tokens based on card count (5 cards)', async () => {
      const fiveCardMessages: AIMessage[] = [
        { role: 'system', content: 'System prompt' },
        {
          role: 'user',
          content:
            'Posición 1: Card1\nPosición 2: Card2\nPosición 3: Card3\nPosición 4: Card4\nPosición 5: Card5',
        },
      ];

      mockOpenAIClient.chat.completions.create.mockResolvedValue(
        mockSuccessResponse,
      );

      await provider.generateCompletion(fiveCardMessages, {});

      const calls = mockOpenAIClient.chat.completions.create.mock.calls;
      const callArgs = calls[0][0] as unknown as MockCreateParams;
      expect(callArgs.max_tokens).toBe(800); // 5 cards = 800 tokens
    });

    it('should calculate max tokens for large spreads (10 cards)', async () => {
      const tenCardMessages: AIMessage[] = [
        { role: 'system', content: 'System prompt' },
        {
          role: 'user',
          content: Array.from(
            { length: 10 },
            (_, i) => `Posición ${i + 1}: Card${i + 1}`,
          ).join('\n'),
        },
      ];

      mockOpenAIClient.chat.completions.create.mockResolvedValue(
        mockSuccessResponse,
      );

      await provider.generateCompletion(tenCardMessages, {});

      const calls = mockOpenAIClient.chat.completions.create.mock.calls;
      const callArgs = calls[0][0] as unknown as MockCreateParams;
      expect(callArgs.max_tokens).toBe(1000); // 10 cards = 1000 tokens
    });

    it('should throw INVALID_KEY exception when client is not initialized', async () => {
      // Create provider without API key
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OpenAIProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
        ],
      }).compile();

      const providerWithoutKey = module.get<OpenAIProvider>(OpenAIProvider);

      try {
        await providerWithoutKey.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (error) {
        expect(error).toBeInstanceOf(AIProviderException);
        if (error instanceof AIProviderException) {
          expect(error.provider).toBe(AIProviderType.OPENAI);
          expect(error.errorType).toBe(AIErrorType.INVALID_KEY);
          expect(error.message).toBe(
            'OpenAI client not initialized - API key missing',
          );
          expect(error.retryable).toBe(false);
        }
      }
    });

    it('should throw TIMEOUT exception when request exceeds 30s', async () => {
      // Mock timeout scenario
      mockOpenAIClient.chat.completions.create.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, 31000); // 31 seconds
        });
      });

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (error) {
        expect(error).toBeInstanceOf(AIProviderException);
        if (error instanceof AIProviderException) {
          expect(error.provider).toBe(AIProviderType.OPENAI);
          expect(error.errorType).toBe(AIErrorType.TIMEOUT);
          expect(error.retryable).toBe(true);
        }
      }
    }, 35000);

    it('should throw SERVER_ERROR exception when response is empty', async () => {
      mockOpenAIClient.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '' } }],
        usage: { prompt_tokens: 10, completion_tokens: 0, total_tokens: 10 },
      });

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (error) {
        expect(error).toBeInstanceOf(AIProviderException);
        if (error instanceof AIProviderException) {
          expect(error.provider).toBe(AIProviderType.OPENAI);
          expect(error.errorType).toBe(AIErrorType.SERVER_ERROR);
          expect(error.message).toBe('Empty response from OpenAI');
          expect(error.retryable).toBe(true);
        }
      }
    });

    it('should throw INVALID_KEY exception on 401 error', async () => {
      const error = new Error('Invalid API key') as Error & { status: number };
      error.status = 401;

      mockOpenAIClient.chat.completions.create.mockRejectedValue(error);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.OPENAI);
          expect(err.errorType).toBe(AIErrorType.INVALID_KEY);
          expect(err.retryable).toBe(false);
        }
      }
    });

    it('should throw RATE_LIMIT exception on 429 error', async () => {
      const error = new Error('Rate limit exceeded') as Error & {
        status: number;
      };
      error.status = 429;

      mockOpenAIClient.chat.completions.create.mockRejectedValue(error);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.OPENAI);
          expect(err.errorType).toBe(AIErrorType.RATE_LIMIT);
          expect(err.retryable).toBe(true);
        }
      }
    });

    it('should throw SERVER_ERROR exception on 500 error', async () => {
      const error = new Error('Internal server error') as Error & {
        status: number;
      };
      error.status = 500;

      mockOpenAIClient.chat.completions.create.mockRejectedValue(error);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.OPENAI);
          expect(err.errorType).toBe(AIErrorType.SERVER_ERROR);
          expect(err.retryable).toBe(true);
        }
      }
    });

    it('should throw SERVER_ERROR exception on 502 error (string matching)', async () => {
      const error = new Error('Bad gateway - 502');

      mockOpenAIClient.chat.completions.create.mockRejectedValue(error);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.OPENAI);
          expect(err.errorType).toBe(AIErrorType.SERVER_ERROR);
        }
      }
    });

    it('should throw SERVER_ERROR exception on 503 error (string matching)', async () => {
      const error = new Error('Service unavailable - 503');

      mockOpenAIClient.chat.completions.create.mockRejectedValue(error);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.OPENAI);
          expect(err.errorType).toBe(AIErrorType.SERVER_ERROR);
        }
      }
    });

    it('should throw TIMEOUT exception on ETIMEDOUT error code', async () => {
      const error = new Error('Connection timeout') as Error & {
        code: string;
      };
      error.code = 'ETIMEDOUT';

      mockOpenAIClient.chat.completions.create.mockRejectedValue(error);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.OPENAI);
          expect(err.errorType).toBe(AIErrorType.TIMEOUT);
          expect(err.retryable).toBe(true);
        }
      }
    });

    it('should throw TIMEOUT exception on timeout string matching', async () => {
      const error = new Error('Request timeout after 30s');

      mockOpenAIClient.chat.completions.create.mockRejectedValue(error);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.OPENAI);
          expect(err.errorType).toBe(AIErrorType.TIMEOUT);
        }
      }
    });

    it('should throw CONTEXT_LENGTH exception on context too long error', async () => {
      const error = new Error('Maximum context length exceeded');

      mockOpenAIClient.chat.completions.create.mockRejectedValue(error);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.OPENAI);
          expect(err.errorType).toBe(AIErrorType.CONTEXT_LENGTH);
          expect(err.retryable).toBe(false);
        }
      }
    });

    it('should throw NETWORK_ERROR exception on unknown error', async () => {
      const error = new Error('Unknown network error');

      mockOpenAIClient.chat.completions.create.mockRejectedValue(error);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.OPENAI);
          expect(err.errorType).toBe(AIErrorType.NETWORK_ERROR);
          expect(err.retryable).toBe(true);
        }
      }
    });

    it('should handle error with response.status property', async () => {
      const error = new Error('API Error') as Error & {
        response: { status: number };
      };
      error.response = { status: 429 };

      mockOpenAIClient.chat.completions.create.mockRejectedValue(error);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.errorType).toBe(AIErrorType.RATE_LIMIT);
        }
      }
    });

    it('should handle error with statusCode property', async () => {
      const error = new Error('API Error') as Error & { statusCode: number };
      error.statusCode = 401;

      mockOpenAIClient.chat.completions.create.mockRejectedValue(error);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.errorType).toBe(AIErrorType.INVALID_KEY);
        }
      }
    });

    it('should re-throw AIProviderException without wrapping', async () => {
      const originalException = new AIProviderException(
        AIProviderType.OPENAI,
        AIErrorType.RATE_LIMIT,
        'Already wrapped',
        true,
        new Error('Original'),
      );

      mockOpenAIClient.chat.completions.create.mockRejectedValue(
        originalException,
      );

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBe(originalException);
      }
    });

    it('should detect rate limit error by string matching (case insensitive)', async () => {
      const error = new Error('Rate Limit Exceeded - please try again');

      mockOpenAIClient.chat.completions.create.mockRejectedValue(error);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.errorType).toBe(AIErrorType.RATE_LIMIT);
        }
      }
    });

    it('should detect invalid API key error by string matching', async () => {
      const error = new Error('Invalid API key provided');

      mockOpenAIClient.chat.completions.create.mockRejectedValue(error);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.errorType).toBe(AIErrorType.INVALID_KEY);
        }
      }
    });

    it('should handle missing usage data in response', async () => {
      mockOpenAIClient.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Response without usage' } }],
        usage: undefined,
      });

      const result = await provider.generateCompletion(mockMessages, {});

      expect(result.tokensUsed).toEqual({
        prompt: 0,
        completion: 0,
        total: 0,
      });
    });
  });

  describe('isAvailable', () => {
    it('should return true when OpenAI API is available', async () => {
      mockOpenAIClient.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'test' } }],
      });

      const result = await provider.isAvailable();

      expect(result).toBe(true);
      expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      });
    });

    it('should return false when client is not initialized', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OpenAIProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
        ],
      }).compile();

      const providerWithoutKey = module.get<OpenAIProvider>(OpenAIProvider);

      const result = await providerWithoutKey.isAvailable();

      expect(result).toBe(false);
    });

    it('should return false when OpenAI API throws error', async () => {
      mockOpenAIClient.chat.completions.create.mockRejectedValue(
        new Error('API unavailable'),
      );

      const result = await provider.isAvailable();

      expect(result).toBe(false);
    });

    it('should return false when OpenAI API timeout occurs', async () => {
      mockOpenAIClient.chat.completions.create.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, 6000); // 6 seconds > 5s timeout
        });
      });

      const result = await provider.isAvailable();

      expect(result).toBe(false);
    }, 10000);
  });

  describe('getProviderType', () => {
    it('should return OPENAI as provider type', () => {
      expect(provider.getProviderType()).toBe(AIProviderType.OPENAI);
    });
  });
});
