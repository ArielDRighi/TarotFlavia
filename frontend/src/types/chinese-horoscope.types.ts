/**
 * Chinese Horoscope Types
 *
 * Tipos para el sistema de Horóscopo Chino (anual)
 */

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

export type ChineseZodiacElement = 'Agua' | 'Tierra' | 'Madera' | 'Fuego' | 'Metal';

/**
 * Chinese element codes (Wu Xing) - lowercase for API compatibility
 */
export type ChineseElementCode = 'metal' | 'water' | 'wood' | 'fire' | 'earth';

export interface ChineseHoroscopeArea {
  content: string;
  rating: number;
}

export interface ChineseHoroscopeLucky {
  numbers: number[];
  colors: string[];
  directions: string[];
  months: number[];
}

export interface ChineseHoroscope {
  id: number;
  animal: ChineseZodiacAnimal;
  year: number;
  generalOverview: string;
  areas: {
    love: ChineseHoroscopeArea;
    career: ChineseHoroscopeArea;
    wellness: ChineseHoroscopeArea;
    finance: ChineseHoroscopeArea;
  };
  luckyElements: ChineseHoroscopeLucky;
  compatibility: {
    best: ChineseZodiacAnimal[];
    good: ChineseZodiacAnimal[];
    challenging: ChineseZodiacAnimal[];
  };
  monthlyHighlights: string | null;
}

export interface ChineseZodiacInfo {
  animal: ChineseZodiacAnimal;
  nameEs: string;
  nameEn: string;
  emoji: string;
  element: ChineseZodiacElement;
  characteristics: string[];
}

export interface CalculateAnimalResponse {
  animal: ChineseZodiacAnimal;
  animalInfo: ChineseZodiacInfo;
  chineseYear: number;
  birthElement: ChineseElementCode;
  birthElementEs: string;
  fixedElement: ChineseElementCode;
  fullZodiacType: string;
}
