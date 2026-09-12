/**
 * Carta del día de la portada, resuelta en el servidor (T-SEO-014).
 *
 * **Sólo para Server Components.** Usa `cache()` de React para dedupear dentro
 * de un mismo render; en el cliente no tiene sentido.
 *
 * ## Por qué no usa el sorteo de `/carta-del-dia`
 *
 * La herramienta sortea una carta **por visitante** (`POST /public/daily-reading`
 * con fingerprint) y descuenta el cupo anónimo del día. La portada se sirve
 * cacheada por ISR a todo el mundo: necesita **una** carta por día, la misma
 * para todos, que no consuma el cupo de nadie ni cree registros por cada
 * regeneración. Se elige de forma determinista a partir del día canónico del
 * sitio (Buenos Aires), así el HTML es estable dentro del día y cambia solo.
 *
 * T-SEO-015 reutiliza esta misma función para el bloque "Carta de hoy" de
 * `/carta-del-dia`: las dos rutas no pueden mostrar cartas distintas.
 */

import { cache } from 'react';

import { getCardBySlug, getCards } from './encyclopedia-api';
import { resolveListingData } from '@/lib/metadata/route-data';
import { getCanonicalDateString } from '@/lib/utils/date';
import type { CanonicalDailyCard } from '@/types/home.types';

/**
 * Índice determinista del mazo para una fecha.
 *
 * Hash FNV-1a del string `YYYY-MM-DD`: barato, sin dependencias, y con una
 * distribución suficiente para que la carta no se repita día tras día. No lo
 * garantiza por construcción —es un hash, no una permutación—; el test mide la
 * dispersión en un mes y la ausencia de repeticiones consecutivas en un año
 * concreto. No hace falta que sea criptográfico: es una carta del día, no un
 * secreto.
 */
export function pickDailyCardIndex(dateString: string, deckSize: number): number {
  if (deckSize <= 0) {
    return 0;
  }

  let hash = 0x811c9dc5;
  for (let index = 0; index < dateString.length; index += 1) {
    hash ^= dateString.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash % deckSize;
}

/**
 * La carta del día canónico con su ficha completa, o `undefined` si la API
 * falló o el mazo vino vacío. Degrada igual que `resolveListingData`: la
 * portada tiene texto propio y las otras secciones siguen sirviéndose.
 *
 * El mazo se ordena por `id` antes de elegir para que el orden en que la API
 * devuelve las cartas no cambie cuál toca hoy.
 */
export const getCanonicalDailyCard = cache(async (): Promise<CanonicalDailyCard | undefined> => {
  const canonicalDate = getCanonicalDateString();

  return resolveListingData(async () => {
    const deck = [...(await getCards())].sort((a, b) => a.id - b.id);
    if (deck.length === 0) {
      throw new Error('[T-SEO-014] el listado de cartas vino vacío');
    }

    const chosen = deck[pickDailyCardIndex(canonicalDate, deck.length)];
    // Sin contar la vista: `GET /encyclopedia/cards/:slug` incrementa
    // `viewCount`, y una regeneración de ISR de la portada no es una persona
    // abriendo la ficha (el mismo criterio por el que T-SEO-016 no usa
    // `BY_DATE_SIGN`). El interceptor sólo manda el header durante el build.
    const card = await getCardBySlug(chosen.slug, { countView: false });

    return { canonicalDate, card };
  });
});
