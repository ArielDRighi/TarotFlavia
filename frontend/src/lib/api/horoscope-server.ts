/**
 * Horóscopo del día resuelto en el servidor (T-SEO-016).
 *
 * Es la fuente única de "horóscopo de hoy" para el HTML que se sirve al crawler
 * y al visitante sin JS: la ficha `/horoscopo/[sign]` hoy, y la portada
 * (T-SEO-014) y el hub `/horoscopo` (T-SEO-015) después. Todas parten de la
 * misma lista de 12 y del mismo criterio de fallback, así que no pueden mostrar
 * días distintos entre sí.
 *
 * **Sólo para Server Components.** Usa `cache()` de React, que dedupea dentro
 * de un mismo render en el servidor; en el cliente es un passthrough y este
 * módulo no tiene sentido ahí (el día local del visitante lo maneja
 * `useLocalHoroscope`).
 *
 * "Hoy" es el día calendario **canónico** del sitio (Buenos Aires), no el UTC del
 * proceso: el cron genera a las 01:00 UTC (22:00 ART) pensando en el día
 * argentino que arranca a las 03:00 UTC. Leer el día UTC serviría el horóscopo
 * de mañana entre las 21:00 y las 00:00 de Argentina.
 */

import { cache } from 'react';

import { getHoroscopeByDate } from './horoscope-api';
import { resolveListingData } from '@/lib/metadata/route-data';
import { getCanonicalDateString, shiftDateString } from '@/lib/utils/date';
import type {
  CanonicalDailyHoroscopes,
  ServedDailyHoroscope,
  ZodiacSign,
} from '@/types/horoscope.types';

/**
 * Devuelve los 12 horóscopos del día canónico, con el mismo fallback que el
 * cliente (`useLocalDailyHoroscopes`): si el de hoy todavía no fue generado
 * —el backend responde `[]`, no 404—, se sirve el de ayer marcado como tal.
 * La lista puede venir con menos de 12 si la generación fue parcial: quien
 * itere no debe asumir que están todos los signos.
 *
 * Degrada a `undefined` si la API falla: la página tiene contenido propio (la
 * ficha del signo) y el cliente reintenta al montar, así que no vale la pena
 * tirar abajo el render —ni cachear un error por todo el ISR— por un blip.
 */
export const getCanonicalDailyHoroscopes = cache(
  async (): Promise<CanonicalDailyHoroscopes | undefined> => {
    const canonicalDate = getCanonicalDateString();

    return resolveListingData(async () => {
      const today = await getHoroscopeByDate(canonicalDate);
      if (today.length > 0) {
        return { canonicalDate, horoscopes: today, isShowingPreviousDay: false };
      }

      const yesterday = await getHoroscopeByDate(shiftDateString(canonicalDate, -1));

      return {
        canonicalDate,
        horoscopes: yesterday,
        isShowingPreviousDay: yesterday.length > 0,
      };
    });
  }
);

/**
 * El horóscopo del día canónico para un signo, listo para `HoroscopeSignPanel`.
 *
 * Sale de la lista de 12 y no de `BY_DATE_SIGN` a propósito: ese endpoint
 * incrementa el contador de vistas del horóscopo, y una regeneración de ISR no
 * es una persona mirándolo. Además así las tres rutas comparten la misma
 * request cacheada por render.
 *
 * `undefined` si la API falló o si el signo no vino en la lista (generación
 * parcial): en ambos casos el panel cae al comportamiento cliente de siempre.
 */
export async function getCanonicalHoroscopeForSign(
  sign: ZodiacSign
): Promise<ServedDailyHoroscope | undefined> {
  const daily = await getCanonicalDailyHoroscopes();
  const horoscope = daily?.horoscopes.find((item) => item.zodiacSign === sign);

  if (!daily || !horoscope) {
    return undefined;
  }

  return {
    canonicalDate: daily.canonicalDate,
    horoscope,
    isShowingPreviousDay: daily.isShowingPreviousDay,
  };
}
