import { Injectable, Logger } from '@nestjs/common';
import { Planet, ZodiacSign, ZodiacSignMetadata } from '../../domain/enums';
import { PlanetPosition } from '../../entities/birth-chart.entity';
import {
  RawPlanetPosition,
  RawHouseCusps,
} from '../../infrastructure/ephemeris/ephemeris.types';

/**
 * Servicio de cálculo de posiciones planetarias
 *
 * Transforma las posiciones raw del wrapper de efemérides en objetos PlanetPosition
 * enriquecidos con signo zodiacal, grado en signo, casa y estado de retrogradación.
 *
 * @example
 * const rawPlanets = [...]; // De EphemerisWrapper
 * const rawHouses = {...};
 * const positions = service.calculatePositions(rawPlanets, rawHouses);
 */
@Injectable()
export class PlanetPositionService {
  private readonly logger = new Logger(PlanetPositionService.name);

  /**
   * Orden de signos zodiacales para cálculos
   * Inicia en Aries (0°) y termina en Piscis (330°)
   */
  private readonly ZODIAC_ORDER: ZodiacSign[] = [
    ZodiacSign.ARIES, // 0° - 30°
    ZodiacSign.TAURUS, // 30° - 60°
    ZodiacSign.GEMINI, // 60° - 90°
    ZodiacSign.CANCER, // 90° - 120°
    ZodiacSign.LEO, // 120° - 150°
    ZodiacSign.VIRGO, // 150° - 180°
    ZodiacSign.LIBRA, // 180° - 210°
    ZodiacSign.SCORPIO, // 210° - 240°
    ZodiacSign.SAGITTARIUS, // 240° - 270°
    ZodiacSign.CAPRICORN, // 270° - 300°
    ZodiacSign.AQUARIUS, // 300° - 330°
    ZodiacSign.PISCES, // 330° - 360°
  ];

  /**
   * Transforma posiciones raw en posiciones enriquecidas
   *
   * @param rawPlanets - Posiciones raw de Swiss Ephemeris
   * @param houseCusps - Cúspides de casas raw
   * @returns Array de posiciones planetarias enriquecidas
   */
  calculatePositions(
    rawPlanets: RawPlanetPosition[],
    houseCusps: RawHouseCusps,
  ): PlanetPosition[] {
    this.logger.debug(`Calculating positions for ${rawPlanets.length} planets`);
    return rawPlanets.map((raw) => this.enrichPosition(raw, houseCusps));
  }

  /**
   * Enriquece una posición raw con signo, casa y metadata
   *
   * @param raw - Posición raw de Swiss Ephemeris
   * @param houseCusps - Cúspides de casas
   * @returns Posición planetaria enriquecida
   */
  private enrichPosition(
    raw: RawPlanetPosition,
    houseCusps: RawHouseCusps,
  ): PlanetPosition {
    const planet = this.mapToPlanetEnum(raw.name);
    const { sign, degree } = this.longitudeToSign(raw.longitude);
    const house = this.calculateHouse(raw.longitude, houseCusps.cusps);
    const isRetrograde = raw.longitudeSpeed < 0;

    return {
      planet,
      longitude: raw.longitude,
      sign,
      signDegree: degree,
      house,
      isRetrograde,
    };
  }

  /**
   * Convierte nombre de planeta (string) a enum Planet
   *
   * @param name - Nombre del planeta (ej: "sun", "moon")
   * @returns Valor del enum Planet
   */
  private mapToPlanetEnum(name: string): string {
    const mapping: Record<string, Planet> = {
      sun: Planet.SUN,
      moon: Planet.MOON,
      mercury: Planet.MERCURY,
      venus: Planet.VENUS,
      mars: Planet.MARS,
      jupiter: Planet.JUPITER,
      saturn: Planet.SATURN,
      uranus: Planet.URANUS,
      neptune: Planet.NEPTUNE,
      pluto: Planet.PLUTO,
    };

    return mapping[name.toLowerCase()] || name;
  }

  /**
   * Convierte longitud absoluta (0-360°) a signo zodiacal y grado dentro del signo
   *
   * @param longitude - Longitud eclíptica en grados (0-360)
   * @returns Objeto con signo zodiacal y grado dentro del signo (0-30)
   *
   * @example
   * longitudeToSign(15) // { sign: ARIES, degree: 15 }
   * longitudeToSign(135) // { sign: LEO, degree: 15 }
   */
  longitudeToSign(longitude: number): { sign: ZodiacSign; degree: number } {
    // Normalizar a 0-360 (manejar negativos y > 360)
    const normalizedLong = ((longitude % 360) + 360) % 360;

    // Cada signo ocupa 30 grados
    const signIndex = Math.floor(normalizedLong / 30);
    const degree = normalizedLong % 30;

    return {
      sign: this.ZODIAC_ORDER[signIndex],
      degree: Math.round(degree * 100) / 100, // Redondear a 2 decimales
    };
  }

  /**
   * Determina en qué casa está un planeta basándose en su longitud
   *
   * @param longitude - Longitud eclíptica del planeta
   * @param cusps - Array de 12 cúspides (longitudes de inicio de cada casa)
   * @returns Número de casa (1-12)
   *
   * @example
   * // Con cúspides cada 30°:
   * calculateHouse(45, [0, 30, 60, ...]) // 2 (entre cúspides 1 y 2)
   */
  calculateHouse(longitude: number, cusps: number[]): number {
    // Normalizar longitud
    const normalizedLong = ((longitude % 360) + 360) % 360;

    // Buscar entre qué cúspides está el planeta
    for (let i = 0; i < 12; i++) {
      const currentCusp = cusps[i];
      const nextCusp = cusps[(i + 1) % 12];

      // Manejar el cruce de 0°/360° (cuando casa 12 termina y casa 1 empieza)
      if (currentCusp > nextCusp) {
        // La casa cruza el punto 0° Aries
        if (normalizedLong >= currentCusp || normalizedLong < nextCusp) {
          return i + 1;
        }
      } else {
        // Casa normal sin cruce
        if (normalizedLong >= currentCusp && normalizedLong < nextCusp) {
          return i + 1;
        }
      }
    }

    // Fallback a casa 1 (no debería llegar aquí)
    return 1;
  }

  /**
   * Calcula la posición del Ascendente como PlanetPosition
   *
   * @param ascendantLongitude - Longitud eclíptica del Ascendente
   * @returns Posición del Ascendente
   */
  calculateAscendant(ascendantLongitude: number): PlanetPosition {
    const { sign, degree } = this.longitudeToSign(ascendantLongitude);

    return {
      planet: 'ascendant',
      longitude: ascendantLongitude,
      sign,
      signDegree: degree,
      house: 1, // El Ascendente siempre define la cúspide de casa 1
      isRetrograde: false,
    };
  }

  /**
   * Calcula la posición del Medio Cielo (MC) como PlanetPosition
   *
   * @param midheavenLongitude - Longitud eclíptica del Medio Cielo
   * @returns Posición del Medio Cielo
   */
  calculateMidheaven(midheavenLongitude: number): PlanetPosition {
    const { sign, degree } = this.longitudeToSign(midheavenLongitude);

    return {
      planet: 'midheaven',
      longitude: midheavenLongitude,
      sign,
      signDegree: degree,
      house: 10, // El MC siempre define la cúspide de casa 10
      isRetrograde: false,
    };
  }

  /**
   * Formatea posición para display humano
   *
   * @param position - Posición planetaria
   * @returns String formateado (ej: "15° 30' Leo ℞")
   *
   * @example
   * formatPosition({ signDegree: 15.5, sign: 'leo', isRetrograde: true })
   * // "15° 30' Leo ℞"
   */
  formatPosition(position: PlanetPosition): string {
    const degrees = Math.floor(position.signDegree);
    const minutes = Math.round((position.signDegree - degrees) * 60);
    const signName =
      ZodiacSignMetadata[position.sign as ZodiacSign]?.name || position.sign;
    const retrograde = position.isRetrograde ? ' ℞' : '';

    return `${degrees}° ${minutes}' ${signName}${retrograde}`;
  }

  /**
   * Obtiene el "Big Three" de una carta astral
   *
   * @param planets - Array de posiciones planetarias
   * @param ascendant - Posición del Ascendente
   * @returns Objeto con Sol, Luna y Ascendente en signos
   *
   * @example
   * getBigThree(planets, ascendant)
   * // { sun: ZodiacSign.LEO, moon: ZodiacSign.CANCER, ascendant: ZodiacSign.VIRGO }
   */
  getBigThree(
    planets: PlanetPosition[],
    ascendant: PlanetPosition,
  ): { sun: ZodiacSign; moon: ZodiacSign; ascendant: ZodiacSign } {
    const sun = planets.find((p) => p.planet === (Planet.SUN as string));
    const moon = planets.find((p) => p.planet === (Planet.MOON as string));

    return {
      sun: (sun?.sign as ZodiacSign) || ZodiacSign.ARIES,
      moon: (moon?.sign as ZodiacSign) || ZodiacSign.ARIES,
      ascendant: (ascendant?.sign as ZodiacSign) || ZodiacSign.ARIES,
    };
  }
}
