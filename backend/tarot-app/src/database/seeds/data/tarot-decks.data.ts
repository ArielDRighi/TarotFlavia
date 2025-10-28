/**
 * Tarot Decks Data
 *
 * This file contains the seeder data for tarot decks.
 * Currently includes the Rider-Waite Classic deck as the default deck.
 *
 * Future decks can be added here following the same structure:
 * - Tarot de Marsella
 * - Thoth Tarot (Aleister Crowley)
 * - Golden Tarot
 * - Visconti-Sforza Tarot
 * etc.
 */

export interface TarotDeckData {
  name: string;
  description: string;
  imageUrl: string;
  cardCount: number;
  isActive: boolean;
  isDefault: boolean;
  artist?: string;
  yearCreated?: number;
  tradition?: string;
  publisher?: string;
}

export const RIDER_WAITE_DECK: TarotDeckData = {
  name: 'Rider-Waite',
  description:
    'El Rider-Waite es uno de los mazos de tarot más populares y ampliamente reconocidos en el mundo. ' +
    'Diseñado por Arthur Edward Waite, miembro de la Orden Hermética del Amanecer Dorado, e ilustrado magistralmente por ' +
    'Pamela Colman Smith, fue publicado por primera vez en 1909 por la Rider Company en Londres. ' +
    'Este mazo revolucionó el tarot al incluir imágenes ilustrativas completas en los 56 arcanos menores, ' +
    'algo poco común en la época donde generalmente solo se mostraban los símbolos del palo. ' +
    'Sus imágenes ricas en simbolismo esotérico, combinadas con interpretaciones accesibles, ' +
    'lo han convertido en el estándar de referencia para muchos lectores de tarot modernos. ' +
    'El simbolismo incluye elementos de la Cábala, astrología, alquimia y mitología, ' +
    'haciendo de cada carta una obra de arte cargada de significado espiritual.',
  imageUrl:
    'https://upload.wikimedia.org/wikipedia/en/d/db/RWS_Tarot_deck_boxed.png',
  cardCount: 78,
  isActive: true,
  isDefault: true,
  artist: 'Pamela Colman Smith',
  yearCreated: 1909,
  tradition: 'Hermética / Orden del Amanecer Dorado',
  publisher: 'Rider & Company (original)',
};

/**
 * Future decks to be added:
 *
 * Example structure for additional decks:
 *
 * export const MARSEILLE_DECK: TarotDeckData = {
 *   name: 'Tarot de Marsella',
 *   description: 'El Tarot de Marsella es uno de los mazos más antiguos...',
 *   imageUrl: 'https://...',
 *   cardCount: 78,
 *   isActive: true,
 *   isDefault: false,
 *   artist: 'Nicolas Conver',
 *   yearCreated: 1760,
 *   tradition: 'Francesa tradicional',
 *   publisher: 'Grimaud',
 * };
 *
 * export const THOTH_DECK: TarotDeckData = {
 *   name: 'Thoth Tarot',
 *   description: 'Diseñado por Aleister Crowley e ilustrado por Lady Frieda Harris...',
 *   imageUrl: 'https://...',
 *   cardCount: 78,
 *   isActive: true,
 *   isDefault: false,
 *   artist: 'Lady Frieda Harris',
 *   yearCreated: 1969,
 *   tradition: 'Thelema / Orden del Amanecer Dorado',
 *   publisher: 'U.S. Games Systems',
 * };
 */

/**
 * All decks to be seeded
 * Add new decks to this array when implementing additional deck support
 */
export const ALL_TAROT_DECKS: TarotDeckData[] = [
  RIDER_WAITE_DECK,
  // Add future decks here
];
