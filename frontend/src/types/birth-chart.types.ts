/**
 * Tipos de Carta Astral
 *
 * Define las interfaces TypeScript para posiciones planetarias, casas,
 * aspectos y datos de la carta astral.
 */

import { ZodiacSign, Planet, AspectType, House } from './birth-chart.enums';

/**
 * Posición de un planeta en la carta
 */
export interface PlanetPosition {
  planet: Planet;
  sign: ZodiacSign;
  signName: string;
  signDegree: number;
  formattedPosition: string;
  house: number;
  isRetrograde: boolean;
}

/**
 * Cúspide de una casa astrológica
 */
export interface HouseCusp {
  house: House;
  sign: ZodiacSign;
  signName: string;
  signDegree: number;
  formattedPosition: string;
}

/**
 * Aspecto entre dos planetas
 */
export interface ChartAspect {
  planet1: Planet;
  planet1Name: string;
  planet2: Planet;
  planet2Name: string;
  aspectType: AspectType;
  aspectName: string;
  aspectSymbol: string;
  orb: number;
  isApplying: boolean;
}

/**
 * Distribución de elementos y modalidades en la carta
 */
export interface ChartDistribution {
  elements: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  modalities: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Datos para renderizar el gráfico SVG de la carta
 *
 * Nota: El backend (`BasicChartResponseDto`) define `chartSvgData` como
 * `Record<string, unknown>[]` para los tres arrays, por lo que no se
 * garantiza que coincida con las estructuras de `PlanetPosition`,
 * `HouseCusp` o `ChartAspect`. Aquí reflejamos ese contrato genérico.
 */
export interface ChartSvgData {
  planets: Record<string, unknown>[];
  houses: Record<string, unknown>[];
  aspects: Record<string, unknown>[];
}

/**
 * Datos de nacimiento (input del formulario)
 */
export interface BirthData {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Carta guardada en historial (solo Premium)
 */
export interface SavedChart {
  id: number;
  name: string;
  birthDate: string;
  sunSign: string;
  moonSign: string;
  ascendantSign: string;
  createdAt: string;
}
