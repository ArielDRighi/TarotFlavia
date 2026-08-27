/**
 * Política de reintentos contra los proveedores de IA.
 *
 * T-IA-005. Sobre este reintento se apila el del cron de horóscopos, y el
 * producto de los dos es lo que desborda el techo de 8.000 tokens/minuto del
 * tier gratuito de Groq. Los valores de acá y los de `horoscope-cron.config.ts`
 * se calculan juntos: hay tests de guarda en `horoscope-cron.config.spec.ts`
 * que fallan si la combinación vuelve a pasarse del techo.
 */

/**
 * Intentos por proveedor dentro de `AIProviderService` (el primero incluido).
 *
 * Valor: 2
 * Razón: con 3 la ráfaga era de 3 llamadas en ~6s; sumadas a los signos que la
 *   cadencia de 15s mete en el resto del minuto daba 6 llamadas ≈ 8.400
 *   tokens/min, por encima del techo de 8.000. Con 2 la peor ventana queda en
 *   5 llamadas ≈ 7.000.
 *
 * ⚠️ No es el único nivel de recuperación: por encima están la cadena de
 *   fallback entre proveedores, el reintento del cron y la pasada de
 *   verificación de las 02:00 UTC.
 */
export const MAX_RETRY_ATTEMPTS = 2;

/**
 * Base del backoff exponencial: el reintento n espera 2^n × este valor.
 *
 * Con 1.000ms: 2s antes del segundo intento, 4s antes del tercero.
 */
export const RETRY_BASE_DELAY_MS = 1000;

/**
 * Techo de lo que se está dispuesto a dormir dentro de un mismo proveedor.
 *
 * Valor: 20.000ms
 * Razón: el presupuesto real lo fija el axios del frontend, que aborta a los
 *   30s (`frontend/src/lib/api/axios-config.ts`). Si un 429 pide más espera que
 *   esto, dormir ahí adentro no salva la request —el usuario ya vio el error—
 *   y encima bloquea el fallback. Se corta y se pasa al proveedor siguiente,
 *   que es lo que sí puede responder ahora.
 */
export const MAX_RETRY_WAIT_MS = 20_000;

/**
 * Margen que se le suma al `retry-after` del proveedor antes de reintentar.
 *
 * Volver exactamente en el borde de la ventana declarada suele devolver otro
 * 429 por desfasaje de relojes.
 */
export const RETRY_AFTER_MARGIN_MS = 500;
