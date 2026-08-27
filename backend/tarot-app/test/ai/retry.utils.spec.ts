import { retryWithBackoff } from '../../src/modules/ai/infrastructure/errors/retry.utils';
import {
  AIErrorType,
  AIProviderException,
} from '../../src/modules/ai/infrastructure/errors/ai-error.types';
import { AIProviderType } from '../../src/modules/ai/domain/interfaces/ai-provider.interface';
import { MAX_RETRY_WAIT_MS } from '../../src/modules/ai/domain/constants/ai-retry.constants';

describe('retryWithBackoff', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed on first attempt without retry', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(fn, 3);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable errors', async () => {
    // T-IA-005: se usa un 5xx y no un 429 a propósito. Un rate limit que no
    // declara `retry-after` ya no se reintenta contra el mismo proveedor (ver
    // el bloque de política más abajo).
    const fn = jest
      .fn()
      .mockRejectedValueOnce(
        new AIProviderException(
          AIProviderType.GROQ,
          AIErrorType.SERVER_ERROR,
          'Server error',
          true,
          new Error('Server error'),
        ),
      )
      .mockResolvedValue('success');

    const result = await retryWithBackoff(fn, 3);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry on non-retryable errors', async () => {
    const nonRetryableError = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.INVALID_KEY,
      'Invalid key',
      false,
      new Error('Invalid key'),
    );

    const fn = jest.fn().mockRejectedValue(nonRetryableError);

    await expect(retryWithBackoff(fn, 3)).rejects.toThrow(nonRetryableError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should throw after max retries exceeded', async () => {
    const retryableError = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.SERVER_ERROR,
      'Server error',
      true,
      new Error('Server error'),
    );

    const fn = jest.fn().mockRejectedValue(retryableError);

    await expect(retryWithBackoff(fn, 3)).rejects.toThrow(retryableError);
    expect(fn).toHaveBeenCalledTimes(3);
  }, 15000);

  it('should wait with exponential backoff between retries', async () => {
    jest.useFakeTimers();

    const retryableError = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.TIMEOUT,
      'Timeout',
      true,
      new Error('Timeout'),
    );

    const fn = jest
      .fn()
      .mockRejectedValueOnce(retryableError)
      .mockRejectedValueOnce(retryableError)
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, 3);

    // First call - immediate
    await jest.advanceTimersByTimeAsync(0);
    expect(fn).toHaveBeenCalledTimes(1);

    // Second call - wait ~2s (with jitter)
    await jest.advanceTimersByTimeAsync(2500);
    expect(fn).toHaveBeenCalledTimes(2);

    // Third call - wait ~4s (with jitter)
    await jest.advanceTimersByTimeAsync(5000);
    expect(fn).toHaveBeenCalledTimes(3);

    jest.useRealTimers();
    const result = await promise;
    expect(result).toBe('success');
  });

  it('should handle server errors as retryable', async () => {
    const serverError = new AIProviderException(
      AIProviderType.DEEPSEEK,
      AIErrorType.SERVER_ERROR,
      'Server error',
      true,
      new Error('Server error'),
    );

    const fn = jest
      .fn()
      .mockRejectedValueOnce(serverError)
      .mockResolvedValue('success');

    const result = await retryWithBackoff(fn, 3);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should handle network errors as retryable', async () => {
    const networkError = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.NETWORK_ERROR,
      'Network error',
      true,
      new Error('Network error'),
    );

    const fn = jest
      .fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValue('success');

    const result = await retryWithBackoff(fn, 3);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry on context length errors', async () => {
    const contextError = new AIProviderException(
      AIProviderType.OPENAI,
      AIErrorType.CONTEXT_LENGTH,
      'Context too long',
      false,
      new Error('Context too long'),
    );

    const fn = jest.fn().mockRejectedValue(contextError);

    await expect(retryWithBackoff(fn, 3)).rejects.toThrow(contextError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle non-AIProviderException errors gracefully', async () => {
    const genericError = new Error('Generic error');
    const fn = jest.fn().mockRejectedValue(genericError);

    await expect(retryWithBackoff(fn, 3)).rejects.toThrow(genericError);
    expect(fn).toHaveBeenCalledTimes(1); // Should not retry generic errors
  });
});

/**
 * T-IA-005: acotar la tormenta de reintentos.
 *
 * El backoff ciego (2s / 4s) es correcto para un 5xx o un timeout, pero es
 * exactamente lo que NO hay que hacer ante un 429 por tokens: reintentar dentro
 * de la misma ventana del bucket que se acaba de vaciar garantiza otro 429 y
 * gasta cuota que no existe. La política pasa a ser: si el proveedor dice
 * CUÁNDO volver, se le hace caso; si no lo dice, no se insiste contra ese
 * proveedor — se cae al siguiente, que es lo que hace `generateCompletion`.
 */
describe('retryWithBackoff - política de rate limit (T-IA-005)', () => {
  const rateLimitError = (retryAfterMs?: number) =>
    new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.RATE_LIMIT,
      'Groq rate limit exceeded',
      true,
      new Error('429'),
      retryAfterMs,
    );

  afterEach(() => {
    jest.useRealTimers();
  });

  it('NO reintenta un 429 que no dice cuándo volver: cae al siguiente proveedor', async () => {
    const error = rateLimitError();
    const fn = jest.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, 3)).rejects.toThrow(error);

    // Una sola llamada: insistir a los 2s realimenta el 429.
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('espera lo que dice `retry-after` en lugar del backoff ciego', async () => {
    jest.useFakeTimers();

    const fn = jest
      .fn()
      .mockRejectedValueOnce(rateLimitError(5_000))
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, 3);

    await jest.advanceTimersByTimeAsync(0);
    expect(fn).toHaveBeenCalledTimes(1);

    // A los 2s (el backoff exponencial de siempre) todavía NO reintenta.
    await jest.advanceTimersByTimeAsync(2_500);
    expect(fn).toHaveBeenCalledTimes(1);

    // Recién después de la ventana que declaró el proveedor.
    await jest.advanceTimersByTimeAsync(3_500);
    expect(fn).toHaveBeenCalledTimes(2);

    await expect(promise).resolves.toBe('success');
  });

  it('no espera un `retry-after` que excede el presupuesto: corta para caer al siguiente proveedor', async () => {
    // Groq puede pedir minutos de espera. Dormir ahí adentro deja al usuario
    // colgado (el axios del frontend aborta a los 30s) y bloquea el cron con
    // un proveedor que ya dijo que no va a atender.
    const error = rateLimitError(MAX_RETRY_WAIT_MS + 1);
    const fn = jest.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, 3)).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('usa el backoff exponencial cuando es mayor que el `retry-after`', async () => {
    jest.useFakeTimers();

    const fn = jest
      .fn()
      .mockRejectedValueOnce(rateLimitError(100))
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, 3);

    await jest.advanceTimersByTimeAsync(0);
    expect(fn).toHaveBeenCalledTimes(1);

    // Un retry-after de 100ms no habilita a martillar: el piso sigue siendo
    // el backoff exponencial (~2s con jitter).
    await jest.advanceTimersByTimeAsync(500);
    expect(fn).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(2_500);
    expect(fn).toHaveBeenCalledTimes(2);

    await expect(promise).resolves.toBe('success');
  });

  it('honra el `retry-after` de un 5xx también, no solo el de un 429', async () => {
    jest.useFakeTimers();

    const serverError = new AIProviderException(
      AIProviderType.DEEPSEEK,
      AIErrorType.SERVER_ERROR,
      'DeepSeek server error',
      true,
      new Error('503'),
      6_000,
    );

    const fn = jest
      .fn()
      .mockRejectedValueOnce(serverError)
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, 3);

    await jest.advanceTimersByTimeAsync(2_500);
    expect(fn).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(4_500);
    expect(fn).toHaveBeenCalledTimes(2);

    await expect(promise).resolves.toBe('success');
  });

  it('acepta un presupuesto de espera propio', async () => {
    const error = rateLimitError(3_000);
    const fn = jest.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, 3, { maxWaitMs: 1_000 })).rejects.toThrow(
      error,
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('un error transitorio sin `retry-after` conserva el backoff exponencial', async () => {
    jest.useFakeTimers();

    const timeoutError = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.TIMEOUT,
      'Timeout',
      true,
      new Error('Timeout'),
    );

    const fn = jest
      .fn()
      .mockRejectedValueOnce(timeoutError)
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, 3);

    await jest.advanceTimersByTimeAsync(2_500);
    expect(fn).toHaveBeenCalledTimes(2);

    await expect(promise).resolves.toBe('success');
  });
});
