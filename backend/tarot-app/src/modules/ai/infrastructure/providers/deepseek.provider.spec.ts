import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai'; // DeepSeek expone una API compatible con OpenAI
import { DeepSeekProvider } from './deepseek.provider';
import {
  AIProviderType,
  AIMessage,
} from '../../domain/interfaces/ai-provider.interface';
import { AIProviderException, AIErrorType } from '../errors/ai-error.types';

jest.mock('openai');

/**
 * Parámetros que el provider le pasa a `chat.completions.create`.
 *
 * `thinking` no existe en los tipos del SDK de OpenAI (es una extensión de
 * DeepSeek), por eso se declara acá para poder afirmar sobre él.
 */
interface MockCreateParams {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature: number;
  max_tokens: number;
  thinking?: { type: 'enabled' | 'disabled' };
}

/**
 * Tests de guarda del provider de DeepSeek.
 *
 * Contexto (26-ago-2026): DeepSeek pasó a `deepseek-v4-flash`, que trae el modo
 * de razonamiento ENCENDIDO por defecto. Medido con el prompt real de una tirada
 * de 3 cartas, eso da 18–32s por interpretación (y se come el timeout de 15s que
 * tenía el provider, más el de 30s del axios del frontend). Con
 * `thinking: { type: 'disabled' }` baja a 14–17s, deja de facturar tokens de
 * razonamiento y —según la doc de DeepSeek— vuelve a respetar `temperature`,
 * que en modo pensante se ignora en silencio.
 */
describe('DeepSeekProvider', () => {
  let provider: DeepSeekProvider;
  let mockClient: {
    chat: {
      completions: {
        create: jest.Mock<Promise<unknown>, [MockCreateParams]>;
      };
    };
  };

  const mockApiKey = 'sk-test-key-123';
  const mockMessages: AIMessage[] = [
    { role: 'system', content: 'Sos Flavia, tarotista argentina' },
    { role: 'user', content: 'Interpretá la tirada de 3 cartas' },
  ];

  const mockCompletion = {
    choices: [{ message: { content: 'Las cartas hablan de un ciclo nuevo.' } }],
    usage: { prompt_tokens: 300, completion_tokens: 1200, total_tokens: 1500 },
  };

  beforeEach(async () => {
    mockClient = {
      chat: {
        completions: {
          create: jest.fn<Promise<unknown>, [MockCreateParams]>(),
        },
      },
    };

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => {
      return mockClient as unknown as OpenAI;
    });

    mockClient.chat.completions.create.mockResolvedValue(mockCompletion);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeepSeekProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'DEEPSEEK_API_KEY') return mockApiKey;
              if (key === 'DEEPSEEK_MODEL') return 'deepseek-v4-flash';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<DeepSeekProvider>(DeepSeekProvider);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('modo de razonamiento', () => {
    it('desactiva el thinking para no duplicar latencia ni costo', async () => {
      await provider.generateCompletion(mockMessages, {});

      expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({ thinking: { type: 'disabled' } }),
      );
    });

    it('sigue enviando la temperatura del llamador', async () => {
      await provider.generateCompletion(mockMessages, { temperature: 0.9 });

      expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.9,
          thinking: { type: 'disabled' },
        }),
      );
    });

    it('devuelve la respuesta con el proveedor y el modelo correctos', async () => {
      const response = await provider.generateCompletion(mockMessages, {});

      expect(response.provider).toBe(AIProviderType.DEEPSEEK);
      expect(response.model).toBe('deepseek-v4-flash');
      expect(response.content).toBe('Las cartas hablan de un ciclo nuevo.');
      expect(response.tokensUsed.total).toBe(1500);
    });
  });

  describe('timeout', () => {
    it('sigue esperando a los 20s (una interpretación real tarda 14–17s)', async () => {
      jest.useFakeTimers();
      mockClient.chat.completions.create.mockReturnValue(
        new Promise(() => {
          // nunca resuelve: simula una generación lenta
        }),
      );

      let settled = false;
      const pending = provider
        .generateCompletion(mockMessages, {})
        .catch((error: unknown) => {
          settled = true;
          return error;
        });

      await jest.advanceTimersByTimeAsync(20_000);

      expect(settled).toBe(false);

      // Se deja vencer para no dejar la promesa colgada al terminar el test
      await jest.advanceTimersByTimeAsync(30_000);
      await pending;
    });

    it('corta a los 45s con un error de timeout reintentable', async () => {
      jest.useFakeTimers();
      mockClient.chat.completions.create.mockReturnValue(
        new Promise(() => {
          // nunca resuelve
        }),
      );

      const pending = provider
        .generateCompletion(mockMessages, {})
        .catch((error: unknown) => error);

      await jest.advanceTimersByTimeAsync(45_000);
      const error = await pending;

      expect(error).toBeInstanceOf(AIProviderException);
      const aiError = error as AIProviderException;
      expect(aiError.errorType).toBe(AIErrorType.TIMEOUT);
      expect(aiError.retryable).toBe(true);
    });
  });
});
