import { HttpException, HttpStatus } from '@nestjs/common';
import { AIProviderType } from '../../domain/interfaces/ai-provider.interface';

/**
 * Enum for AI error types
 */
export enum AIErrorType {
  RATE_LIMIT = 'rate_limit',
  INVALID_KEY = 'invalid_key',
  TIMEOUT = 'timeout',
  CONTEXT_LENGTH = 'context_length',
  SERVER_ERROR = 'server_error',
  NETWORK_ERROR = 'network_error',
  PROVIDER_UNAVAILABLE = 'provider_unavailable',
  INSUFFICIENT_BALANCE = 'insufficient_balance', // Credits/tokens exhausted - NOT retryable
}

/**
 * Custom exception for AI provider errors
 */
export class AIProviderException extends HttpException {
  public readonly provider: AIProviderType;
  public readonly errorType: AIErrorType;
  public readonly retryable: boolean;
  public readonly originalError: Error;

  /**
   * T-IA-005: cuántos ms pidió esperar el proveedor antes de volver a
   * intentar, si lo dijo. `retryWithBackoff` lo respeta en lugar del backoff
   * ciego: reintentar a los 2s de un 429 por tokens cae dentro de la misma
   * ventana del bucket que se acaba de vaciar y realimenta el 429.
   */
  public readonly retryAfterMs?: number;

  constructor(
    provider: AIProviderType,
    errorType: AIErrorType,
    message: string,
    retryable: boolean,
    originalError: Error,
    retryAfterMs?: number,
  ) {
    // Determine HTTP status based on error type
    const status =
      errorType === AIErrorType.INVALID_KEY
        ? HttpStatus.INTERNAL_SERVER_ERROR
        : HttpStatus.SERVICE_UNAVAILABLE;

    super(message, status);

    this.provider = provider;
    this.errorType = errorType;
    this.retryable = retryable;
    this.originalError = originalError;
    this.retryAfterMs = retryAfterMs;
  }
}

/**
 * Fallo de un proveedor dentro de la cadena de fallback.
 */
export interface AIProviderFailure {
  provider: AIProviderType;
  error: string;
  /** Si tiene sentido volver a intentar contra este proveedor más tarde. */
  retryable: boolean;
}

/**
 * Se agotó la cadena de proveedores sin obtener respuesta.
 *
 * T-IA-005: antes esto era un `Error` pelado, así que quien reintenta por
 * encima —el cron de horóscopos— no podía distinguir un 5xx transitorio de un
 * modelo decomisionado. Durante el incidente del 26-ago-2026 volvió a pedir
 * cuatro veces por signo contra un 404 que no iba a cambiar entre reintentos:
 * cada pasada solo gastaba cuota y empujaba la tanda contra el techo de
 * 8.000 tokens/minuto.
 *
 * Sigue siendo un `Error` con el mismo prefijo de mensaje de siempre, así que
 * los `catch` existentes no cambian.
 */
export class AllProvidersFailedException extends Error {
  /** True si al menos un proveedor falló por algo transitorio. */
  public readonly retryable: boolean;

  public readonly failures: ReadonlyArray<AIProviderFailure>;

  constructor(failures: ReadonlyArray<AIProviderFailure>, message?: string) {
    const summary = failures.map((f) => `${f.provider}: ${f.error}`).join('; ');

    super(message ?? `All AI providers failed: ${summary}`);

    this.name = 'AllProvidersFailedException';
    this.failures = failures;
    // Sin proveedores no hay nada transitorio que esperar: una API key que
    // falta no aparece entre reintento y reintento.
    this.retryable = failures.some((failure) => failure.retryable);
  }
}
