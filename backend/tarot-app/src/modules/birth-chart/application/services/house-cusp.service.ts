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
    return rawCusps.cusps.map((longitude, index) => {
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
      rulers[cusp.house] = cusp.sign as ZodiacSign;
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
   * Detecta signos duplicados (mismo signo en dos cúspides consecutivas)
   *
   * @param cusps - Array de cúspides calculadas
   * @returns Array de objetos con signo y las casas donde aparece
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
    const sizes: Record<number, number> = {};

    for (let i = 0; i < 12; i++) {
      const current = cusps[i].longitude;
      const next = cusps[(i + 1) % 12].longitude;

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
    const degrees = Math.floor(cusp.signDegree);
    const minutes = Math.round((cusp.signDegree - degrees) * 60);

    return `Casa ${cusp.house}: ${degrees}° ${minutes}' ${cusp.sign}`;
  }

  /**
   * Agrupa casas por elemento del signo en su cúspide
   *
   * @param cusps - Array de cúspides calculadas
   * @returns Mapa de elemento a números de casas
   */
  groupByElement(cusps: HouseCusp[]): Record<string, number[]> {
    const groups: Record<string, number[]> = {
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

    return 'fire'; // fallback
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

    return mapping[houseNumber] || House.FIRST;
  }
}
