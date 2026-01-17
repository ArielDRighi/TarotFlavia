/**
 * Zodiac Utils
 *
 * Utilidades para trabajar con signos zodiacales
 */

import { ZodiacSign, ZodiacSignInfo } from '@/types/horoscope.types';

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

/**
 * Rangos de fechas para cada signo zodiacal
 * Formato: [mes (1-12), día (1-31)]
 */
const ZODIAC_RANGES = [
  { sign: ZodiacSign.CAPRICORN, start: [12, 22], end: [1, 19] }, // Cruza el año
  { sign: ZodiacSign.AQUARIUS, start: [1, 20], end: [2, 18] },
  { sign: ZodiacSign.PISCES, start: [2, 19], end: [3, 20] },
  { sign: ZodiacSign.ARIES, start: [3, 21], end: [4, 19] },
  { sign: ZodiacSign.TAURUS, start: [4, 20], end: [5, 20] },
  { sign: ZodiacSign.GEMINI, start: [5, 21], end: [6, 20] },
  { sign: ZodiacSign.CANCER, start: [6, 21], end: [7, 22] },
  { sign: ZodiacSign.LEO, start: [7, 23], end: [8, 22] },
  { sign: ZodiacSign.VIRGO, start: [8, 23], end: [9, 22] },
  { sign: ZodiacSign.LIBRA, start: [9, 23], end: [10, 22] },
  { sign: ZodiacSign.SCORPIO, start: [10, 23], end: [11, 21] },
  { sign: ZodiacSign.SAGITTARIUS, start: [11, 22], end: [12, 21] },
];

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

  for (const range of ZODIAC_RANGES) {
    const [startMonth, startDay] = range.start;
    const [endMonth, endDay] = range.end;

    // Caso especial: Capricornio cruza el año (Dec 22 - Jan 19)
    if (startMonth > endMonth) {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return range.sign;
      }
    } else {
      // Caso normal: el signo está dentro del mismo año
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay) ||
        (month > startMonth && month < endMonth)
      ) {
        return range.sign;
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
