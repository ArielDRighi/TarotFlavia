/**
 * Encyclopedia Types
 *
 * TypeScript types and interfaces for the Tarot Encyclopedia module.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ArcanaType {
  MAJOR = 'major',
  MINOR = 'minor',
}

export enum Suit {
  WANDS = 'wands',
  CUPS = 'cups',
  SWORDS = 'swords',
  PENTACLES = 'pentacles',
}

export enum CourtRank {
  PAGE = 'page',
  KNIGHT = 'knight',
  QUEEN = 'queen',
  KING = 'king',
}

export enum Element {
  FIRE = 'fire',
  WATER = 'water',
  AIR = 'air',
  EARTH = 'earth',
  SPIRIT = 'spirit',
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CardKeywords {
  upright: string[];
  reversed: string[];
}

export interface SuitInfo {
  suit: Suit;
  nameEs: string;
  nameEn: string;
  element: Element;
  symbol: string;
  color: string;
}

export interface CardSummary {
  id: number;
  slug: string;
  nameEs: string;
  arcanaType: ArcanaType;
  number: number;
  suit: Suit | null;
  thumbnailUrl: string;
}

export interface CardDetail extends CardSummary {
  nameEn: string;
  romanNumeral: string | null;
  courtRank: CourtRank | null;
  element: Element;
  meaningUpright: string;
  meaningReversed: string;
  description: string | null;
  keywords: CardKeywords;
  imageUrl: string;
  relatedCards: number[] | null;
}

export interface CardNavigation {
  previous: CardSummary | null;
  next: CardSummary | null;
}

export interface CardFilters {
  arcanaType?: ArcanaType;
  suit?: Suit;
  element?: Element;
  search?: string;
  courtOnly?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const SUIT_INFO: Record<Suit, SuitInfo> = {
  [Suit.WANDS]: {
    suit: Suit.WANDS,
    nameEs: 'Bastos',
    nameEn: 'Wands',
    element: Element.FIRE,
    symbol: '🔥',
    color: '#F97316',
  },
  [Suit.CUPS]: {
    suit: Suit.CUPS,
    nameEs: 'Copas',
    nameEn: 'Cups',
    element: Element.WATER,
    symbol: '💧',
    color: '#3B82F6',
  },
  [Suit.SWORDS]: {
    suit: Suit.SWORDS,
    nameEs: 'Espadas',
    nameEn: 'Swords',
    element: Element.AIR,
    symbol: '💨',
    color: '#8B5CF6',
  },
  [Suit.PENTACLES]: {
    suit: Suit.PENTACLES,
    nameEs: 'Oros',
    nameEn: 'Pentacles',
    element: Element.EARTH,
    symbol: '🌿',
    color: '#10B981',
  },
};

export const ELEMENT_INFO: Record<Element, { nameEs: string; color: string }> = {
  [Element.FIRE]: {
    nameEs: 'Fuego',
    color: '#F97316',
  },
  [Element.WATER]: {
    nameEs: 'Agua',
    color: '#3B82F6',
  },
  [Element.AIR]: {
    nameEs: 'Aire',
    color: '#8B5CF6',
  },
  [Element.EARTH]: {
    nameEs: 'Tierra',
    color: '#10B981',
  },
  [Element.SPIRIT]: {
    nameEs: 'Espíritu',
    color: '#F59E0B',
  },
};
