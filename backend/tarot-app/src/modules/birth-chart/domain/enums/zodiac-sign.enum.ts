/**
 * Re-exportar enum de signos zodiacales desde common/utils
 * para evitar duplicación y mantener compatibilidad de tipos
 */
import { ZodiacSign } from '../../../../common/utils/zodiac.utils';

export { ZodiacSign };

/**
 * Metadata de signos zodiacales
 *
 * Incluye información completa sobre cada signo:
 * - name: Nombre en español
 * - symbol: Símbolo visual (HTML/SVG)
 * - unicode: Código Unicode del símbolo
 * - element: Elemento (fuego, tierra, aire, agua)
 * - modality: Modalidad (cardinal, fijo, mutable)
 * - startDate/endDate: Rango de fechas aproximado (tropical)
 */
export const ZodiacSignMetadata: Record<
  ZodiacSign,
  {
    name: string;
    symbol: string;
    unicode: string;
    element: 'fire' | 'earth' | 'air' | 'water';
    modality: 'cardinal' | 'fixed' | 'mutable';
    startDate: { month: number; day: number };
    endDate: { month: number; day: number };
  }
> = {
  [ZodiacSign.ARIES]: {
    name: 'Aries',
    symbol: '♈',
    unicode: '\u2648',
    element: 'fire',
    modality: 'cardinal',
    startDate: { month: 3, day: 21 },
    endDate: { month: 4, day: 19 },
  },
  [ZodiacSign.TAURUS]: {
    name: 'Tauro',
    symbol: '♉',
    unicode: '\u2649',
    element: 'earth',
    modality: 'fixed',
    startDate: { month: 4, day: 20 },
    endDate: { month: 5, day: 20 },
  },
  [ZodiacSign.GEMINI]: {
    name: 'Géminis',
    symbol: '♊',
    unicode: '\u264A',
    element: 'air',
    modality: 'mutable',
    startDate: { month: 5, day: 21 },
    endDate: { month: 6, day: 20 },
  },
  [ZodiacSign.CANCER]: {
    name: 'Cáncer',
    symbol: '♋',
    unicode: '\u264B',
    element: 'water',
    modality: 'cardinal',
    startDate: { month: 6, day: 21 },
    endDate: { month: 7, day: 22 },
  },
  [ZodiacSign.LEO]: {
    name: 'Leo',
    symbol: '♌',
    unicode: '\u264C',
    element: 'fire',
    modality: 'fixed',
    startDate: { month: 7, day: 23 },
    endDate: { month: 8, day: 22 },
  },
  [ZodiacSign.VIRGO]: {
    name: 'Virgo',
    symbol: '♍',
    unicode: '\u264D',
    element: 'earth',
    modality: 'mutable',
    startDate: { month: 8, day: 23 },
    endDate: { month: 9, day: 22 },
  },
  [ZodiacSign.LIBRA]: {
    name: 'Libra',
    symbol: '♎',
    unicode: '\u264E',
    element: 'air',
    modality: 'cardinal',
    startDate: { month: 9, day: 23 },
    endDate: { month: 10, day: 22 },
  },
  [ZodiacSign.SCORPIO]: {
    name: 'Escorpio',
    symbol: '♏',
    unicode: '\u264F',
    element: 'water',
    modality: 'fixed',
    startDate: { month: 10, day: 23 },
    endDate: { month: 11, day: 21 },
  },
  [ZodiacSign.SAGITTARIUS]: {
    name: 'Sagitario',
    symbol: '♐',
    unicode: '\u2650',
    element: 'fire',
    modality: 'mutable',
    startDate: { month: 11, day: 22 },
    endDate: { month: 12, day: 21 },
  },
  [ZodiacSign.CAPRICORN]: {
    name: 'Capricornio',
    symbol: '♑',
    unicode: '\u2651',
    element: 'earth',
    modality: 'cardinal',
    startDate: { month: 12, day: 22 },
    endDate: { month: 1, day: 19 },
  },
  [ZodiacSign.AQUARIUS]: {
    name: 'Acuario',
    symbol: '♒',
    unicode: '\u2652',
    element: 'air',
    modality: 'fixed',
    startDate: { month: 1, day: 20 },
    endDate: { month: 2, day: 18 },
  },
  [ZodiacSign.PISCES]: {
    name: 'Piscis',
    symbol: '♓',
    unicode: '\u2653',
    element: 'water',
    modality: 'mutable',
    startDate: { month: 2, day: 19 },
    endDate: { month: 3, day: 20 },
  },
};
