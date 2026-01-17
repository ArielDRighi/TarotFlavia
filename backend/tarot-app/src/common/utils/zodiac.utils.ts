/**
 * Signos zodiacales occidentales
 */
export enum ZodiacSign {
  ARIES = 'aries',
  TAURUS = 'taurus',
  GEMINI = 'gemini',
  CANCER = 'cancer',
  LEO = 'leo',
  VIRGO = 'virgo',
  LIBRA = 'libra',
  SCORPIO = 'scorpio',
  SAGITTARIUS = 'sagittarius',
  CAPRICORN = 'capricorn',
  AQUARIUS = 'aquarius',
  PISCES = 'pisces',
}

/**
 * Información completa de un signo zodiacal
 */
export interface ZodiacSignInfo {
  sign: ZodiacSign;
  nameEs: string;
  nameEn: string;
  symbol: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  quality: 'cardinal' | 'fixed' | 'mutable';
  rulingPlanet: string;
}

/**
 * Información detallada de todos los signos zodiacales
 */
const ZODIAC_SIGNS_INFO: Record<ZodiacSign, ZodiacSignInfo> = {
  [ZodiacSign.ARIES]: {
    sign: ZodiacSign.ARIES,
    nameEs: 'Aries',
    nameEn: 'Aries',
    symbol: '♈',
    element: 'fire',
    quality: 'cardinal',
    rulingPlanet: 'Marte',
  },
  [ZodiacSign.TAURUS]: {
    sign: ZodiacSign.TAURUS,
    nameEs: 'Tauro',
    nameEn: 'Taurus',
    symbol: '♉',
    element: 'earth',
    quality: 'fixed',
    rulingPlanet: 'Venus',
  },
  [ZodiacSign.GEMINI]: {
    sign: ZodiacSign.GEMINI,
    nameEs: 'Géminis',
    nameEn: 'Gemini',
    symbol: '♊',
    element: 'air',
    quality: 'mutable',
    rulingPlanet: 'Mercurio',
  },
  [ZodiacSign.CANCER]: {
    sign: ZodiacSign.CANCER,
    nameEs: 'Cáncer',
    nameEn: 'Cancer',
    symbol: '♋',
    element: 'water',
    quality: 'cardinal',
    rulingPlanet: 'Luna',
  },
  [ZodiacSign.LEO]: {
    sign: ZodiacSign.LEO,
    nameEs: 'Leo',
    nameEn: 'Leo',
    symbol: '♌',
    element: 'fire',
    quality: 'fixed',
    rulingPlanet: 'Sol',
  },
  [ZodiacSign.VIRGO]: {
    sign: ZodiacSign.VIRGO,
    nameEs: 'Virgo',
    nameEn: 'Virgo',
    symbol: '♍',
    element: 'earth',
    quality: 'mutable',
    rulingPlanet: 'Mercurio',
  },
  [ZodiacSign.LIBRA]: {
    sign: ZodiacSign.LIBRA,
    nameEs: 'Libra',
    nameEn: 'Libra',
    symbol: '♎',
    element: 'air',
    quality: 'cardinal',
    rulingPlanet: 'Venus',
  },
  [ZodiacSign.SCORPIO]: {
    sign: ZodiacSign.SCORPIO,
    nameEs: 'Escorpio',
    nameEn: 'Scorpio',
    symbol: '♏',
    element: 'water',
    quality: 'fixed',
    rulingPlanet: 'Plutón',
  },
  [ZodiacSign.SAGITTARIUS]: {
    sign: ZodiacSign.SAGITTARIUS,
    nameEs: 'Sagitario',
    nameEn: 'Sagittarius',
    symbol: '♐',
    element: 'fire',
    quality: 'mutable',
    rulingPlanet: 'Júpiter',
  },
  [ZodiacSign.CAPRICORN]: {
    sign: ZodiacSign.CAPRICORN,
    nameEs: 'Capricornio',
    nameEn: 'Capricorn',
    symbol: '♑',
    element: 'earth',
    quality: 'cardinal',
    rulingPlanet: 'Saturno',
  },
  [ZodiacSign.AQUARIUS]: {
    sign: ZodiacSign.AQUARIUS,
    nameEs: 'Acuario',
    nameEn: 'Aquarius',
    symbol: '♒',
    element: 'air',
    quality: 'fixed',
    rulingPlanet: 'Urano',
  },
  [ZodiacSign.PISCES]: {
    sign: ZodiacSign.PISCES,
    nameEs: 'Piscis',
    nameEn: 'Pisces',
    symbol: '♓',
    element: 'water',
    quality: 'mutable',
    rulingPlanet: 'Neptuno',
  },
};

/**
 * Parsea una fecha de manera segura, sin conversión de timezone
 * @param input - Date object o string YYYY-MM-DD
 * @returns Array [month (1-12), day (1-31)]
 */
function parseDate(input: Date | string): [number, number] {
  let dateStr: string;

  if (typeof input === 'string') {
    dateStr = input;
  } else {
    // Convert Date object to YYYY-MM-DD string using UTC methods
    // to avoid timezone issues
    const year = input.getUTCFullYear();
    const month = String(input.getUTCMonth() + 1).padStart(2, '0');
    const day = String(input.getUTCDate()).padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  }

  // Parse string YYYY-MM-DD manually
  const parts = dateStr.split('T')[0].split('-');
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  return [month, day];
}

/**
 * Calcula el signo zodiacal basado en una fecha de nacimiento
 *
 * @param birthDate - Fecha de nacimiento (Date object o string ISO)
 * @returns El signo zodiacal correspondiente
 *
 * @example
 * ```typescript
 * getZodiacSign(new Date('1990-03-25')); // ZodiacSign.ARIES
 * getZodiacSign('1990-01-15'); // ZodiacSign.CAPRICORN
 * ```
 */
export function getZodiacSign(birthDate: Date | string): ZodiacSign {
  const [month, day] = parseDate(birthDate);

  // Check Capricorn first (special case: crosses year boundary)
  if (
    (month === 12 && day >= 22) || // Dec 22-31
    (month === 1 && day <= 19) // Jan 1-19
  ) {
    return ZodiacSign.CAPRICORN;
  }

  // Check Aquarius
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return ZodiacSign.AQUARIUS;
  }

  // Check Pisces
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return ZodiacSign.PISCES;
  }

  // Check Aries
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return ZodiacSign.ARIES;
  }

  // Check Taurus
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return ZodiacSign.TAURUS;
  }

  // Check Gemini
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return ZodiacSign.GEMINI;
  }

  // Check Cancer
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return ZodiacSign.CANCER;
  }

  // Check Leo
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return ZodiacSign.LEO;
  }

  // Check Virgo
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return ZodiacSign.VIRGO;
  }

  // Check Libra
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return ZodiacSign.LIBRA;
  }

  // Check Scorpio
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return ZodiacSign.SCORPIO;
  }

  // Check Sagittarius
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return ZodiacSign.SAGITTARIUS;
  }

  // Fallback (should never reach here with correct ranges)
  return ZodiacSign.CAPRICORN;
}

/**
 * Obtiene la información completa de un signo zodiacal
 *
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
