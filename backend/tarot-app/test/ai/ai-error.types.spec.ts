import {
  AIErrorType,
  AIProviderException,
  AllProvidersFailedException,
} from '../../src/modules/ai/infrastructure/errors/ai-error.types';
import { AIProviderType } from '../../src/modules/ai/domain/interfaces/ai-provider.interface';
import { HttpStatus } from '@nestjs/common';

describe('AIErrorType', () => {
  it('should have all required error types', () => {
    expect(AIErrorType.RATE_LIMIT).toBe('rate_limit');
    expect(AIErrorType.INVALID_KEY).toBe('invalid_key');
    expect(AIErrorType.TIMEOUT).toBe('timeout');
    expect(AIErrorType.CONTEXT_LENGTH).toBe('context_length');
    expect(AIErrorType.SERVER_ERROR).toBe('server_error');
    expect(AIErrorType.NETWORK_ERROR).toBe('network_error');
    expect(AIErrorType.PROVIDER_UNAVAILABLE).toBe('provider_unavailable');
  });
});

describe('AIProviderException', () => {
  const originalError = new Error('Original error message');

  it('should create exception with all required fields', () => {
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.RATE_LIMIT,
      'Rate limit exceeded',
      true,
      originalError,
    );

    expect(exception.provider).toBe(AIProviderType.GROQ);
    expect(exception.errorType).toBe(AIErrorType.RATE_LIMIT);
    expect(exception.retryable).toBe(true);
    expect(exception.originalError).toBe(originalError);
    expect(exception.message).toBe('Rate limit exceeded');
  });

  it('should extend HttpException', () => {
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.RATE_LIMIT,
      'Rate limit exceeded',
      true,
      originalError,
    );

    expect(exception).toBeInstanceOf(Error);
    expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
  });

  it('should have correct HTTP status for rate limit errors', () => {
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.RATE_LIMIT,
      'Rate limit exceeded',
      true,
      originalError,
    );

    expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
  });

  it('should have correct HTTP status for invalid key errors', () => {
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.INVALID_KEY,
      'Invalid API key',
      false,
      originalError,
    );

    expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should mark rate limit errors as retryable', () => {
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.RATE_LIMIT,
      'Rate limit exceeded',
      true,
      originalError,
    );

    expect(exception.retryable).toBe(true);
  });

  it('should mark invalid key errors as not retryable', () => {
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.INVALID_KEY,
      'Invalid API key',
      false,
      originalError,
    );

    expect(exception.retryable).toBe(false);
  });

  it('should store provider information correctly', () => {
    const exceptionGroq = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.TIMEOUT,
      'Timeout',
      true,
      originalError,
    );

    const exceptionDeepSeek = new AIProviderException(
      AIProviderType.DEEPSEEK,
      AIErrorType.SERVER_ERROR,
      'Server error',
      true,
      originalError,
    );

    expect(exceptionGroq.provider).toBe(AIProviderType.GROQ);
    expect(exceptionDeepSeek.provider).toBe(AIProviderType.DEEPSEEK);
  });

  it('should include error type in exception details', () => {
    const exception = new AIProviderException(
      AIProviderType.OPENAI,
      AIErrorType.CONTEXT_LENGTH,
      'Context too long',
      false,
      originalError,
    );

    expect(exception.errorType).toBe(AIErrorType.CONTEXT_LENGTH);
  });

  it('should preserve original error', () => {
    const customError = new Error('Custom error with details');
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.NETWORK_ERROR,
      'Network failed',
      true,
      customError,
    );

    expect(exception.originalError).toBe(customError);
    expect(exception.originalError.message).toBe('Custom error with details');
  });
});

/**
 * T-IA-005: el `Error` pelado que tiraba `generateCompletion` cuando se
 * agotaba la cadena de proveedores no decía si tenía sentido volver a
 * intentar. El cron de horóscopos, que reintenta por su cuenta, no podía
 * distinguir un 5xx transitorio de un modelo decomisionado: durante el
 * incidente del 26-ago-2026 volvió a pedir cuatro veces contra un 404.
 */
describe('AllProvidersFailedException (T-IA-005)', () => {
  it('mantiene el prefijo del mensaje histórico con el resumen por proveedor', () => {
    const exception = new AllProvidersFailedException([
      { provider: 'groq', error: '404 model_not_found', retryable: false },
      { provider: 'deepseek', error: 'timeout', retryable: true },
    ]);

    expect(exception.message).toBe(
      'All AI providers failed: groq: 404 model_not_found; deepseek: timeout',
    );
  });

  it('es reintentable si al menos un proveedor falló por algo transitorio', () => {
    const exception = new AllProvidersFailedException([
      { provider: 'groq', error: '404 model_not_found', retryable: false },
      { provider: 'deepseek', error: 'timeout', retryable: true },
    ]);

    expect(exception.retryable).toBe(true);
  });

  it('NO es reintentable si todos los fallos son definitivos', () => {
    // El estado exacto del incidente: el modelo no va a reaparecer entre
    // reintento y reintento. Insistir solo quema cuota.
    const exception = new AllProvidersFailedException([
      { provider: 'groq', error: '404 model_not_found', retryable: false },
      { provider: 'deepseek', error: 'API key invalid', retryable: false },
    ]);

    expect(exception.retryable).toBe(false);
  });

  it('NO es reintentable cuando no hay ningún proveedor configurado', () => {
    // Una API key faltante no aparece entre reintento y reintento.
    const exception = new AllProvidersFailedException([]);

    expect(exception.retryable).toBe(false);
  });

  it('conserva el detalle por proveedor para el log', () => {
    const failures = [
      { provider: 'groq', error: 'rate limit', retryable: true },
    ];
    const exception = new AllProvidersFailedException(failures);

    expect(exception.failures).toEqual(failures);
  });

  it('es un Error (los catch existentes lo siguen agarrando)', () => {
    const exception = new AllProvidersFailedException([]);

    expect(exception).toBeInstanceOf(Error);
    expect(exception.name).toBe('AllProvidersFailedException');
  });
});

/**
 * T-IA-005: los proveedores dicen CUÁNDO volver. La excepción tiene que poder
 * llevar ese dato hasta el reintento.
 */
describe('AIProviderException.retryAfterMs (T-IA-005)', () => {
  it('queda sin definir cuando no se informa', () => {
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.RATE_LIMIT,
      'Rate limit',
      true,
      new Error('429'),
    );

    expect(exception.retryAfterMs).toBeUndefined();
  });

  it('transporta la ventana declarada por el proveedor', () => {
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.RATE_LIMIT,
      'Rate limit',
      true,
      new Error('429'),
      17_000,
    );

    expect(exception.retryAfterMs).toBe(17_000);
  });
});
