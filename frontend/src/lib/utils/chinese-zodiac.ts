/**
 * Chinese Zodiac Utilities
 *
 * Información estática de los 12 animales del zodiaco chino
 */

import { ChineseZodiacAnimal, ChineseZodiacInfo } from '@/types/chinese-horoscope.types';

export const CHINESE_ZODIAC_INFO: Record<ChineseZodiacAnimal, ChineseZodiacInfo> = {
  [ChineseZodiacAnimal.RAT]: {
    animal: ChineseZodiacAnimal.RAT,
    nameEs: 'Rata',
    nameEn: 'Rat',
    emoji: '🐀',
    element: 'Agua',
    characteristics: ['Inteligente', 'Adaptable', 'Ingenioso'],
  },
  [ChineseZodiacAnimal.OX]: {
    animal: ChineseZodiacAnimal.OX,
    nameEs: 'Buey',
    nameEn: 'Ox',
    emoji: '🐂',
    element: 'Tierra',
    characteristics: ['Diligente', 'Confiable', 'Fuerte'],
  },
  [ChineseZodiacAnimal.TIGER]: {
    animal: ChineseZodiacAnimal.TIGER,
    nameEs: 'Tigre',
    nameEn: 'Tiger',
    emoji: '🐅',
    element: 'Madera',
    characteristics: ['Valiente', 'Competitivo', 'Impredecible'],
  },
  [ChineseZodiacAnimal.RABBIT]: {
    animal: ChineseZodiacAnimal.RABBIT,
    nameEs: 'Conejo',
    nameEn: 'Rabbit',
    emoji: '🐇',
    element: 'Madera',
    characteristics: ['Gentil', 'Elegante', 'Responsable'],
  },
  [ChineseZodiacAnimal.DRAGON]: {
    animal: ChineseZodiacAnimal.DRAGON,
    nameEs: 'Dragón',
    nameEn: 'Dragon',
    emoji: '🐉',
    element: 'Tierra',
    characteristics: ['Confiado', 'Inteligente', 'Entusiasta'],
  },
  [ChineseZodiacAnimal.SNAKE]: {
    animal: ChineseZodiacAnimal.SNAKE,
    nameEs: 'Serpiente',
    nameEn: 'Snake',
    emoji: '🐍',
    element: 'Fuego',
    characteristics: ['Enigmático', 'Inteligente', 'Sabio'],
  },
  [ChineseZodiacAnimal.HORSE]: {
    animal: ChineseZodiacAnimal.HORSE,
    nameEs: 'Caballo',
    nameEn: 'Horse',
    emoji: '🐴',
    element: 'Fuego',
    characteristics: ['Animado', 'Activo', 'Enérgico'],
  },
  [ChineseZodiacAnimal.GOAT]: {
    animal: ChineseZodiacAnimal.GOAT,
    nameEs: 'Cabra',
    nameEn: 'Goat',
    emoji: '🐐',
    element: 'Tierra',
    characteristics: ['Calmado', 'Gentil', 'Compasivo'],
  },
  [ChineseZodiacAnimal.MONKEY]: {
    animal: ChineseZodiacAnimal.MONKEY,
    nameEs: 'Mono',
    nameEn: 'Monkey',
    emoji: '🐒',
    element: 'Metal',
    characteristics: ['Agudo', 'Curioso', 'Juguetón'],
  },
  [ChineseZodiacAnimal.ROOSTER]: {
    animal: ChineseZodiacAnimal.ROOSTER,
    nameEs: 'Gallo',
    nameEn: 'Rooster',
    emoji: '🐓',
    element: 'Metal',
    characteristics: ['Observador', 'Trabajador', 'Valiente'],
  },
  [ChineseZodiacAnimal.DOG]: {
    animal: ChineseZodiacAnimal.DOG,
    nameEs: 'Perro',
    nameEn: 'Dog',
    emoji: '🐕',
    element: 'Tierra',
    characteristics: ['Leal', 'Honesto', 'Amable'],
  },
  [ChineseZodiacAnimal.PIG]: {
    animal: ChineseZodiacAnimal.PIG,
    nameEs: 'Cerdo',
    nameEn: 'Pig',
    emoji: '🐖',
    element: 'Agua',
    characteristics: ['Compasivo', 'Generoso', 'Diligente'],
  },
};

/**
 * Obtiene información de un animal del zodiaco chino
 * @param animal Animal del zodiaco
 */
export function getChineseZodiacInfo(animal: ChineseZodiacAnimal): ChineseZodiacInfo {
  return CHINESE_ZODIAC_INFO[animal];
}

/**
 * Obtiene el año actual (gregoriano)
 * Útil para consultar horóscopos chinos que usan años gregorianos en el backend
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Obtiene todos los animales del zodiaco en orden
 */
export function getAllChineseZodiacAnimals(): ChineseZodiacAnimal[] {
  return Object.values(ChineseZodiacAnimal);
}

/**
 * Obtiene información de todos los animales del zodiaco
 */
export function getAllChineseZodiacInfo(): ChineseZodiacInfo[] {
  return Object.values(CHINESE_ZODIAC_INFO);
}

/**
 * Elemento icons para Wu Xing (5 elementos chinos)
 */
const ELEMENT_ICONS: Record<string, string> = {
  metal: '⚪',
  water: '🔵',
  wood: '🟢',
  fire: '🔴',
  earth: '🟤',
};

/**
 * Chinese element type codes
 */
export type ChineseElementCode = 'metal' | 'water' | 'wood' | 'fire' | 'earth';

/**
 * Mapping de códigos de elementos a nombres en español
 */
const ELEMENT_NAMES_ES: Record<ChineseElementCode, string> = {
  metal: 'Metal',
  water: 'Agua',
  wood: 'Madera',
  fire: 'Fuego',
  earth: 'Tierra',
};

/**
 * Obtiene el nombre en español de un elemento Wu Xing
 * @param element - Código del elemento (metal, water, wood, fire, earth)
 * @returns Nombre del elemento en español
 *
 * @example
 * ```typescript
 * getElementNameEs('earth'); // 'Tierra'
 * getElementNameEs('fire'); // 'Fuego'
 * ```
 */
export function getElementNameEs(element: ChineseElementCode): string {
  return ELEMENT_NAMES_ES[element] || element;
}

/**
 * Obtiene el elemento para un año específico (gregoriano)
 * Los 5 elementos rotan cada 2 años: Metal, Water, Wood, Fire, Earth
 *
 * @param year - Año gregoriano
 * @returns Código del elemento (metal, water, wood, fire, earth)
 *
 * @example
 * ```typescript
 * getElementForYear(1988); // 'earth'
 * getElementForYear(2000); // 'metal'
 * getElementForYear(2026); // 'fire'
 * ```
 */
export function getElementForYear(year: number): ChineseElementCode {
  const elements: ChineseElementCode[] = [
    'metal',
    'metal',
    'water',
    'water',
    'wood',
    'wood',
    'fire',
    'fire',
    'earth',
    'earth',
  ];

  // Comenzando desde 1900 (Metal)
  const index = (year - 1900) % 10;
  return elements[index >= 0 ? index : index + 10];
}

/**
 * Obtiene el ícono emoji para un elemento Wu Xing
 * @param element - Código del elemento (metal, water, wood, fire, earth)
 * @returns Emoji del elemento o fallback ⭕ si no se reconoce
 */
export function getElementIcon(element: string): string {
  const key = element.toLowerCase();
  const icon = ELEMENT_ICONS[key];

  if (icon) {
    return icon;
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn(`Unknown Chinese element in getElementIcon: "${element}"`);
  }

  return '⭕';
}

/**
 * Base years for each Chinese zodiac animal in the 60-year cycle
 * These are the first occurrences with the 'metal' element in the 20th century
 */
const ANIMAL_BASE_YEARS: Record<ChineseZodiacAnimal, number> = {
  [ChineseZodiacAnimal.RAT]: 1924,
  [ChineseZodiacAnimal.OX]: 1925,
  [ChineseZodiacAnimal.TIGER]: 1926,
  [ChineseZodiacAnimal.RABBIT]: 1927,
  [ChineseZodiacAnimal.DRAGON]: 1940, // Skips to next metal cycle
  [ChineseZodiacAnimal.SNAKE]: 1941,
  [ChineseZodiacAnimal.HORSE]: 1942,
  [ChineseZodiacAnimal.GOAT]: 1943,
  [ChineseZodiacAnimal.MONKEY]: 1920,
  [ChineseZodiacAnimal.ROOSTER]: 1921,
  [ChineseZodiacAnimal.DOG]: 1922,
  [ChineseZodiacAnimal.PIG]: 1923,
};

/**
 * Element offsets within the 60-year cycle
 * Each element repeats every 10 years, but the specific year offset depends on the element
 */
const ELEMENT_YEAR_OFFSETS: Record<ChineseElementCode, number> = {
  metal: 0, // Base year
  water: 12, // +12 years from base
  wood: 24, // +24 years from base
  fire: 36, // +36 years from base
  earth: 48, // +48 years from base
};

/**
 * Gets 3 example years for a specific animal+element combination
 * spanning across the 60-year cycles (past, present, future)
 *
 * @param animal - Chinese zodiac animal
 * @param element - Wu Xing element code
 * @returns Array of 3 years in ascending order
 *
 * @example
 * ```typescript
 * getExampleYearsForAnimalElement(ChineseZodiacAnimal.MONKEY, 'metal');
 * // [1920, 1980, 2040]
 *
 * getExampleYearsForAnimalElement(ChineseZodiacAnimal.DRAGON, 'earth');
 * // [1988, 2048, 2108]
 * ```
 */
export function getExampleYearsForAnimalElement(
  animal: ChineseZodiacAnimal,
  element: ChineseElementCode
): [number, number, number] {
  const baseYear = ANIMAL_BASE_YEARS[animal];
  const elementOffset = ELEMENT_YEAR_OFFSETS[element];

  // Calculate the first occurrence of this animal+element combination
  const firstYear = baseYear + elementOffset;

  // Each animal+element combination repeats every 60 years
  const secondYear = firstYear + 60;
  const thirdYear = firstYear + 120;

  return [firstYear, secondYear, thirdYear];
}
