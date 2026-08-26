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
    /**
     * El presupuesto lo fija el cliente, no el proveedor: el axios del frontend
     * aborta a los 30s (`frontend/src/lib/api/axios-config.ts`). Un timeout más
     * largo que eso solo consigue que el backend siga trabajando en una lectura
     * que el usuario ya vio fallar. 25s deja margen sobre los 14–17,6s medidos
     * y entra en el presupuesto del cliente.
     */
    const TIMEOUT_MS = 25_000;

    const startNeverResolvingCall = (): Promise<unknown> => {
      mockClient.chat.completions.create.mockReturnValue(
        new Promise(() => {
          // nunca resuelve: simula una generación lenta
        }),
      );

      return provider
        .generateCompletion(mockMessages, {})
        .catch((error: unknown) => error);
    };

    it('sigue esperando un milisegundo antes del corte', async () => {
      jest.useFakeTimers();
      let settled = false;
      const pending = startNeverResolvingCall().then((result) => {
        settled = true;
        return result;
      });

      await jest.advanceTimersByTimeAsync(TIMEOUT_MS - 1);

      expect(settled).toBe(false);

      // Se deja vencer para no dejar la promesa colgada al terminar el test
      await jest.advanceTimersByTimeAsync(1);
      await pending;
    });

    it('corta exactamente en el presupuesto con un error reintentable', async () => {
      jest.useFakeTimers();
      const pending = startNeverResolvingCall();

      await jest.advanceTimersByTimeAsync(TIMEOUT_MS);
      const error = await pending;

      expect(error).toBeInstanceOf(AIProviderException);
      const aiError = error as AIProviderException;
      expect(aiError.errorType).toBe(AIErrorType.TIMEOUT);
      expect(aiError.retryable).toBe(true);
      expect(aiError.message).toContain(`${TIMEOUT_MS / 1000}s`);
    });

    it('no deja el timer colgado cuando la respuesta llega a tiempo', async () => {
      jest.useFakeTimers();

      await provider.generateCompletion(mockMessages, {});

      // Promise.race no cancela al perdedor: sin un clearTimeout explícito
      // queda un setTimeout retenido por cada llamada, que mantiene vivo el
      // event loop (y hace fallar el shutdown limpio en Railway).
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('sonda de disponibilidad', () => {
    it('usa el mismo modo no pensante que la generación real', async () => {
      await provider.isAvailable();

      expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({ thinking: { type: 'disabled' } }),
      );
    });
  });
});
