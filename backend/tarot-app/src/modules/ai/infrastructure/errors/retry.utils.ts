import { AIErrorType, AIProviderException } from './ai-error.types';
import {
  MAX_RETRY_WAIT_MS,
  RETRY_AFTER_MARGIN_MS,
  RETRY_BASE_DELAY_MS,
} from '../../domain/constants/ai-retry.constants';

export interface RetryOptions {
  /**
   * Techo de espera dentro del mismo proveedor. Si hay que esperar más que
   * esto, se corta el reintento y se deja que el llamador caiga al proveedor
   * siguiente. Default: `MAX_RETRY_WAIT_MS`.
   */
  maxWaitMs?: number;
}

/**
 * Reintenta una función con backoff exponencial.
 *
 * T-IA-005 — la política, en una línea: si el proveedor dice CUÁNDO volver, se
 * le hace caso; si no lo dice y el fallo es un rate limit, no se insiste contra
 * ese proveedor.
 *
 * El backoff ciego (2s, 4s) está bien para un 5xx o un timeout, pero es
 * exactamente lo que no hay que hacer ante un 429 por tokens: el bucket de Groq
 * se repone POR MINUTO, así que volver a los 2s garantiza otro 429 y consume
 * cuota que no existe. Quien puede responder ahora es el proveedor siguiente de
 * la cadena, y a él llega `generateCompletion` al propagarse el error.
 *
 * @param fn Función a reintentar
 * @param maxRetries Cantidad máxima de intentos (el primero incluido)
 * @param options Presupuesto de espera
 * @returns Resultado de la función
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  options: RetryOptions = {},
): Promise<T> {
  const maxWaitMs = options.maxWaitMs ?? MAX_RETRY_WAIT_MS;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (error instanceof AIProviderException) {
        if (!error.retryable) {
          throw error;
        }
      } else {
        // Non-AIProviderException errors are not retried
        throw error;
      }

      // Last attempt - don't wait
      if (attempt === maxRetries - 1) {
        throw error;
      }

      const delay = resolveDelay(error, attempt, maxWaitMs);

      // `null` = no tiene sentido esperar acá: se propaga para que el llamador
      // pase al proveedor siguiente.
      if (delay === null) {
        throw error;
      }

      // Wait before next retry
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Cuánto esperar antes del próximo intento, o `null` para no reintentar contra
 * este proveedor.
 */
function resolveDelay(
  error: AIProviderException,
  attempt: number,
  maxWaitMs: number,
): number | null {
  // Backoff exponencial con jitter (±20%): 2s, 4s, 8s...
  const baseDelay = Math.pow(2, attempt + 1) * RETRY_BASE_DELAY_MS;
  const jitter = baseDelay * 0.2 * (Math.random() * 2 - 1);
  const backoffDelay = Math.round(baseDelay + jitter);

  if (error.retryAfterMs === undefined) {
    // Un rate limit que no dice cuándo volver: insistir a ciegas dentro de la
    // misma ventana del bucket es lo que realimentaba el 429.
    if (error.errorType === AIErrorType.RATE_LIMIT) {
      return null;
    }

    return withinBudget(backoffDelay, maxWaitMs);
  }

  // El `retry-after` es un piso, no un techo: si el backoff pide más, manda el
  // backoff. Y se le suma un margen para no volver justo en el borde.
  return withinBudget(
    Math.max(error.retryAfterMs + RETRY_AFTER_MARGIN_MS, backoffDelay),
    maxWaitMs,
  );
}

/**
 * El presupuesto se aplica a la espera FINAL, venga del `retry-after` o del
 * backoff. El proveedor puede pedir minutos, y dormirlos acá adentro no salva
 * la request —el axios del frontend aborta a los 30s— y encima bloquea el
 * fallback: cortar y pasar al proveedor siguiente es lo que sí puede responder.
 */
function withinBudget(delay: number, maxWaitMs: number): number | null {
  return delay > maxWaitMs ? null : delay;
}
