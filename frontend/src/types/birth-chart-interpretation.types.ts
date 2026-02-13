/**
 * Tipos de Interpretaciones de Carta Astral
 *
 * Define las interfaces TypeScript para las interpretaciones astrológicas
 * estáticas y síntesis generada por IA.
 */

import { ZodiacSign, Planet } from './birth-chart.enums';

/**
 * Interpretación del Big Three (Sol, Luna, Ascendente)
 */
export interface BigThreeInterpretation {
  sun: {
    sign: ZodiacSign;
    signName: string;
    interpretation: string;
  };
  moon: {
    sign: ZodiacSign;
    signName: string;
    interpretation: string;
  };
  ascendant: {
    sign: ZodiacSign;
    signName: string;
    interpretation: string;
  };
}

/**
 * Interpretación de un aspecto planetario
 */
export interface AspectInterpretation {
  withPlanet: string;
  withPlanetName: string;
  aspectType: string;
  aspectName: string;
  interpretation: string;
}

/**
 * Interpretación completa de un planeta
 */
export interface PlanetInterpretation {
  planet: Planet;
  planetName: string;
  intro?: string;
  inSign?: string;
  inHouse?: string;
  aspects?: AspectInterpretation[];
}

/**
 * Informe completo de interpretaciones (Free/Premium)
 */
export interface FullInterpretation {
  planets: PlanetInterpretation[];
}

/**
 * Síntesis personalizada generada por IA (solo Premium)
 */
export interface AISynthesis {
  content: string;
  generatedAt: string | null;
  provider: string;
}
