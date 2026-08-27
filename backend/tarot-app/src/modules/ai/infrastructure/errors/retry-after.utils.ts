/**
 * Lectura de la ventana de reintento que declara el proveedor.
 *
 * T-IA-005: sin esto, la respuesta a un 429 por tokens era volver a pedir a los
 * 2s del backoff ciego —dentro de la misma ventana del bucket que se acababa de
 * vaciar—, así que el reintento realimentaba el 429 y gastaba cuota que no
 * existía. Cada proveedor lo dice a su manera:
 *
 * - `retry-after-ms`  → milisegundos (OpenAI).
 * - `retry-after`     → segundos o fecha HTTP (estándar; Groq y DeepSeek).
 * - `x-ratelimit-reset-tokens` / `x-ratelimit-reset-requests` → duración con
 *   sufijo, formato propio de Groq (`"7.66s"`, `"2m59.56s"`, `"500ms"`).
 *
 * ⚠️ Gemini no manda ninguna de estas: publica su hint en el CUERPO del error
 *   (`RetryInfo.retryDelay`), así que sus 429 llegan sin ventana declarada y no
 *   se reintentan en-proveedor. Es aceptable —Gemini está despriorizado en la
 *   cadena— pero no es un descuido.
 *
 * Hay DOS lectores a propósito, y la diferencia importa:
 *
 * - `parseRetryAfterMs` mira solo `retry-after` / `retry-after-ms`, las únicas
 *   cabeceras que significan "esperá tanto". Es la que se usa fuera del 429.
 * - `parseRateLimitRetryAfterMs` agrega los `x-ratelimit-reset-*`, que son
 *   estado del bucket y viajan en respuestas normales además de en los 429.
 *   Leerlas fuera de un rate limit convertía un 503 transitorio en "esperá 3
 *   minutos" y lo dejaba sin ningún reintento.
 */

/** Cabeceras que declaran una espera. */
const RETRY_AFTER_MS_HEADER = 'retry-after-ms';
const RETRY_AFTER_HEADER = 'retry-after';

/** Cabeceras de estado del bucket. Solo tienen sentido ante un 429. */
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

const DURATION_PATTERN = /(\d+(?:\.\d+)?)(ms|s|m|h)/g;

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
  const trimmed = value.trim();

  // `Number('')` es 0: una cabecera vacía se leería como "reintentá ya", que es
  // justo lo contrario de lo que significa no traerla.
  if (trimmed === '') {
    return undefined;
  }

  const seconds = Number(trimmed);

  if (Number.isFinite(seconds)) {
    return seconds >= 0 ? Math.round(seconds * 1000) : undefined;
  }

  const target = Date.parse(trimmed);

  if (Number.isNaN(target)) {
    return undefined;
  }

  return Math.max(0, target - Date.now());
}

/** `"2m59.56s"` → 179.560. Formato propio de Groq. */
function parseDuration(value: string): number | undefined {
  const parts = [...value.matchAll(DURATION_PATTERN)];

  if (parts.length === 0) {
    return undefined;
  }

  const total = parts.reduce(
    (sum, part) => sum + Number(part[1]) * DURATION_UNIT_MS[part[2]],
    0,
  );

  return Math.round(total);
}

/** Contenedores de cabeceras a mirar, en orden. */
function headerBags(error: unknown): unknown[] {
  if (!error || typeof error !== 'object') {
    return [];
  }

  const { headers, response } = error as ErrorWithHeaders;

  return [headers, response?.headers].filter(
    (bag) => bag !== undefined && bag !== null,
  );
}

/**
 * Espera declarada explícitamente por el proveedor. `retry-after-ms` gana sobre
 * `retry-after` por ser más preciso: los dos expresan la misma ventana.
 */
function declaredWaitMs(bag: unknown): number | undefined {
  const explicitMs = readHeader(bag, RETRY_AFTER_MS_HEADER);

  if (explicitMs !== undefined) {
    const trimmed = explicitMs.trim();
    const parsed = trimmed === '' ? NaN : Number(trimmed);

    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.round(parsed);
    }
  }

  const retryAfter = readHeader(bag, RETRY_AFTER_HEADER);

  return retryAfter === undefined
    ? undefined
    : parseSecondsOrHttpDate(retryAfter);
}

/** Ventanas de reposición del bucket informadas por Groq. */
function bucketResetsMs(bag: unknown): number[] {
  return RATE_LIMIT_RESET_HEADERS.map((name) => readHeader(bag, name))
    .filter((value): value is string => value !== undefined)
    .map(parseDuration)
    .filter((value): value is number => value !== undefined);
}

/**
 * Cuántos ms pidió esperar el proveedor, o `undefined` si no lo dijo.
 *
 * Mira SOLO las cabeceras que declaran una espera. Usar esta fuera de un rate
 * limit (ej. en un 503).
 */
export function parseRetryAfterMs(error: unknown): number | undefined {
  for (const bag of headerBags(error)) {
    const declared = declaredWaitMs(bag);

    if (declared !== undefined) {
      return declared;
    }
  }

  return undefined;
}

/**
 * Igual que `parseRetryAfterMs` pero considerando también las ventanas de
 * reposición del bucket. Para usar ante un 429.
 *
 * Se queda con la ventana MÁS LEJANA de todas las informadas: en el tier
 * gratuito de Groq el techo que se toca primero es el de tokens, y volver
 * cuando se repuso el de requests —o cuando vence un `retry-after` más corto—
 * garantiza otro 429.
 */
export function parseRateLimitRetryAfterMs(error: unknown): number | undefined {
  for (const bag of headerBags(error)) {
    const candidates = [declaredWaitMs(bag), ...bucketResetsMs(bag)].filter(
      (value): value is number => value !== undefined,
    );

    if (candidates.length > 0) {
      return Math.max(...candidates);
    }
  }

  return undefined;
}
