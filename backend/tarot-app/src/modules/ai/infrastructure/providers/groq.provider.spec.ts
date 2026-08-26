import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { GroqProvider } from './groq.provider';
import {
  AIProviderType,
  AIMessage,
} from '../../domain/interfaces/ai-provider.interface';

jest.mock('groq-sdk');

/**
 * Parámetros que el provider le pasa a `chat.completions.create`.
 *
 * Se tipa acá (en vez de reusar el tipo del SDK) para poder afirmar sobre
 * `reasoning_effort`, que es el punto de estos tests.
 */
interface MockCreateParams {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature: number;
  max_tokens: number;
  reasoning_effort?: string;
}

/**
 * Tests de guarda del provider de Groq.
 *
 * Contexto (26-ago-2026): Groq decomisionó toda la familia Llama y
 * `llama-3.3-70b-versatile` dejó de existir en la cuenta, con lo que producción
 * quedó sin IA. El reemplazo es `openai/gpt-oss-120b`, que es un modelo de
 * razonamiento: sin `reasoning_effort: 'low'` gasta ~565 tokens de razonamiento
 * por horóscopo, que cuentan contra `max_tokens` y contra el techo de
 * 8.000 tokens/minuto del tier gratuito.
 */
describe('GroqProvider', () => {
  let provider: GroqProvider;
  let mockGroqClient: {
    chat: {
      completions: {
        create: jest.Mock<Promise<unknown>, [MockCreateParams]>;
      };
    };
  };

  const mockApiKey = 'gsk_test_key_123';
  const mockMessages: AIMessage[] = [
    { role: 'system', content: 'Sos una tarotista argentina' },
    { role: 'user', content: 'Horóscopo de Aries para hoy' },
  ];

  const mockCompletion = {
    choices: [{ message: { content: 'Hoy Aries arranca con impulso.' } }],
    usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
  };

  const buildProvider = async (
    configuredModel?: string,
  ): Promise<GroqProvider> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroqProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GROQ_API_KEY') return mockApiKey;
              if (key === 'GROQ_MODEL') return configuredModel;
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    return module.get<GroqProvider>(GroqProvider);
  };

  beforeEach(async () => {
    mockGroqClient = {
      chat: {
        completions: {
          create: jest.fn<Promise<unknown>, [MockCreateParams]>(),
        },
      },
    };

    (Groq as jest.MockedClass<typeof Groq>).mockImplementation(() => {
      return mockGroqClient as unknown as Groq;
    });

    mockGroqClient.chat.completions.create.mockResolvedValue(mockCompletion);

    provider = await buildProvider();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('modelo por defecto', () => {
    it('usa openai/gpt-oss-120b cuando GROQ_MODEL no está configurado', async () => {
      const response = await provider.generateCompletion(mockMessages, {});

      expect(mockGroqClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'openai/gpt-oss-120b' }),
      );
      expect(response.model).toBe('openai/gpt-oss-120b');
      expect(response.provider).toBe(AIProviderType.GROQ);
    });

    it('no usa ningún modelo de la familia Llama (decomisionada por Groq)', async () => {
      await provider.generateCompletion(mockMessages, {});

      const [params] = mockGroqClient.chat.completions.create.mock.calls[0];
      expect(params.model).not.toMatch(/llama/i);
    });

    it('respeta GROQ_MODEL cuando está configurado', async () => {
      const configuredProvider = await buildProvider('openai/gpt-oss-20b');

      await configuredProvider.generateCompletion(mockMessages, {});

      expect(mockGroqClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'openai/gpt-oss-20b' }),
      );
    });

    it('respeta el modelo puntual que llega por config', async () => {
      await provider.generateCompletion(mockMessages, {
        model: 'qwen/qwen3.8-27b',
      });

      expect(mockGroqClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'qwen/qwen3.8-27b' }),
      );
    });
  });

  describe('reasoning_effort', () => {
    it("envía reasoning_effort 'low' para no gastar el presupuesto de tokens en razonamiento", async () => {
      await provider.generateCompletion(mockMessages, {});

      expect(mockGroqClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({ reasoning_effort: 'low' }),
      );
    });

    it('lo envía también cuando el llamador fija maxTokens', async () => {
      await provider.generateCompletion(mockMessages, { maxTokens: 1000 });

      expect(mockGroqClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          reasoning_effort: 'low',
          max_tokens: 1000,
        }),
      );
    });
  });
});
