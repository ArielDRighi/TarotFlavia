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
