/**
 * Horoscope Types
 *
 * Tipos TypeScript para el módulo de horóscopos diarios
 */

/**
 * Signos zodiacales occidentales
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
 * Área específica del horóscopo con contenido y puntuación
 */
export interface HoroscopeArea {
  content: string;
  score: number;
}

/**
 * Áreas del horóscopo (amor, bienestar, dinero)
 */
export interface HoroscopeAreas {
  love: HoroscopeArea;
  wellness: HoroscopeArea; // Bienestar: energía, descanso, estrés, meditación, autocuidado
  money: HoroscopeArea;
}

/**
 * Horóscopo diario completo para un signo zodiacal
 */
export interface DailyHoroscope {
  id: number;
  zodiacSign: ZodiacSign;
  horoscopeDate: string; // Formato YYYY-MM-DD
  generalContent: string;
  areas: HoroscopeAreas;
  luckyNumber: number | null;
  luckyColor: string | null;
  luckyTime: string | null;
}

/**
 * Información completa de un signo zodiacal
 */
export interface ZodiacSignInfo {
  sign: ZodiacSign;
  nameEs: string;
  nameEn: string;
  symbol: string;
  element: 'fire' | 'earth' | 'air' | 'water';
}
