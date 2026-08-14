/**
 * Zodiac Utils
 *
 * Utilidades para trabajar con signos zodiacales
 */

import { ZodiacElement, ZodiacModality, ZodiacSign, ZodiacSignInfo } from '@/types/horoscope.types';

/**
 * Información completa de todos los signos zodiacales
 */
export const ZODIAC_SIGNS_INFO: Record<ZodiacSign, ZodiacSignInfo> = {
  [ZodiacSign.ARIES]: {
    sign: ZodiacSign.ARIES,
    nameEs: 'Aries',
    nameEn: 'Aries',
    symbol: '♈',
    element: 'fire',
  },
  [ZodiacSign.TAURUS]: {
    sign: ZodiacSign.TAURUS,
    nameEs: 'Tauro',
    nameEn: 'Taurus',
    symbol: '♉',
    element: 'earth',
  },
  [ZodiacSign.GEMINI]: {
    sign: ZodiacSign.GEMINI,
    nameEs: 'Géminis',
    nameEn: 'Gemini',
    symbol: '♊',
    element: 'air',
  },
  [ZodiacSign.CANCER]: {
    sign: ZodiacSign.CANCER,
    nameEs: 'Cáncer',
    nameEn: 'Cancer',
    symbol: '♋',
    element: 'water',
  },
  [ZodiacSign.LEO]: {
    sign: ZodiacSign.LEO,
    nameEs: 'Leo',
    nameEn: 'Leo',
    symbol: '♌',
    element: 'fire',
  },
  [ZodiacSign.VIRGO]: {
    sign: ZodiacSign.VIRGO,
    nameEs: 'Virgo',
    nameEn: 'Virgo',
    symbol: '♍',
    element: 'earth',
  },
  [ZodiacSign.LIBRA]: {
    sign: ZodiacSign.LIBRA,
    nameEs: 'Libra',
    nameEn: 'Libra',
    symbol: '♎',
    element: 'air',
  },
  [ZodiacSign.SCORPIO]: {
    sign: ZodiacSign.SCORPIO,
    nameEs: 'Escorpio',
    nameEn: 'Scorpio',
    symbol: '♏',
    element: 'water',
  },
  [ZodiacSign.SAGITTARIUS]: {
    sign: ZodiacSign.SAGITTARIUS,
    nameEs: 'Sagitario',
    nameEn: 'Sagittarius',
    symbol: '♐',
    element: 'fire',
  },
  [ZodiacSign.CAPRICORN]: {
    sign: ZodiacSign.CAPRICORN,
    nameEs: 'Capricornio',
    nameEn: 'Capricorn',
    symbol: '♑',
    element: 'earth',
  },
  [ZodiacSign.AQUARIUS]: {
    sign: ZodiacSign.AQUARIUS,
    nameEs: 'Acuario',
    nameEn: 'Aquarius',
    symbol: '♒',
    element: 'air',
  },
  [ZodiacSign.PISCES]: {
    sign: ZodiacSign.PISCES,
    nameEs: 'Piscis',
    nameEn: 'Pisces',
    symbol: '♓',
    element: 'water',
  },
};

/** Fecha de calendario sin año: `[mes (1-12), día (1-31)]`. */
type MonthDay = readonly [number, number];

/** Tramo del año que ocupa un signo. */
interface ZodiacDateRange {
  start: MonthDay;
  end: MonthDay;
}

/**
 * Rangos de fechas para cada signo zodiacal.
 *
 * Es la única fuente de las fechas: `getZodiacSignFromDate` las recorre para
 * resolver un cumpleaños y `getZodiacDateRange` las formatea para la ficha
 * (T-SEO-004), en vez de repetirlas escritas en el contenido.
 */
const ZODIAC_DATE_RANGES: Record<ZodiacSign, ZodiacDateRange> = {
  [ZodiacSign.CAPRICORN]: { start: [12, 22], end: [1, 19] }, // Cruza el año
  [ZodiacSign.AQUARIUS]: { start: [1, 20], end: [2, 18] },
  [ZodiacSign.PISCES]: { start: [2, 19], end: [3, 20] },
  [ZodiacSign.ARIES]: { start: [3, 21], end: [4, 19] },
  [ZodiacSign.TAURUS]: { start: [4, 20], end: [5, 20] },
  [ZodiacSign.GEMINI]: { start: [5, 21], end: [6, 20] },
  [ZodiacSign.CANCER]: { start: [6, 21], end: [7, 22] },
  [ZodiacSign.LEO]: { start: [7, 23], end: [8, 22] },
  [ZodiacSign.VIRGO]: { start: [8, 23], end: [9, 22] },
  [ZodiacSign.LIBRA]: { start: [9, 23], end: [10, 22] },
  [ZodiacSign.SCORPIO]: { start: [10, 23], end: [11, 21] },
  [ZodiacSign.SAGITTARIUS]: { start: [11, 22], end: [12, 21] },
};

/**
 * Calcula el signo zodiacal a partir de una fecha de nacimiento
 * @param birthDate - Fecha de nacimiento
 * @returns El signo zodiacal correspondiente
 *
 * @example
 * ```typescript
 * getZodiacSignFromDate(new Date('1990-03-25')); // ZodiacSign.ARIES
 * getZodiacSignFromDate(new Date('1990-12-25')); // ZodiacSign.CAPRICORN
 * ```
 */
export function getZodiacSignFromDate(birthDate: Date): ZodiacSign {
  // Usar UTC para evitar problemas de timezone
  const month = birthDate.getUTCMonth() + 1; // getUTCMonth() returns 0-11
  const day = birthDate.getUTCDate();

  for (const sign of Object.values(ZodiacSign)) {
    const [startMonth, startDay] = ZODIAC_DATE_RANGES[sign].start;
    const [endMonth, endDay] = ZODIAC_DATE_RANGES[sign].end;

    // Caso especial: Capricornio cruza el año (Dec 22 - Jan 19)
    if (startMonth > endMonth) {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return sign;
      }
    } else {
      // Caso normal: el signo está dentro del mismo año
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay) ||
        (month > startMonth && month < endMonth)
      ) {
        return sign;
      }
    }
  }

  // Fallback (no debería llegar aquí si los rangos están completos)
  return ZodiacSign.CAPRICORN;
}

/**
 * Obtiene la información completa de un signo zodiacal
 * @param sign - Signo zodiacal
 * @returns Información completa del signo
 *
 * @example
 * ```typescript
 * const info = getZodiacSignInfo(ZodiacSign.ARIES);
 * console.log(info.nameEs); // "Aries"
 * console.log(info.symbol); // "♈"
 * console.log(info.element); // "fire"
 * ```
 */
export function getZodiacSignInfo(sign: ZodiacSign): ZodiacSignInfo {
  return ZODIAC_SIGNS_INFO[sign];
}

/**
 * Valida el segmento de una URL (`/horoscopo/aries`) antes de tratarlo como signo.
 *
 * Es un type guard para que ni la ruta ni el componente tengan que castear el
 * `string` que llega de `params`.
 */
export function isZodiacSign(value: string): value is ZodiacSign {
  return Object.hasOwn(ZODIAC_SIGNS_INFO, value);
}

/* -------------------------------------------------------------------------- */
/* Ficha estática del signo (T-SEO-004)                                        */
/* -------------------------------------------------------------------------- */

/** Nombre en español de cada elemento, para mostrarlo en la ficha. */
export const ZODIAC_ELEMENT_LABELS: Record<ZodiacElement, string> = {
  fire: 'Fuego',
  earth: 'Tierra',
  air: 'Aire',
  water: 'Agua',
};

/** Meses en español, en minúscula porque van dentro de la frase "21 de marzo". */
const MONTH_NAMES_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** Signos de la rueda en su orden tradicional (Aries primero). */
const ZODIAC_WHEEL = Object.values(ZodiacSign);

/** Modalidades en el orden en que se repiten a lo largo de la rueda. */
const MODALITY_CYCLE: ZodiacModality[] = ['Cardinal', 'Fija', 'Mutable'];

/**
 * Elemento con el que cada elemento se lleva bien: fuego con aire, tierra con
 * agua. Es la afinidad clásica por temperamento y es simétrica.
 */
const COMPLEMENTARY_ELEMENT: Record<ZodiacElement, ZodiacElement> = {
  fire: 'air',
  air: 'fire',
  earth: 'water',
  water: 'earth',
};

function formatMonthDay([month, day]: MonthDay): string {
  return `${day} de ${MONTH_NAMES_ES[month - 1]}`;
}

/**
 * Rango de fechas del signo, ya formateado para mostrarlo.
 *
 * @example
 * ```typescript
 * getZodiacDateRange(ZodiacSign.ARIES); // '21 de marzo — 19 de abril'
 * ```
 */
export function getZodiacDateRange(sign: ZodiacSign): string {
  const { start, end } = ZODIAC_DATE_RANGES[sign];

  return `${formatMonthDay(start)} — ${formatMonthDay(end)}`;
}

/**
 * Modalidad (cardinal, fija o mutable) del signo.
 *
 * Se calcula en vez de escribirse: la rueda alterna las tres modalidades en
 * orden desde Aries, así que la posición del signo ya la determina.
 */
export function getZodiacModality(sign: ZodiacSign): ZodiacModality {
  return MODALITY_CYCLE[ZODIAC_WHEEL.indexOf(sign) % MODALITY_CYCLE.length];
}

/**
 * Signo opuesto en la rueda (a seis posiciones): el eje complementario.
 *
 * @example
 * ```typescript
 * getOppositeSign(ZodiacSign.ARIES); // ZodiacSign.LIBRA
 * ```
 */
export function getOppositeSign(sign: ZodiacSign): ZodiacSign {
  const half = ZODIAC_WHEEL.length / 2;

  return ZODIAC_WHEEL[(ZODIAC_WHEEL.indexOf(sign) + half) % ZODIAC_WHEEL.length];
}

/**
 * Signos con los que el signo sintoniza: los otros dos de su elemento y los
 * tres del elemento complementario.
 *
 * Es la afinidad por temperamento, la misma que describe el artículo de la
 * enciclopedia, y se deriva del elemento para que no puedan contradecirse.
 * La relación es recíproca.
 */
export function getHarmonicSigns(sign: ZodiacSign): ZodiacSign[] {
  const { element } = ZODIAC_SIGNS_INFO[sign];
  const friendlyElement = COMPLEMENTARY_ELEMENT[element];

  const sameElement = ZODIAC_WHEEL.filter(
    (candidate) => candidate !== sign && ZODIAC_SIGNS_INFO[candidate].element === element
  );
  const complementary = ZODIAC_WHEEL.filter(
    (candidate) => ZODIAC_SIGNS_INFO[candidate].element === friendlyElement
  );

  return [...sameElement, ...complementary];
}

/**
 * Slug del artículo del signo en la enciclopedia.
 *
 * La enciclopedia indexa por el nombre en español sin acentos (`tauro`,
 * `geminis`), no por la clave en inglés del enum (`taurus`, `gemini`). Se deriva
 * de `nameEs` y los 12 valores están fijados en los tests: si la enciclopedia
 * cambia un slug, falla ahí y no en un enlace roto en producción.
 */
export function getZodiacEncyclopediaSlug(sign: ZodiacSign): string {
  return ZODIAC_SIGNS_INFO[sign].nameEs
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // marcas diacríticas combinantes
    .toLowerCase();
}
