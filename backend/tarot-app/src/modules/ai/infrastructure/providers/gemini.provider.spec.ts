import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiProvider } from './gemini.provider';
import {
  AIProviderType,
  AIMessage,
} from '../../domain/interfaces/ai-provider.interface';
import { AIProviderException, AIErrorType } from '../errors/ai-error.types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock Google Generative AI SDK
jest.mock('@google/generative-ai');

interface MockGenerateContentParams {
  contents: Array<{ role: string; parts: Array<{ text: string }> }>;
}

describe('GeminiProvider', () => {
  let provider: GeminiProvider;
  let mockGeminiModel: {
    generateContent: jest.Mock<
      Promise<unknown>,
      [MockGenerateContentParams | { contents: Array<unknown> }]
    >;
  };
  let mockGeminiClient: {
    getGenerativeModel: jest.Mock;
  };

  const mockApiKey = 'AIza-test-key-123';
  const mockMessages: AIMessage[] = [
    { role: 'system', content: 'You are a helpful tarot reader' },
    { role: 'user', content: 'Interpret The Fool card' },
  ];

  beforeEach(async () => {
    // Create mock Gemini model
    mockGeminiModel = {
      generateContent: jest.fn<
        Promise<unknown>,
        [MockGenerateContentParams | { contents: Array<unknown> }]
      >(),
    };

    // Create mock Gemini client
    mockGeminiClient = {
      getGenerativeModel: jest.fn().mockReturnValue(mockGeminiModel),
    };

    // Mock GoogleGenerativeAI constructor
    (
      GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>
    ).mockImplementation(() => {
      return mockGeminiClient as unknown as GoogleGenerativeAI;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GEMINI_API_KEY') return mockApiKey;
              if (key === 'GEMINI_MODEL') return 'gemini-1.5-flash';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<GeminiProvider>(GeminiProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize client when valid API key is provided', () => {
      expect(GoogleGenerativeAI).toHaveBeenCalledWith(mockApiKey);
    });

    it('should not initialize client when API key is missing', async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GeminiProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
        ],
      }).compile();

      const providerWithoutKey = module.get<GeminiProvider>(GeminiProvider);

      await expect(
        providerWithoutKey.generateCompletion(mockMessages, {}),
      ).rejects.toThrow(AIProviderException);
    });
  });

  describe('generateCompletion', () => {
    const mockSuccessResponse = {
      response: {
        text: () => 'The Fool represents new beginnings and innocence...',
        usageMetadata: {
          promptTokenCount: 50,
          candidatesTokenCount: 150,
          totalTokenCount: 200,
        },
      },
    };

    it('should generate completion successfully with default config', async () => {
      mockGeminiModel.generateContent.mockResolvedValue(mockSuccessResponse);

      const result = await provider.generateCompletion(mockMessages, {});

      expect(result.content).toBe(
        'The Fool represents new beginnings and innocence...',
      );
      expect(result.provider).toBe(AIProviderType.GEMINI);
      expect(result.model).toBe('gemini-1.5-flash');
      expect(result.tokensUsed).toEqual({
        prompt: 50,
        completion: 150,
        total: 200,
      });
      expect(typeof result.durationMs).toBe('number');

      // Verify model was created with system instruction
      expect(mockGeminiClient.getGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-1.5-flash',
        systemInstruction: 'You are a helpful tarot reader',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      });

      // Verify content was generated with only user messages
      expect(mockGeminiModel.generateContent).toHaveBeenCalledWith({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Interpret The Fool card' }],
          },
        ],
      });
    });

    it('should use custom config when provided', async () => {
      mockGeminiModel.generateContent.mockResolvedValue(mockSuccessResponse);

      await provider.generateCompletion(mockMessages, {
        model: 'gemini-1.5-pro',
        temperature: 0.5,
        maxTokens: 1000,
      });

      expect(mockGeminiClient.getGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-1.5-pro',
        systemInstruction: 'You are a helpful tarot reader',
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1000,
        },
      });
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

      mockGeminiModel.generateContent.mockResolvedValue(mockSuccessResponse);

      await provider.generateCompletion(threeCardMessages, {});

      expect(mockGeminiClient.getGenerativeModel).toHaveBeenCalledWith(
        expect.objectContaining({
          generationConfig: expect.objectContaining({
            maxOutputTokens: 600,
          }),
        }),
      );
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

      mockGeminiModel.generateContent.mockResolvedValue(mockSuccessResponse);

      await provider.generateCompletion(fiveCardMessages, {});

      expect(mockGeminiClient.getGenerativeModel).toHaveBeenCalledWith(
        expect.objectContaining({
          generationConfig: expect.objectContaining({
            maxOutputTokens: 800,
          }),
        }),
      );
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

      mockGeminiModel.generateContent.mockResolvedValue(mockSuccessResponse);

      await provider.generateCompletion(tenCardMessages, {});

      expect(mockGeminiClient.getGenerativeModel).toHaveBeenCalledWith(
        expect.objectContaining({
          generationConfig: expect.objectContaining({
            maxOutputTokens: 1000,
          }),
        }),
      );
    });

    it('should convert assistant messages to model role', async () => {
      const messagesWithAssistant: AIMessage[] = [
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'First question' },
        { role: 'assistant', content: 'First answer' },
        { role: 'user', content: 'Second question' },
      ];

      mockGeminiModel.generateContent.mockResolvedValue(mockSuccessResponse);

      await provider.generateCompletion(messagesWithAssistant, {});

      expect(mockGeminiModel.generateContent).toHaveBeenCalledWith({
        contents: [
          { role: 'user', parts: [{ text: 'First question' }] },
          { role: 'model', parts: [{ text: 'First answer' }] },
          { role: 'user', parts: [{ text: 'Second question' }] },
        ],
      });
    });

    it('should throw exception when client not initialized', async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GeminiProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
        ],
      }).compile();

      const providerWithoutKey = module.get<GeminiProvider>(GeminiProvider);

      try {
        await providerWithoutKey.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.GEMINI);
          expect(err.errorType).toBe(AIErrorType.INVALID_KEY);
          expect(err.retryable).toBe(false);
        }
      }
    });

    it('should throw exception when response is empty', async () => {
      mockGeminiModel.generateContent.mockResolvedValue({
        response: {
          text: () => '',
          usageMetadata: {
            promptTokenCount: 50,
            candidatesTokenCount: 0,
            totalTokenCount: 50,
          },
        },
      });

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.GEMINI);
          expect(err.errorType).toBe(AIErrorType.SERVER_ERROR);
          expect(err.retryable).toBe(true);
        }
      }
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      (timeoutError as Error & { code?: string }).code = 'ETIMEDOUT';

      mockGeminiModel.generateContent.mockRejectedValue(timeoutError);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.GEMINI);
          expect(err.errorType).toBe(AIErrorType.TIMEOUT);
          expect(err.retryable).toBe(true);
        }
      }
    });

    it('should handle rate limit errors (429)', async () => {
      const rateLimitError = new Error('429 Resource exhausted');
      (rateLimitError as Error & { status?: number }).status = 429;

      mockGeminiModel.generateContent.mockRejectedValue(rateLimitError);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.GEMINI);
          expect(err.errorType).toBe(AIErrorType.RATE_LIMIT);
          expect(err.retryable).toBe(true);
        }
      }
    });

    it('should handle invalid API key errors (401)', async () => {
      const invalidKeyError = new Error('401 Invalid API key');
      (invalidKeyError as Error & { status?: number }).status = 401;

      mockGeminiModel.generateContent.mockRejectedValue(invalidKeyError);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.GEMINI);
          expect(err.errorType).toBe(AIErrorType.INVALID_KEY);
          expect(err.retryable).toBe(false);
        }
      }
    });

    it('should handle server errors (5xx)', async () => {
      const serverError = new Error('503 Service unavailable');
      (serverError as Error & { status?: number }).status = 503;

      mockGeminiModel.generateContent.mockRejectedValue(serverError);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.GEMINI);
          expect(err.errorType).toBe(AIErrorType.SERVER_ERROR);
          expect(err.retryable).toBe(true);
        }
      }
    });

    it('should handle context length errors', async () => {
      const contextError = new Error('Context length exceeded');

      mockGeminiModel.generateContent.mockRejectedValue(contextError);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.GEMINI);
          expect(err.errorType).toBe(AIErrorType.CONTEXT_LENGTH);
          expect(err.retryable).toBe(false);
        }
      }
    });

    it('should handle network errors for unknown errors', async () => {
      const unknownError = new Error('Unknown network error');

      mockGeminiModel.generateContent.mockRejectedValue(unknownError);

      try {
        await provider.generateCompletion(mockMessages, {});
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.GEMINI);
          expect(err.errorType).toBe(AIErrorType.NETWORK_ERROR);
          expect(err.retryable).toBe(true);
        }
      }
    });

    it('should handle timeout by rejecting after 30 seconds', async () => {
      jest.useFakeTimers();

      // Make generateContent hang
      mockGeminiModel.generateContent.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockSuccessResponse), 35000);
          }),
      );

      const completionPromise = provider.generateCompletion(mockMessages, {});

      // Fast-forward time
      jest.advanceTimersByTime(30001);

      try {
        await completionPromise;
        fail('Should have thrown AIProviderException');
      } catch (err) {
        expect(err).toBeInstanceOf(AIProviderException);
        if (err instanceof AIProviderException) {
          expect(err.provider).toBe(AIProviderType.GEMINI);
          expect(err.errorType).toBe(AIErrorType.TIMEOUT);
          expect(err.retryable).toBe(true);
        }
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('isAvailable', () => {
    it('should return true when client is initialized', async () => {
      const isAvailable = await provider.isAvailable();
      expect(isAvailable).toBe(true);
    });

    it('should return false when client is not initialized', async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GeminiProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
        ],
      }).compile();

      const providerWithoutKey = module.get<GeminiProvider>(GeminiProvider);
      const isAvailable = await providerWithoutKey.isAvailable();

      expect(isAvailable).toBe(false);
    });
  });

  describe('getProviderType', () => {
    it('should return GEMINI as provider type', () => {
      expect(provider.getProviderType()).toBe(AIProviderType.GEMINI);
    });
  });
});
