/**
 * @module common/utils/chinese-zodiac.utils
 *
 * Utilidades relacionadas con el zodiaco chino.
 *
 * Este módulo define:
 * - El enum {@link ChineseZodiacAnimal}, que estandariza los identificadores
 *   de los 12 animales del zodiaco chino.
 * - La interfaz {@link ChineseZodiacInfo}, que describe la información completa
 *   de cada animal (nombres, emoji, elemento, yin/yang, compatibilidades).
 * - Funciones para calcular el animal del zodiaco chino basado en fecha de nacimiento,
 *   considerando las fechas variables del Año Nuevo Chino.
 *
 * Uso típico:
 * - Calcular el animal del zodiaco chino de un usuario basado en su birthDate.
 * - Obtener información completa de un animal (compatibilidades, características).
 * - Obtener información del año chino actual o de un año específico.
 */

/**
 * Array constante de los 5 elementos del zodiaco chino (Wu Xing)
 * Usado para definir enums en TypeORM y mantener sincronización con el tipo ChineseElement
 */
export const CHINESE_ELEMENTS = [
  'metal',
  'water',
  'wood',
  'fire',
  'earth',
] as const;

/**
 * Tipo que representa los 5 elementos del zodiaco chino
 */
export type ChineseElement = (typeof CHINESE_ELEMENTS)[number];

/**
 * Mapa de elementos en español
 */
export const CHINESE_ELEMENTS_MAP_ES: Record<ChineseElement, string> = {
  metal: 'Metal',
  water: 'Agua',
  wood: 'Madera',
  fire: 'Fuego',
  earth: 'Tierra',
};

export enum ChineseZodiacAnimal {
  RAT = 'rat',
  OX = 'ox',
  TIGER = 'tiger',
  RABBIT = 'rabbit',
  DRAGON = 'dragon',
  SNAKE = 'snake',
  HORSE = 'horse',
  GOAT = 'goat',
  MONKEY = 'monkey',
  ROOSTER = 'rooster',
  DOG = 'dog',
  PIG = 'pig',
}

/**
 * Información completa de un animal del zodiaco chino
 */
export interface ChineseZodiacInfo {
  animal: ChineseZodiacAnimal;
  nameEs: string;
  nameEn: string;
  emoji: string;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  yinYang: 'yin' | 'yang';
  compatibleWith: ChineseZodiacAnimal[];
  incompatibleWith: ChineseZodiacAnimal[];
  characteristics: string[];
}

/**
 * Fechas del Año Nuevo Chino (1950-2050)
 * Fuente: Calendario lunar chino
 */
const CHINESE_NEW_YEAR_DATES: Record<number, string> = {
  1950: '1950-02-17',
  1951: '1951-02-06',
  1952: '1952-01-27',
  1953: '1953-02-14',
  1954: '1954-02-03',
  1955: '1955-01-24',
  1956: '1956-02-12',
  1957: '1957-01-31',
  1958: '1958-02-18',
  1959: '1959-02-08',
  1960: '1960-01-28',
  1961: '1961-02-15',
  1962: '1962-02-05',
  1963: '1963-01-25',
  1964: '1964-02-13',
  1965: '1965-02-02',
  1966: '1966-01-21',
  1967: '1967-02-09',
  1968: '1968-01-30',
  1969: '1969-02-17',
  1970: '1970-02-06',
  1971: '1971-01-27',
  1972: '1972-02-15',
  1973: '1973-02-03',
  1974: '1974-01-23',
  1975: '1975-02-11',
  1976: '1976-01-31',
  1977: '1977-02-18',
  1978: '1978-02-07',
  1979: '1979-01-28',
  1980: '1980-02-16',
  1981: '1981-02-05',
  1982: '1982-01-25',
  1983: '1983-02-13',
  1984: '1984-02-02',
  1985: '1985-02-20',
  1986: '1986-02-09',
  1987: '1987-01-29',
  1988: '1988-02-17',
  1989: '1989-02-06',
  1990: '1990-01-27',
  1991: '1991-02-15',
  1992: '1992-02-04',
  1993: '1993-01-23',
  1994: '1994-02-10',
  1995: '1995-01-31',
  1996: '1996-02-19',
  1997: '1997-02-07',
  1998: '1998-01-28',
  1999: '1999-02-16',
  2000: '2000-02-05',
  2001: '2001-01-24',
  2002: '2002-02-12',
  2003: '2003-02-01',
  2004: '2004-01-22',
  2005: '2005-02-09',
  2006: '2006-01-29',
  2007: '2007-02-18',
  2008: '2008-02-07',
  2009: '2009-01-26',
  2010: '2010-02-14',
  2011: '2011-02-03',
  2012: '2012-01-23',
  2013: '2013-02-10',
  2014: '2014-01-31',
  2015: '2015-02-19',
  2016: '2016-02-08',
  2017: '2017-01-28',
  2018: '2018-02-16',
  2019: '2019-02-05',
  2020: '2020-01-25',
  2021: '2021-02-12',
  2022: '2022-02-01',
  2023: '2023-01-22',
  2024: '2024-02-10',
  2025: '2025-01-29',
  2026: '2026-02-17',
  2027: '2027-02-06',
  2028: '2028-01-26',
  2029: '2029-02-13',
  2030: '2030-02-03',
  2031: '2031-01-23',
  2032: '2032-02-11',
  2033: '2033-01-31',
  2034: '2034-02-19',
  2035: '2035-02-08',
  2036: '2036-01-28',
  2037: '2037-02-15',
  2038: '2038-02-04',
  2039: '2039-01-24',
  2040: '2040-02-12',
  2041: '2041-02-01',
  2042: '2042-01-22',
  2043: '2043-02-10',
  2044: '2044-01-30',
  2045: '2045-02-17',
  2046: '2046-02-06',
  2047: '2047-01-26',
  2048: '2048-02-14',
  2049: '2049-02-02',
  2050: '2050-01-23',
};

/**
 * Información detallada de todos los animales del zodiaco chino
 */
const CHINESE_ZODIAC_INFO: Record<ChineseZodiacAnimal, ChineseZodiacInfo> = {
  [ChineseZodiacAnimal.RAT]: {
    animal: ChineseZodiacAnimal.RAT,
    nameEs: 'Rata',
    nameEn: 'Rat',
    emoji: '🐀',
    element: 'water',
    yinYang: 'yang',
    compatibleWith: [
      ChineseZodiacAnimal.DRAGON,
      ChineseZodiacAnimal.MONKEY,
      ChineseZodiacAnimal.OX,
    ],
    incompatibleWith: [ChineseZodiacAnimal.HORSE, ChineseZodiacAnimal.GOAT],
    characteristics: ['Inteligente', 'Adaptable', 'Ingenioso'],
  },
  [ChineseZodiacAnimal.OX]: {
    animal: ChineseZodiacAnimal.OX,
    nameEs: 'Buey',
    nameEn: 'Ox',
    emoji: '🐂',
    element: 'earth',
    yinYang: 'yin',
    compatibleWith: [
      ChineseZodiacAnimal.RAT,
      ChineseZodiacAnimal.SNAKE,
      ChineseZodiacAnimal.ROOSTER,
    ],
    incompatibleWith: [ChineseZodiacAnimal.GOAT, ChineseZodiacAnimal.HORSE],
    characteristics: ['Diligente', 'Confiable', 'Fuerte'],
  },
  [ChineseZodiacAnimal.TIGER]: {
    animal: ChineseZodiacAnimal.TIGER,
    nameEs: 'Tigre',
    nameEn: 'Tiger',
    emoji: '🐅',
    element: 'wood',
    yinYang: 'yang',
    compatibleWith: [
      ChineseZodiacAnimal.HORSE,
      ChineseZodiacAnimal.DOG,
      ChineseZodiacAnimal.PIG,
    ],
    incompatibleWith: [ChineseZodiacAnimal.MONKEY, ChineseZodiacAnimal.SNAKE],
    characteristics: ['Valiente', 'Competitivo', 'Impredecible'],
  },
  [ChineseZodiacAnimal.RABBIT]: {
    animal: ChineseZodiacAnimal.RABBIT,
    nameEs: 'Conejo',
    nameEn: 'Rabbit',
    emoji: '🐇',
    element: 'wood',
    yinYang: 'yin',
    compatibleWith: [
      ChineseZodiacAnimal.GOAT,
      ChineseZodiacAnimal.PIG,
      ChineseZodiacAnimal.DOG,
    ],
    incompatibleWith: [ChineseZodiacAnimal.ROOSTER, ChineseZodiacAnimal.DRAGON],
    characteristics: ['Gentil', 'Elegante', 'Responsable'],
  },
  [ChineseZodiacAnimal.DRAGON]: {
    animal: ChineseZodiacAnimal.DRAGON,
    nameEs: 'Dragón',
    nameEn: 'Dragon',
    emoji: '🐉',
    element: 'earth',
    yinYang: 'yang',
    compatibleWith: [
      ChineseZodiacAnimal.RAT,
      ChineseZodiacAnimal.MONKEY,
      ChineseZodiacAnimal.ROOSTER,
    ],
    incompatibleWith: [ChineseZodiacAnimal.DOG, ChineseZodiacAnimal.RABBIT],
    characteristics: ['Confiado', 'Inteligente', 'Entusiasta'],
  },
  [ChineseZodiacAnimal.SNAKE]: {
    animal: ChineseZodiacAnimal.SNAKE,
    nameEs: 'Serpiente',
    nameEn: 'Snake',
    emoji: '🐍',
    element: 'fire',
    yinYang: 'yin',
    compatibleWith: [
      ChineseZodiacAnimal.OX,
      ChineseZodiacAnimal.ROOSTER,
      ChineseZodiacAnimal.MONKEY,
    ],
    incompatibleWith: [ChineseZodiacAnimal.PIG, ChineseZodiacAnimal.TIGER],
    characteristics: ['Enigmático', 'Inteligente', 'Sabio'],
  },
  [ChineseZodiacAnimal.HORSE]: {
    animal: ChineseZodiacAnimal.HORSE,
    nameEs: 'Caballo',
    nameEn: 'Horse',
    emoji: '🐴',
    element: 'fire',
    yinYang: 'yang',
    compatibleWith: [
      ChineseZodiacAnimal.TIGER,
      ChineseZodiacAnimal.GOAT,
      ChineseZodiacAnimal.DOG,
    ],
    incompatibleWith: [ChineseZodiacAnimal.RAT, ChineseZodiacAnimal.OX],
    characteristics: ['Animado', 'Activo', 'Enérgico'],
  },
  [ChineseZodiacAnimal.GOAT]: {
    animal: ChineseZodiacAnimal.GOAT,
    nameEs: 'Cabra',
    nameEn: 'Goat',
    emoji: '🐐',
    element: 'earth',
    yinYang: 'yin',
    compatibleWith: [
      ChineseZodiacAnimal.RABBIT,
      ChineseZodiacAnimal.HORSE,
      ChineseZodiacAnimal.PIG,
    ],
    incompatibleWith: [ChineseZodiacAnimal.OX, ChineseZodiacAnimal.RAT],
    characteristics: ['Calmado', 'Gentil', 'Compasivo'],
  },
  [ChineseZodiacAnimal.MONKEY]: {
    animal: ChineseZodiacAnimal.MONKEY,
    nameEs: 'Mono',
    nameEn: 'Monkey',
    emoji: '🐒',
    element: 'metal',
    yinYang: 'yang',
    compatibleWith: [
      ChineseZodiacAnimal.RAT,
      ChineseZodiacAnimal.DRAGON,
      ChineseZodiacAnimal.SNAKE,
    ],
    incompatibleWith: [ChineseZodiacAnimal.TIGER, ChineseZodiacAnimal.PIG],
    characteristics: ['Agudo', 'Curioso', 'Juguetón'],
  },
  [ChineseZodiacAnimal.ROOSTER]: {
    animal: ChineseZodiacAnimal.ROOSTER,
    nameEs: 'Gallo',
    nameEn: 'Rooster',
    emoji: '🐓',
    element: 'metal',
    yinYang: 'yin',
    compatibleWith: [
      ChineseZodiacAnimal.OX,
      ChineseZodiacAnimal.SNAKE,
      ChineseZodiacAnimal.DRAGON,
    ],
    incompatibleWith: [ChineseZodiacAnimal.RABBIT, ChineseZodiacAnimal.DOG],
    characteristics: ['Observador', 'Trabajador', 'Valiente'],
  },
  [ChineseZodiacAnimal.DOG]: {
    animal: ChineseZodiacAnimal.DOG,
    nameEs: 'Perro',
    nameEn: 'Dog',
    emoji: '🐕',
    element: 'earth',
    yinYang: 'yang',
    compatibleWith: [
      ChineseZodiacAnimal.TIGER,
      ChineseZodiacAnimal.RABBIT,
      ChineseZodiacAnimal.HORSE,
    ],
    incompatibleWith: [ChineseZodiacAnimal.DRAGON, ChineseZodiacAnimal.ROOSTER],
    characteristics: ['Leal', 'Honesto', 'Amable'],
  },
  [ChineseZodiacAnimal.PIG]: {
    animal: ChineseZodiacAnimal.PIG,
    nameEs: 'Cerdo',
    nameEn: 'Pig',
    emoji: '🐖',
    element: 'water',
    yinYang: 'yin',
    compatibleWith: [
      ChineseZodiacAnimal.RABBIT,
      ChineseZodiacAnimal.GOAT,
      ChineseZodiacAnimal.TIGER,
    ],
    incompatibleWith: [ChineseZodiacAnimal.SNAKE, ChineseZodiacAnimal.MONKEY],
    characteristics: ['Compasivo', 'Generoso', 'Diligente'],
  },
};

/**
 * Calcula el animal del zodiaco chino basado en fecha de nacimiento.
 * Considera la fecha del Año Nuevo Chino para determinar el año correcto.
 *
 * @param birthDate - Fecha de nacimiento (Date object)
 * @returns El animal del zodiaco chino correspondiente
 *
 * @example
 * ```typescript
 * getChineseZodiacAnimal(new Date('1988-03-15')); // ChineseZodiacAnimal.DRAGON
 * getChineseZodiacAnimal(new Date('1988-01-15')); // ChineseZodiacAnimal.RABBIT (antes del CNY)
 * ```
 */
export function getChineseZodiacAnimal(birthDate: Date): ChineseZodiacAnimal {
  const year = birthDate.getFullYear();
  const chineseNewYear = CHINESE_NEW_YEAR_DATES[year];

  // Si nació antes del Año Nuevo Chino, pertenece al año anterior
  let chineseYear = year;
  if (chineseNewYear) {
    const cnyDate = new Date(chineseNewYear);
    if (birthDate < cnyDate) {
      chineseYear = year - 1;
    }
  }

  // Ciclo de 12 años comenzando en 1900 (Rata)
  const animals = Object.values(ChineseZodiacAnimal);
  const index = (chineseYear - 1900) % 12;

  // Manejar índices negativos para años antes de 1900
  return animals[index >= 0 ? index : index + 12];
}

/**
 * Obtiene la información completa de un animal del zodiaco chino
 *
 * @param animal - Animal del zodiaco chino
 * @returns Información completa del animal
 *
 * @example
 * ```typescript
 * const info = getChineseZodiacInfo(ChineseZodiacAnimal.DRAGON);
 * console.log(info.nameEs); // "Dragón"
 * console.log(info.emoji); // "🐉"
 * console.log(info.element); // "earth"
 * ```
 */
export function getChineseZodiacInfo(
  animal: ChineseZodiacAnimal,
): ChineseZodiacInfo {
  return CHINESE_ZODIAC_INFO[animal];
}

/**
 * Obtiene el animal para un año específico del calendario gregoriano
 *
 * @param year - Año gregoriano
 * @returns Animal del zodiaco chino para ese año
 */
function getAnimalForYear(year: number): ChineseZodiacAnimal {
  const animals = Object.values(ChineseZodiacAnimal);
  const index = (year - 1900) % 12;
  return animals[index >= 0 ? index : index + 12];
}

/**
 * Obtiene el elemento para un año específico
 * Los 5 elementos rotan cada 2 años: Wood, Fire, Earth, Metal, Water
 *
 * @param year - Año gregoriano
 * @returns Elemento del año
 */
export function getElementForYear(year: number): ChineseElement {
  const elements: ChineseElement[] = [
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
 * Obtiene el elemento del año de nacimiento (considera CNY)
 * @param birthDate - Fecha de nacimiento
 * @returns Elemento del año chino correspondiente
 *
 * @example
 * ```typescript
 * getElementByBirthDate(new Date('1988-03-15')); // 'earth'
 * getElementByBirthDate(new Date('1988-01-15')); // 'fire' (año chino 1987)
 * ```
 */
export function getElementByBirthDate(birthDate: Date): ChineseElement {
  const year = birthDate.getFullYear();
  const chineseNewYear = CHINESE_NEW_YEAR_DATES[year];

  // Si nació antes del Año Nuevo Chino, pertenece al año anterior
  let chineseYear = year;
  if (chineseNewYear) {
    const cnyDate = new Date(chineseNewYear);
    if (birthDate < cnyDate) {
      chineseYear = year - 1;
    }
  }

  return getElementForYear(chineseYear);
}

/**
 * Genera la identidad completa (ej. "Dragón de Tierra")
 * @param animal - Animal del zodiaco
 * @param element - Elemento del año
 * @returns Nombre completo en español
 *
 * @example
 * ```typescript
 * getFullZodiacType(ChineseZodiacAnimal.DRAGON, 'earth'); // "Dragón de Tierra"
 * getFullZodiacType(ChineseZodiacAnimal.RABBIT, 'fire'); // "Conejo de Fuego"
 * ```
 */
export function getFullZodiacType(
  animal: ChineseZodiacAnimal,
  element: ChineseElement,
): string {
  const info = getChineseZodiacInfo(animal);
  return `${info.nameEs} de ${CHINESE_ELEMENTS_MAP_ES[element]}`;
}

/**
 * Obtiene información del año chino actual o especificado
 *
 * @param year - Año gregoriano (por defecto el año actual)
 * @returns Información del año chino (animal, elemento, fecha del CNY)
 *
 * @example
 * ```typescript
 * const yearInfo = getChineseYearInfo(2026);
 * console.log(yearInfo.animal); // ChineseZodiacAnimal.HORSE
 * console.log(yearInfo.element); // "fire"
 * console.log(yearInfo.newYearDate); // "2026-02-17"
 * ```
 */
export function getChineseYearInfo(year: number = new Date().getFullYear()): {
  animal: ChineseZodiacAnimal;
  element: ChineseElement;
  newYearDate: string;
} {
  const newYearDate = CHINESE_NEW_YEAR_DATES[year] || `${year}-02-01`; // Fallback aproximado
  const animal = getAnimalForYear(year);
  const element = getElementForYear(year);

  return { animal, element, newYearDate };
}
