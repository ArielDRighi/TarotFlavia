/**
 * Lectura de la ventana de reintento que declara el proveedor.
 *
 * T-IA-005: sin esto, la respuesta a un 429 por tokens era volver a pedir a los
 * 2s del backoff ciego —dentro de la misma ventana del bucket que se acababa de
 * vaciar—, así que el reintento realimentaba el 429 y gastaba cuota que no
 * existía. Los tres proveedores dicen cuándo volver, cada uno a su manera:
 *
 * - `retry-after-ms`  → milisegundos (OpenAI).
 * - `retry-after`     → segundos o fecha HTTP (estándar; Groq y DeepSeek).
 * - `x-ratelimit-reset-tokens` / `x-ratelimit-reset-requests` → duración con
 *   sufijo, formato propio de Groq (`"7.66s"`, `"2m59.56s"`, `"500ms"`).
 */

/** Cabeceras consultadas, en orden de preferencia. */
const RETRY_AFTER_MS_HEADER = 'retry-after-ms';
const RETRY_AFTER_HEADER = 'retry-after';
const RATE_LIMIT_RESET_HEADERS = [
  'x-ratelimit-reset-tokens',
  'x-ratelimit-reset-requests',
];

/** Multiplicadores del formato de duración de Groq. */
const DURATION_UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
};

const DURATION_PART = /(\d+(?:\.\d+)?)(ms|s|m|h)/g;

interface HeaderBag {
  get?: (name: string) => string | null | undefined;
  [key: string]: unknown;
}

interface ErrorWithHeaders {
  headers?: unknown;
  response?: { headers?: unknown };
}

/**
 * Lee una cabecera de un contenedor que puede ser un `Headers` (con `.get`) o
 * un objeto plano, sin distinguir mayúsculas.
 */
function readHeader(headers: unknown, name: string): string | undefined {
  if (!headers || typeof headers !== 'object') {
    return undefined;
  }

  const bag = headers as HeaderBag;

  if (typeof bag.get === 'function') {
    const value = bag.get(name);
    return typeof value === 'string' ? value : undefined;
  }

  const match = Object.keys(bag).find(
    (key) => key.toLowerCase() === name.toLowerCase(),
  );

  if (match === undefined) {
    return undefined;
  }

  const value = bag[match];
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : undefined;
}

/** `"30"` / `"2.5"` → milisegundos. Fechas HTTP → lo que falte hasta esa fecha. */
function parseSecondsOrHttpDate(value: string): number | undefined {
  const seconds = Number(value.trim());

  if (Number.isFinite(seconds)) {
    return seconds >= 0 ? Math.round(seconds * 1000) : undefined;
  }

  const target = Date.parse(value);

  if (Number.isNaN(target)) {
    return undefined;
  }

  return Math.max(0, target - Date.now());
}

/** `"2m59.56s"` → 179.560. Formato propio de Groq. */
function parseDuration(value: string): number | undefined {
  DURATION_PART.lastIndex = 0;

  let total = 0;
  let matched = false;
  let part: RegExpExecArray | null;

  while ((part = DURATION_PART.exec(value)) !== null) {
    matched = true;
    total += Number(part[1]) * DURATION_UNIT_MS[part[2]];
  }

  return matched ? Math.round(total) : undefined;
}

/**
 * Extrae de un error de proveedor cuántos milisegundos hay que esperar antes de
 * volver a intentar, o `undefined` si el proveedor no lo dice.
 *
 * Cuando llegan varias ventanas de reset se toma la MÁS LEJANA: en el tier
 * gratuito de Groq el techo que se toca primero es el de tokens, y volver
 * cuando se repuso el de requests garantiza otro 429.
 */
export function parseRetryAfterMs(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const { headers, response } = error as ErrorWithHeaders;
  const bags = [headers, response?.headers].filter(
    (bag) => bag !== undefined && bag !== null,
  );

  for (const bag of bags) {
    const explicitMs = readHeader(bag, RETRY_AFTER_MS_HEADER);
    if (explicitMs !== undefined) {
      const parsed = Number(explicitMs.trim());
      if (Number.isFinite(parsed) && parsed >= 0) {
        return Math.round(parsed);
      }
    }

    const retryAfter = readHeader(bag, RETRY_AFTER_HEADER);
    if (retryAfter !== undefined) {
      const parsed = parseSecondsOrHttpDate(retryAfter);
      if (parsed !== undefined) {
        return parsed;
      }
    }

    const resets = RATE_LIMIT_RESET_HEADERS.map((name) => readHeader(bag, name))
      .filter((value): value is string => value !== undefined)
      .map(parseDuration)
      .filter((value): value is number => value !== undefined);

    if (resets.length > 0) {
      return Math.max(...resets);
    }
  }

  return undefined;
}
