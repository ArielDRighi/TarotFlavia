/**
 * Utilidades de conversión para @astrodraw/astrochart
 * @module astrochart.utils
 */

import { Planet, ZodiacSign } from '@/types/birth-chart.enums';
import type { PlanetPosition, HouseCusp, ChartAspect } from '@/types/birth-chart.types';

/**
 * Mapeo de nombres de planetas (nuestro enum → astrochart)
 * La librería astrochart espera nombres en inglés con capitalización específica
 */
const PLANET_NAME_MAP: Record<Planet, string> = {
  [Planet.SUN]: 'Sun',
  [Planet.MOON]: 'Moon',
  [Planet.MERCURY]: 'Mercury',
  [Planet.VENUS]: 'Venus',
  [Planet.MARS]: 'Mars',
  [Planet.JUPITER]: 'Jupiter',
  [Planet.SATURN]: 'Saturn',
  [Planet.URANUS]: 'Uranus',
  [Planet.NEPTUNE]: 'Neptune',
  [Planet.PLUTO]: 'Pluto',
};

/**
 * Orden de signos zodiacales para cálculo de longitud absoluta
 * Index 0 = Aries (0°-30°), Index 1 = Taurus (30°-60°), etc.
 */
const ZODIAC_SIGN_ORDER = [
  ZodiacSign.ARIES,
  ZodiacSign.TAURUS,
  ZodiacSign.GEMINI,
  ZodiacSign.CANCER,
  ZodiacSign.LEO,
  ZodiacSign.VIRGO,
  ZodiacSign.LIBRA,
  ZodiacSign.SCORPIO,
  ZodiacSign.SAGITTARIUS,
  ZodiacSign.CAPRICORN,
  ZodiacSign.AQUARIUS,
  ZodiacSign.PISCES,
];

/**
 * Interfaz para punto planetario en formato astrochart
 */
export interface AstroChartPoint {
  name: string;
  position: number;
  retrograde: boolean;
}

/**
 * Convierte nuestras posiciones planetarias al formato de astrochart
 *
 * @param planets - Array de posiciones planetarias del backend
 * @returns Array de puntos en formato astrochart
 *
 * @example
 * ```typescript
 * const planets = [
 *   { planet: Planet.SUN, sign: ZodiacSign.ARIES, signDegree: 15.5, ... }
 * ];
 * const points = convertPlanetsToAstroChart(planets);
 * // [{ name: 'Sun', position: 15.5, retrograde: false }]
 * ```
 */
export function convertPlanetsToAstroChart(
  planets: PlanetPosition[],
): AstroChartPoint[] {
  return planets.map((planet) => {
    // Calcular longitud absoluta desde signo + grado
    // Cada signo ocupa 30° (12 signos * 30° = 360°)
    const signIndex = ZODIAC_SIGN_ORDER.indexOf(planet.sign);
    // Fallback defensivo: si el signo no se encuentra, usar Aries (0) para evitar longitudes negativas
    const safeSignIndex = signIndex === -1 ? 0 : signIndex;
    const absoluteLongitude = safeSignIndex * 30 + planet.signDegree;

    return {
      name: PLANET_NAME_MAP[planet.planet] || planet.planet,
      position: absoluteLongitude,
      retrograde: planet.isRetrograde,
    };
  });
}

/**
 * Convierte nuestras cúspides de casas al formato de astrochart
 *
 * @param houses - Array de cúspides de casas del backend
 * @returns Array de 12 longitudes absolutas para las cúspides
 *
 * @example
 * ```typescript
 * const houses = [
 *   { house: 1, sign: ZodiacSign.ARIES, signDegree: 0, ... },
 *   { house: 2, sign: ZodiacSign.TAURUS, signDegree: 15, ... }
 * ];
 * const cusps = convertHousesToAstroChart(houses);
 * // [0, 45, ...]
 * ```
 */
export function convertHousesToAstroChart(houses: HouseCusp[]): number[] {
  return houses.map((house) => {
    const signIndex = ZODIAC_SIGN_ORDER.indexOf(house.sign);
    // Fallback defensivo: si el signo no se encuentra, usar Aries (0) para evitar longitudes negativas
    const safeSignIndex = signIndex === -1 ? 0 : signIndex;
    return safeSignIndex * 30 + house.signDegree;
  });
}

/**
 * Calcula el Ascendente (longitud absoluta) para rotar el gráfico
 *
 * El Ascendente es la cúspide de la Casa 1 y determina la orientación
 * de toda la carta astral.
 *
 * @param houses - Array de cúspides de casas
 * @returns Longitud absoluta del Ascendente (0-360°) o 0 si no se encuentra
 *
 * @example
 * ```typescript
 * const houses = [
 *   { house: 1, sign: ZodiacSign.LEO, signDegree: 12.5, ... }
 * ];
 * const asc = getAscendantLongitude(houses);
 * // 132.5 (Leo está en index 4: 4 * 30 + 12.5)
 * ```
 */
export function getAscendantLongitude(houses: HouseCusp[]): number {
  const house1 = houses.find((h) => h.house === 1);
  if (!house1) return 0;

  const signIndex = ZODIAC_SIGN_ORDER.indexOf(house1.sign);
  if (signIndex === -1) {
    // Datos corruptos o signo desconocido: devolvemos 0 para evitar longitudes negativas
    return 0;
  }
  return signIndex * 30 + house1.signDegree;
}

/**
 * Interfaz para aspecto en formato astrochart
 */
export interface AstroChartAspect {
  point1: string;
  point2: string;
  aspect: string;
  orb: number;
}

/**
 * Prepara los datos de aspectos para renderizar en el gráfico
 *
 * @param aspects - Array de aspectos calculados del backend
 * @returns Array de aspectos en formato astrochart
 *
 * @example
 * ```typescript
 * const aspects = [
 *   {
 *     planet1: Planet.SUN,
 *     planet2: Planet.MOON,
 *     aspectType: AspectType.CONJUNCTION,
 *     orb: 2.5,
 *     ...
 *   }
 * ];
 * const chartAspects = prepareAspectsForChart(aspects);
 * // [{ point1: 'Sun', point2: 'Moon', aspect: 'conjunction', orb: 2.5 }]
 * ```
 */
export function prepareAspectsForChart(aspects: ChartAspect[]): AstroChartAspect[] {
  return aspects.map((aspect) => ({
    point1: PLANET_NAME_MAP[aspect.planet1] || aspect.planet1,
    point2: PLANET_NAME_MAP[aspect.planet2] || aspect.planet2,
    aspect: aspect.aspectType,
    orb: aspect.orb,
  }));
}

/**
 * Calcula el tamaño óptimo del gráfico según el contenedor
 *
 * Asegura que el gráfico se ajuste al contenedor respetando un tamaño máximo.
 * Útil para hacer el gráfico responsive.
 *
 * @param containerWidth - Ancho del contenedor en px
 * @param containerHeight - Alto del contenedor en px
 * @param maxSize - Tamaño máximo permitido (default: 600px)
 * @returns Tamaño óptimo para el gráfico en px
 *
 * @example
 * ```typescript
 * const size = calculateChartSize(800, 600, 500);
 * // 500 (limitado por maxSize)
 *
 * const size2 = calculateChartSize(400, 600, 800);
 * // 400 (limitado por containerWidth)
 * ```
 */
export function calculateChartSize(
  containerWidth: number,
  containerHeight: number,
  maxSize: number = 600
): number {
  const minDimension = Math.min(containerWidth, containerHeight);
  return Math.min(minDimension, maxSize);
}

/**
 * Genera un ID único para el contenedor del gráfico
 *
 * La librería astrochart requiere un ID único para cada instancia.
 * Útil cuando hay múltiples cartas en la misma página.
 *
 * @returns ID único con formato "astrochart-{random}"
 *
 * @example
 * ```typescript
 * const id = generateChartContainerId();
 * // "astrochart-abc1def"
 * ```
 */
export function generateChartContainerId(): string {
  return `astrochart-${Math.random().toString(36).substring(2, 9)}`;
}
