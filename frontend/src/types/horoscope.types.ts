/**
 * Horoscope Types
 *
 * Tipos TypeScript para el módulo de horóscopos diarios
 */

/**
 * Signos zodiacales occidentales
 *
 * ⚠️ **El orden importa**: `getZodiacModality` y `getOppositeSign`
 * ([zodiac.ts](../lib/utils/zodiac.ts)) derivan de la posición en la rueda, que
 * arranca en Aries. Reordenar este enum —por ejemplo, alfabéticamente— cambia
 * los dos resultados. Los tests de `zodiac.test.ts` lo atrapan.
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
 * Horóscopo del día resuelto en el servidor (T-SEO-016).
 *
 * El servidor lo resuelve contra el día calendario canónico del sitio (Buenos
 * Aires) para que la predicción viaje en el HTML. `canonicalDate` es ese día,
 * no necesariamente `horoscope.horoscopeDate`: cuando el del día canónico
 * todavía no fue generado se sirve el anterior con `isShowingPreviousDay`.
 */
export interface ServedDailyHoroscope {
  /** Día calendario canónico ('YYYY-MM-DD') contra el que se resolvió. */
  canonicalDate: string;
  horoscope: DailyHoroscope;
  /** `true` si el del día canónico no estaba y se sirvió el del día anterior. */
  isShowingPreviousDay: boolean;
}

/**
 * Información completa de un signo zodiacal
 */
export interface ZodiacSignInfo {
  sign: ZodiacSign;
  nameEs: string;
  nameEn: string;
  symbol: string;
  element: ZodiacElement;
}

/**
 * Elemento de un signo occidental.
 *
 * Se nombra aparte de `ZodiacSignInfo` porque la ficha estática del signo
 * (T-SEO-004) necesita tiparlo por su cuenta para las etiquetas en español.
 */
export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water';

/**
 * Modalidad (o cualidad) de un signo, ya en español porque se muestra tal cual.
 */
export type ZodiacModality = 'Cardinal' | 'Fija' | 'Mutable';
