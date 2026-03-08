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
 * Alineado con ZodiacSignMetadata del backend
 */
export const ZODIAC_SIGNS: Record<
  ZodiacSign,
  {
    name: string;
    symbol: string;
    element: 'fire' | 'earth' | 'air' | 'water';
    modality: 'cardinal' | 'fixed' | 'mutable';
    unicode: string;
    startDate: { month: number; day: number };
    endDate: { month: number; day: number };
  }
> = {
  [ZodiacSign.ARIES]: {
    name: 'Aries',
    symbol: '♈',
    element: 'fire',
    modality: 'cardinal',
    unicode: '\u2648',
    startDate: { month: 3, day: 21 },
    endDate: { month: 4, day: 19 },
  },
  [ZodiacSign.TAURUS]: {
    name: 'Tauro',
    symbol: '♉',
    element: 'earth',
    modality: 'fixed',
    unicode: '\u2649',
    startDate: { month: 4, day: 20 },
    endDate: { month: 5, day: 20 },
  },
  [ZodiacSign.GEMINI]: {
    name: 'Géminis',
    symbol: '♊',
    element: 'air',
    modality: 'mutable',
    unicode: '\u264A',
    startDate: { month: 5, day: 21 },
    endDate: { month: 6, day: 20 },
  },
  [ZodiacSign.CANCER]: {
    name: 'Cáncer',
    symbol: '♋',
    element: 'water',
    modality: 'cardinal',
    unicode: '\u264B',
    startDate: { month: 6, day: 21 },
    endDate: { month: 7, day: 22 },
  },
  [ZodiacSign.LEO]: {
    name: 'Leo',
    symbol: '♌',
    element: 'fire',
    modality: 'fixed',
    unicode: '\u264C',
    startDate: { month: 7, day: 23 },
    endDate: { month: 8, day: 22 },
  },
  [ZodiacSign.VIRGO]: {
    name: 'Virgo',
    symbol: '♍',
    element: 'earth',
    modality: 'mutable',
    unicode: '\u264D',
    startDate: { month: 8, day: 23 },
    endDate: { month: 9, day: 22 },
  },
  [ZodiacSign.LIBRA]: {
    name: 'Libra',
    symbol: '♎',
    element: 'air',
    modality: 'cardinal',
    unicode: '\u264E',
    startDate: { month: 9, day: 23 },
    endDate: { month: 10, day: 22 },
  },
  [ZodiacSign.SCORPIO]: {
    name: 'Escorpio',
    symbol: '♏',
    element: 'water',
    modality: 'fixed',
    unicode: '\u264F',
    startDate: { month: 10, day: 23 },
    endDate: { month: 11, day: 21 },
  },
  [ZodiacSign.SAGITTARIUS]: {
    name: 'Sagitario',
    symbol: '♐',
    element: 'fire',
    modality: 'mutable',
    unicode: '\u2650',
    startDate: { month: 11, day: 22 },
    endDate: { month: 12, day: 21 },
  },
  [ZodiacSign.CAPRICORN]: {
    name: 'Capricornio',
    symbol: '♑',
    element: 'earth',
    modality: 'cardinal',
    unicode: '\u2651',
    startDate: { month: 12, day: 22 },
    endDate: { month: 1, day: 19 },
  },
  [ZodiacSign.AQUARIUS]: {
    name: 'Acuario',
    symbol: '♒',
    element: 'air',
    modality: 'fixed',
    unicode: '\u2652',
    startDate: { month: 1, day: 20 },
    endDate: { month: 2, day: 18 },
  },
  [ZodiacSign.PISCES]: {
    name: 'Piscis',
    symbol: '♓',
    element: 'water',
    modality: 'mutable',
    unicode: '\u2653',
    startDate: { month: 2, day: 19 },
    endDate: { month: 3, day: 20 },
  },
};

/**
 * Metadata de planetas para UI
 * Alineado con PlanetMetadata del backend
 */
export const PLANETS: Record<Planet, { name: string; symbol: string; unicode: string }> = {
  [Planet.SUN]: { name: 'Sol', symbol: '☉', unicode: '\u2609' },
  [Planet.MOON]: { name: 'Luna', symbol: '☽', unicode: '\u263D' },
  [Planet.MERCURY]: { name: 'Mercurio', symbol: '☿', unicode: '\u263F' },
  [Planet.VENUS]: { name: 'Venus', symbol: '♀', unicode: '\u2640' },
  [Planet.MARS]: { name: 'Marte', symbol: '♂', unicode: '\u2642' },
  [Planet.JUPITER]: { name: 'Júpiter', symbol: '♃', unicode: '\u2643' },
  [Planet.SATURN]: { name: 'Saturno', symbol: '♄', unicode: '\u2644' },
  [Planet.URANUS]: { name: 'Urano', symbol: '♅', unicode: '\u2645' },
  [Planet.NEPTUNE]: { name: 'Neptuno', symbol: '♆', unicode: '\u2646' },
  [Planet.PLUTO]: { name: 'Plutón', symbol: '♇', unicode: '\u2647' },
};

/**
 * Mapeo de ZodiacSign enum → slug de enciclopedia (URL)
 * Los slugs son en español para coincidir con las rutas del backend
 */
export const ZODIAC_SIGN_ENCYCLOPEDIA_SLUGS: Record<ZodiacSign, string> = {
  [ZodiacSign.ARIES]: 'aries',
  [ZodiacSign.TAURUS]: 'tauro',
  [ZodiacSign.GEMINI]: 'geminis',
  [ZodiacSign.CANCER]: 'cancer',
  [ZodiacSign.LEO]: 'leo',
  [ZodiacSign.VIRGO]: 'virgo',
  [ZodiacSign.LIBRA]: 'libra',
  [ZodiacSign.SCORPIO]: 'escorpio',
  [ZodiacSign.SAGITTARIUS]: 'sagitario',
  [ZodiacSign.CAPRICORN]: 'capricornio',
  [ZodiacSign.AQUARIUS]: 'acuario',
  [ZodiacSign.PISCES]: 'piscis',
};

/**
 * Mapeo de Planet enum → slug de enciclopedia (URL)
 * Los slugs son en español para coincidir con las rutas del backend
 */
export const PLANET_ENCYCLOPEDIA_SLUGS: Record<Planet, string> = {
  [Planet.SUN]: 'sol',
  [Planet.MOON]: 'luna',
  [Planet.MERCURY]: 'mercurio',
  [Planet.VENUS]: 'venus',
  [Planet.MARS]: 'marte',
  [Planet.JUPITER]: 'jupiter',
  [Planet.SATURN]: 'saturno',
  [Planet.URANUS]: 'urano',
  [Planet.NEPTUNE]: 'neptuno',
  [Planet.PLUTO]: 'pluton',
};

/**
 * Metadata de aspectos para UI
 * Alineado con AspectTypeMetadata del backend
 */
export const ASPECTS: Record<
  AspectType,
  {
    name: string;
    symbol: string;
    angle: number;
    orb: number;
    nature: 'harmonious' | 'challenging' | 'neutral';
  }
> = {
  [AspectType.CONJUNCTION]: {
    name: 'Conjunción',
    symbol: '☌',
    angle: 0,
    orb: 8,
    nature: 'neutral',
  },
  [AspectType.OPPOSITION]: {
    name: 'Oposición',
    symbol: '☍',
    angle: 180,
    orb: 8,
    nature: 'challenging',
  },
  [AspectType.SQUARE]: {
    name: 'Cuadratura',
    symbol: '□',
    angle: 90,
    orb: 6,
    nature: 'challenging',
  },
  [AspectType.TRINE]: {
    name: 'Trígono',
    symbol: '△',
    angle: 120,
    orb: 8,
    nature: 'harmonious',
  },
  [AspectType.SEXTILE]: {
    name: 'Sextil',
    symbol: '⚹',
    angle: 60,
    orb: 4,
    nature: 'harmonious',
  },
};
