import { Logger } from '@nestjs/common';

/**
 * Cantidad de proxies confiables delante de la app. En Railway hay uno (su edge), que es
 * el que agrega la IP real del cliente al `X-Forwarded-For`.
 */
export const DEFAULT_TRUST_PROXY_HOPS = 1;

/**
 * Traduce `TRUST_PROXY_HOPS` al valor de `trust proxy` de Express.
 *
 * **Por qué existe esta variable** (T-PROD-014): `X-Forwarded-For` se va apilando, y el
 * primer elemento lo escribe *el cliente*. Antes el rate limiting leía justamente ese
 * primero, así que rotarlo (`X-Forwarded-For: 1.2.3.<random>`) daba un tracker nuevo en
 * cada request y el límite —la única defensa de los endpoints públicos, incluido el
 * formulario de contacto— no llegaba a dispararse nunca.
 *
 * Con `trust proxy = n`, Express descarta los `n` saltos confiables (los más cercanos a
 * la app) y `request.ip` queda en la IP real del cliente, ignorando lo que este haya
 * inventado. El número **tiene que coincidir con la cadena de proxies real**:
 *
 * - Demasiado bajo → el atacante vuelve a poder falsear su IP.
 * - Demasiado alto → `request.ip` termina siendo la IP de un proxy, la misma para todo el
 *   mundo: todos los usuarios caen en el mismo bucket y la app empieza a devolver 429 a
 *   gente real.
 *
 * Por eso es configurable por entorno: si mañana se agrega un CDN (Cloudflare delante de
 * Railway ⇒ 2), Ops lo ajusta sin tocar código.
 *
 * @returns el número de saltos confiables (≥ 0).
 */
export function resolveTrustProxyHops(rawValue?: string | number): number {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return DEFAULT_TRUST_PROXY_HOPS;
  }

  const hops = Number(rawValue);

  if (!Number.isInteger(hops) || hops < 0) {
    throw new Error(
      `❌ TRUST_PROXY_HOPS must be a non-negative integer (got: ${String(rawValue)}).\n` +
        `  It is the number of trusted proxies in front of the app (Railway: 1, no proxy: 0).\n` +
        `  A wrong value either lets clients spoof their IP past the rate limit, or collapses ` +
        `every user into a single bucket and 429s real traffic.`,
    );
  }

  return hops;
}

/**
 * Aplica `trust proxy` a la app de Express y deja el valor en el log del arranque: si el
 * rate limiting se comporta raro en producción, este es el primer número a mirar.
 */
export function configureTrustProxy(
  app: { set: (key: string, value: unknown) => unknown },
  rawValue?: string | number,
  logger: Logger = new Logger('TrustProxy'),
): number {
  const hops = resolveTrustProxyHops(rawValue);

  app.set('trust proxy', hops);

  logger.log(
    hops === 0
      ? 'trust proxy = 0: no proxy in front. request.ip is the socket address and X-Forwarded-For is ignored.'
      : `trust proxy = ${hops}: the last ${hops} hop(s) of X-Forwarded-For are trusted; anything the client puts before them is ignored for rate limiting.`,
  );

  return hops;
}
