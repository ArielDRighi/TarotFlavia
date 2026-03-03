import {
  ArcanaType,
  CourtRank,
  Element,
  Planet,
  Suit,
  ZodiacAssociation,
} from '../enums/tarot.enums';
import { MAJOR_ARCANA_DATA } from './major-arcana.data';
import { MINOR_ARCANA_DATA } from './minor-arcana.data';

/**
 * Interfaz de datos para sembrar una carta del Tarot
 * Usada únicamente en los seeders — no expuesta en la API
 */
export interface CardSeedData {
  slug: string;
  nameEn: string;
  nameEs: string;
  arcanaType: ArcanaType;
  number: number;
  romanNumeral?: string;
  suit?: Suit;
  courtRank?: CourtRank;
  element?: Element;
  planet?: Planet;
  zodiacSign?: ZodiacAssociation;
  meaningUpright: string;
  meaningReversed: string;
  description: string;
  keywords: {
    upright: string[];
    reversed: string[];
  };
  imageUrl: string;
}

/**
 * Número total de cartas del Tarot (22 Mayores + 56 Menores)
 */
export const TOTAL_CARDS = 78;

/**
 * Todas las cartas del Tarot: 22 Arcanos Mayores + 56 Arcanos Menores
 * Exportadas en orden: Mayores primero, luego Menores por palo (Bastos, Copas, Espadas, Oros)
 */
export const ALL_TAROT_CARDS: CardSeedData[] = [
  ...MAJOR_ARCANA_DATA,
  ...MINOR_ARCANA_DATA,
];
