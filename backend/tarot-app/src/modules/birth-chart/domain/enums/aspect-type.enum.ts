/**
 * Enum de tipos de aspectos astrológicos
 *
 * Representa los 5 aspectos principales entre planetas:
 * - Conjunción (0°): Fusión de energías
 * - Oposición (180°): Tensión, polaridad
 * - Cuadratura (90°): Desafío, acción
 * - Trígono (120°): Armonía, fluidez
 * - Sextil (60°): Oportunidad, colaboración
 */
export enum AspectType {
  CONJUNCTION = 'conjunction',
  OPPOSITION = 'opposition',
  SQUARE = 'square',
  TRINE = 'trine',
  SEXTILE = 'sextile',
}

/**
 * Metadata de aspectos astrológicos
 *
 * Incluye información para cálculo y visualización:
 * - name: Nombre en español
 * - symbol: Símbolo visual del aspecto
 * - angle: Ángulo exacto en grados
 * - orb: Orbe permitido (desviación aceptable en grados)
 * - nature: Naturaleza del aspecto (armonioso, desafiante, neutral)
 */
export const AspectTypeMetadata: Record<
  AspectType,
  {
    name: string;
    symbol: string;
    angle: number;
    orb: number;
    nature: 'harmonious' | 'challenging' | 'neutral';
  }
> = {
  [AspectType.CONJUNCTION]: {
    name: 'Conjunción',
    symbol: '☌',
    angle: 0,
    orb: 8,
    nature: 'neutral',
  },
  [AspectType.OPPOSITION]: {
    name: 'Oposición',
    symbol: '☍',
    angle: 180,
    orb: 8,
    nature: 'challenging',
  },
  [AspectType.SQUARE]: {
    name: 'Cuadratura',
    symbol: '□',
    angle: 90,
    orb: 6,
    nature: 'challenging',
  },
  [AspectType.TRINE]: {
    name: 'Trígono',
    symbol: '△',
    angle: 120,
    orb: 8,
    nature: 'harmonious',
  },
  [AspectType.SEXTILE]: {
    name: 'Sextil',
    symbol: '⚹',
    angle: 60,
    orb: 4,
    nature: 'harmonious',
  },
};
