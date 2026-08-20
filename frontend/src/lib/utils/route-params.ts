/**
 * Helpers de segmentos de ruta.
 *
 * Los IDs del proyecto son numéricos (nunca strings ni UUIDs), pero un segmento
 * de URL llega siempre como string y puede traer cualquier cosa. Centralizar el
 * parseo evita que cada ruta invente su propia validación —y que `Number('abc')`
 * termine viajando como `NaN` en la URL de la API (T-SEO-006).
 */

/** Solo dígitos: descarta `1.5`, `1e3`, `+1`, ` 1 ` y el string vacío. */
const SOLO_DIGITOS = /^\d+$/;

/**
 * Convierte un segmento de ruta en un id numérico.
 *
 * @returns el id si el segmento es un entero positivo; `null` si no lo es.
 */
export function parseNumericRouteId(segment: string): number | null {
  if (!SOLO_DIGITOS.test(segment)) {
    return null;
  }

  const id = Number(segment);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
