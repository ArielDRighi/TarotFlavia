/**
 * Enums para la Enciclopedia de Tarot
 * Utilizados por la entidad EncyclopediaTarotCard
 */

export enum ArcanaType {
  MAJOR = 'major',
  MINOR = 'minor',
}

export enum Suit {
  WANDS = 'wands', // Bastos - Fuego
  CUPS = 'cups', // Copas - Agua
  SWORDS = 'swords', // Espadas - Aire
  PENTACLES = 'pentacles', // Oros - Tierra
}

export enum CourtRank {
  PAGE = 'page', // Paje/Sota
  KNIGHT = 'knight', // Caballero
  QUEEN = 'queen', // Reina
  KING = 'king', // Rey
}

export enum Element {
  FIRE = 'fire',
  WATER = 'water',
  AIR = 'air',
  EARTH = 'earth',
  SPIRIT = 'spirit', // Para algunos Arcanos Mayores (Locura, Mundo)
}

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

export enum ZodiacAssociation {
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
