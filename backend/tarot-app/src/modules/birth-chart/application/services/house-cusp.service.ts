import { Injectable, Logger } from '@nestjs/common';
import { ZodiacSign, House, HouseMetadata } from '../../domain/enums';
import { HouseCusp } from '../../entities/birth-chart.entity';
import { RawHouseCusps } from '../../infrastructure/ephemeris/ephemeris.types';
import { PlanetPositionService } from './planet-position.service';

/**
 * Servicio de cálculo de cúspides de casas
 *
 * Transforma las cúspides raw del wrapper de efemérides en objetos HouseCusp
 * enriquecidos con signo zodiacal y grado, y calcula metadata adicional de las casas.
 *
 * @example
 * const rawCusps = {...}; // De EphemerisWrapper
 * const cusps = service.calculateCusps(rawCusps);
 * const rulers = service.getHouseRulers(cusps);
 */
@Injectable()
export class HouseCuspService {
  private readonly logger = new Logger(HouseCuspService.name);

  constructor(private readonly positionService: PlanetPositionService) {}

  /**
   * Transforma cúspides raw en cúspides enriquecidas
   *
   * @param rawCusps - Cúspides raw de Swiss Ephemeris
   * @returns Array de 12 cúspides enriquecidas con signo y grado
   */
  calculateCusps(rawCusps: RawHouseCusps): HouseCusp[] {
    this.logger.debug('Calculating house cusps');

    const cusps = rawCusps?.cusps;

    if (!Array.isArray(cusps)) {
      this.logger.error(
        'Invalid house cusps data from ephemeris wrapper: "cusps" is not an array',
        { cusps },
      );
      throw new Error('Invalid house cusps data from ephemeris wrapper');
    }

    if (cusps.length !== 12) {
      this.logger.error(
        `Invalid house cusps data from ephemeris wrapper: expected 12 cusps, received ${cusps.length}`,
        { cusps },
      );
      throw new Error('Invalid house cusps data from ephemeris wrapper');
    }

    const hasOnlyFiniteNumbers = cusps.every(
      (value) => typeof value === 'number' && Number.isFinite(value),
    );

    if (!hasOnlyFiniteNumbers) {
      this.logger.error(
        'Invalid house cusps data from ephemeris wrapper: all cusps must be finite numbers',
        { cusps },
      );
      throw new Error('Invalid house cusps data from ephemeris wrapper');
    }

    return cusps.map((longitude, index) => {
      const houseNumber = index + 1;
      const { sign, degree } = this.positionService.longitudeToSign(longitude);

      return {
        house: houseNumber,
        longitude,
        sign,
        signDegree: degree,
      };
    });
  }

  /**
   * Obtiene la cúspide de una casa específica
   *
   * @param cusps - Array de cúspides calculadas
   * @param houseNumber - Número de casa (1-12)
   * @returns Cúspide de la casa o undefined si no existe
   */
  getCusp(cusps: HouseCusp[], houseNumber: number): HouseCusp | undefined {
    return cusps.find((c) => c.house === houseNumber);
  }

  /**
   * Calcula qué signo rige cada casa
   *
   * @param cusps - Array de cúspides calculadas
   * @returns Mapa de número de casa a signo zodiacal regente
   */
  getHouseRulers(cusps: HouseCusp[]): Record<number, ZodiacSign> {
    const rulers: Record<number, ZodiacSign> = {};

    for (const cusp of cusps) {
      const sign = cusp.sign;
      // Validar que el sign sea un ZodiacSign válido
      if (!Object.values(ZodiacSign).includes(sign as ZodiacSign)) {
        this.logger.error(
          `Invalid ZodiacSign in cusp: ${sign} for house ${cusp.house}`,
        );
        throw new Error(`Invalid ZodiacSign: ${sign}`);
      }
      rulers[cusp.house] = sign as ZodiacSign;
    }

    return rulers;
  }

  /**
   * Detecta casas interceptadas (signo completo dentro de una casa)
   * Esto ocurre en latitudes altas y es astrológicamente significativo
   *
   * @param cusps - Array de cúspides calculadas
   * @returns Array de signos que no aparecen en ninguna cúspide (interceptados)
   */
  findInterceptedSigns(cusps: HouseCusp[]): ZodiacSign[] {
    const signsOnCusps = new Set(cusps.map((c) => c.sign));
    const allSigns = Object.values(ZodiacSign);

    return allSigns.filter((sign) => !signsOnCusps.has(sign));
  }

  /**
   * Detecta signos duplicados (mismo signo presente en múltiples cúspides de casa)
   *
   * @param cusps - Array de cúspides calculadas
   * @returns Array de objetos con signo y las casas donde aparece más de una vez
   */
  findDuplicatedSigns(cusps: HouseCusp[]): Array<{
    sign: ZodiacSign;
    houses: number[];
  }> {
    const signCounts: Record<string, number[]> = {};

    for (const cusp of cusps) {
      if (!signCounts[cusp.sign]) {
        signCounts[cusp.sign] = [];
      }
      signCounts[cusp.sign].push(cusp.house);
    }

    return Object.entries(signCounts)
      .filter(([, houses]) => houses.length > 1)
      .map(([sign, houses]) => ({
        sign: sign as ZodiacSign,
        houses,
      }));
  }

  /**
   * Calcula el tamaño de cada casa en grados
   *
   * @param cusps - Array de cúspides calculadas
   * @returns Mapa de número de casa a tamaño en grados
   */
  calculateHouseSizes(cusps: HouseCusp[]): Record<number, number> {
    if (cusps.length !== 12) {
      this.logger.error(
        `Invalid cusps array: expected 12 elements, received ${cusps.length}`,
      );
      throw new Error('calculateHouseSizes requires exactly 12 cusps');
    }

    const sizes: Record<number, number> = {};

    for (let i = 0; i < 12; i++) {
      const current = cusps[i].longitude;
      const next = cusps[(i + 1) % 12].longitude;

      if (!Number.isFinite(current) || !Number.isFinite(next)) {
        this.logger.error(
          `Invalid longitude values at index ${i}: current=${current}, next=${next}`,
        );
        throw new Error('All cusps must have finite longitude values');
      }

      // Manejar cruce de 0°/360°
      let size = next - current;
      if (size < 0) {
        size += 360;
      }

      sizes[i + 1] = Math.round(size * 100) / 100;
    }

    return sizes;
  }

  /**
   * Obtiene información completa de una casa
   *
   * @param cusps - Array de cúspides calculadas
   * @param houseNumber - Número de casa (1-12)
   * @returns Información completa de la casa o null si no existe
   */
  getHouseInfo(
    cusps: HouseCusp[],
    houseNumber: number,
  ): {
    cusp: HouseCusp;
    theme: string;
    keywords: string[];
    size: number;
  } | null {
    const cusp = this.getCusp(cusps, houseNumber);
    if (!cusp) return null;

    // Obtener metadata de la casa usando el enum string como clave
    const houseKey = this.numberToHouseEnum(houseNumber);
    const metadata = HouseMetadata[houseKey];
    const sizes = this.calculateHouseSizes(cusps);

    return {
      cusp,
      theme: metadata?.theme || '',
      keywords: metadata?.keywords || [],
      size: sizes[houseNumber],
    };
  }

  /**
   * Formatea cúspide para display
   *
   * @param cusp - Cúspide a formatear
   * @returns String formateado (ej: "Casa 1: 15° 30' aries")
   */
  formatCusp(cusp: HouseCusp): string {
    let degrees = Math.floor(cusp.signDegree);
    let minutes = Math.round((cusp.signDegree - degrees) * 60);

    if (minutes === 60) {
      degrees += 1;
      minutes = 0;
    }

    return `Casa ${cusp.house}: ${degrees}° ${minutes}' ${cusp.sign}`;
  }

  /**
   * Agrupa casas por elemento del signo en su cúspide
   *
   * @param cusps - Array de cúspides calculadas
   * @returns Mapa de elemento a números de casas
   */
  groupByElement(
    cusps: HouseCusp[],
  ): Record<'fire' | 'earth' | 'air' | 'water', number[]> {
    const groups: Record<'fire' | 'earth' | 'air' | 'water', number[]> = {
      fire: [],
      earth: [],
      air: [],
      water: [],
    };

    for (const cusp of cusps) {
      const element = this.getSignElement(cusp.sign as ZodiacSign);
      if (element && groups[element]) {
        groups[element].push(cusp.house);
      }
    }

    return groups;
  }

  /**
   * Helper: obtiene el elemento de un signo
   *
   * @param sign - Signo zodiacal
   * @returns Elemento del signo (fire, earth, air, water)
   * @private
   */
  private getSignElement(sign: ZodiacSign): 'fire' | 'earth' | 'air' | 'water' {
    const fireSigns = [
      ZodiacSign.ARIES,
      ZodiacSign.LEO,
      ZodiacSign.SAGITTARIUS,
    ];
    const earthSigns = [
      ZodiacSign.TAURUS,
      ZodiacSign.VIRGO,
      ZodiacSign.CAPRICORN,
    ];
    const airSigns = [ZodiacSign.GEMINI, ZodiacSign.LIBRA, ZodiacSign.AQUARIUS];
    const waterSigns = [
      ZodiacSign.CANCER,
      ZodiacSign.SCORPIO,
      ZodiacSign.PISCES,
    ];

    if (fireSigns.includes(sign)) return 'fire';
    if (earthSigns.includes(sign)) return 'earth';
    if (airSigns.includes(sign)) return 'air';
    if (waterSigns.includes(sign)) return 'water';

    // Si llegamos aquí, el signo no corresponde a ningún elemento conocido.
    this.logger.error(
      `Unknown ZodiacSign received in getSignElement: ${sign as unknown as string}`,
    );
    throw new Error(`Unknown ZodiacSign: ${sign}`);
  }

  /**
   * Helper: convierte número de casa a enum House
   *
   * @param houseNumber - Número de casa (1-12)
   * @returns Valor del enum House
   * @private
   */
  private numberToHouseEnum(houseNumber: number): House {
    const mapping: Record<number, House> = {
      1: House.FIRST,
      2: House.SECOND,
      3: House.THIRD,
      4: House.FOURTH,
      5: House.FIFTH,
      6: House.SIXTH,
      7: House.SEVENTH,
      8: House.EIGHTH,
      9: House.NINTH,
      10: House.TENTH,
      11: House.ELEVENTH,
      12: House.TWELFTH,
    };

    const house = mapping[houseNumber];
    if (!house) {
      this.logger.error(
        `Invalid house number: ${houseNumber}. Expected a value between 1 and 12.`,
      );
      throw new Error(
        `Invalid house number: ${houseNumber}. House must be between 1 and 12.`,
      );
    }

    return house;
  }
}
