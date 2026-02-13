/**
 * Enums para Carta Astral
 *
 * Define los enums TypeScript y metadata necesarios para el módulo de carta astral,
 * alineados con los enums del backend.
 */

/**
 * Signos zodiacales
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
 * Planetas
 */
export enum Planet {
  SUN = 'sun',
  MOON = 'moon',
  MERCURY = 'mercury',
  VENUS = 'venus',
  MARS = 'mars',
  JUPITER = 'jupiter',
  SATURN = 'saturn',
  URANUS = 'uranus',
  NEPTUNE = 'neptune',
  PLUTO = 'pluto',
}

/**
 * Tipos de aspectos astrológicos
 */
export enum AspectType {
  CONJUNCTION = 'conjunction',
  OPPOSITION = 'opposition',
  SQUARE = 'square',
  TRINE = 'trine',
  SEXTILE = 'sextile',
}

/**
 * Tipo de casa astrológica (1-12)
 */
export type House = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Metadata de signos zodiacales para UI
 */
export const ZODIAC_SIGNS: Record<ZodiacSign, { name: string; symbol: string; element: string }> = {
  [ZodiacSign.ARIES]: { name: 'Aries', symbol: '♈', element: 'fire' },
  [ZodiacSign.TAURUS]: { name: 'Tauro', symbol: '♉', element: 'earth' },
  [ZodiacSign.GEMINI]: { name: 'Géminis', symbol: '♊', element: 'air' },
  [ZodiacSign.CANCER]: { name: 'Cáncer', symbol: '♋', element: 'water' },
  [ZodiacSign.LEO]: { name: 'Leo', symbol: '♌', element: 'fire' },
  [ZodiacSign.VIRGO]: { name: 'Virgo', symbol: '♍', element: 'earth' },
  [ZodiacSign.LIBRA]: { name: 'Libra', symbol: '♎', element: 'air' },
  [ZodiacSign.SCORPIO]: { name: 'Escorpio', symbol: '♏', element: 'water' },
  [ZodiacSign.SAGITTARIUS]: {
    name: 'Sagitario',
    symbol: '♐',
    element: 'fire',
  },
  [ZodiacSign.CAPRICORN]: {
    name: 'Capricornio',
    symbol: '♑',
    element: 'earth',
  },
  [ZodiacSign.AQUARIUS]: { name: 'Acuario', symbol: '♒', element: 'air' },
  [ZodiacSign.PISCES]: { name: 'Piscis', symbol: '♓', element: 'water' },
};

/**
 * Metadata de planetas para UI
 */
export const PLANETS: Record<Planet, { name: string; symbol: string }> = {
  [Planet.SUN]: { name: 'Sol', symbol: '☉' },
  [Planet.MOON]: { name: 'Luna', symbol: '☽' },
  [Planet.MERCURY]: { name: 'Mercurio', symbol: '☿' },
  [Planet.VENUS]: { name: 'Venus', symbol: '♀' },
  [Planet.MARS]: { name: 'Marte', symbol: '♂' },
  [Planet.JUPITER]: { name: 'Júpiter', symbol: '♃' },
  [Planet.SATURN]: { name: 'Saturno', symbol: '♄' },
  [Planet.URANUS]: { name: 'Urano', symbol: '♅' },
  [Planet.NEPTUNE]: { name: 'Neptuno', symbol: '♆' },
  [Planet.PLUTO]: { name: 'Plutón', symbol: '♇' },
};

/**
 * Metadata de aspectos para UI
 */
export const ASPECTS: Record<
  AspectType,
  { name: string; symbol: string; nature: 'harmonious' | 'challenging' | 'neutral' }
> = {
  [AspectType.CONJUNCTION]: {
    name: 'Conjunción',
    symbol: '☌',
    nature: 'neutral',
  },
  [AspectType.OPPOSITION]: {
    name: 'Oposición',
    symbol: '☍',
    nature: 'challenging',
  },
  [AspectType.SQUARE]: { name: 'Cuadratura', symbol: '□', nature: 'challenging' },
  [AspectType.TRINE]: { name: 'Trígono', symbol: '△', nature: 'harmonious' },
  [AspectType.SEXTILE]: { name: 'Sextil', symbol: '⚹', nature: 'harmonious' },
};
