import { Injectable, Logger } from '@nestjs/common';
import { EphemerisWrapper } from '../../infrastructure/ephemeris/ephemeris.wrapper';
import { PlanetPositionService } from './planet-position.service';
import { HouseCuspService } from './house-cusp.service';
import { AspectCalculationService } from './aspect-calculation.service';
import {
  ChartData,
  ChartDistribution,
  PlanetPosition,
} from '../../entities/birth-chart.entity';
import { ZodiacSign, ZodiacSignMetadata } from '../../domain/enums';
import { localToUtc } from '../../domain/utils/timezone-utils';

export interface ChartCalculationInput {
  birthDate: Date;
  birthTime: string; // "HH:mm" o "HH:mm:ss"
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface ChartCalculationResult {
  chartData: ChartData;
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  ascendantSign: ZodiacSign;
  calculationTimeMs: number;
}

@Injectable()
export class ChartCalculationService {
  private readonly logger = new Logger(ChartCalculationService.name);

  constructor(
    private readonly ephemeris: EphemerisWrapper,
    private readonly planetService: PlanetPositionService,
    private readonly houseService: HouseCuspService,
    private readonly aspectService: AspectCalculationService,
  ) {}

  /**
   * Genera una carta astral completa
   */
  calculateChart(input: ChartCalculationInput): ChartCalculationResult {
    const startTime = Date.now();

    this.logger.log(`Calculating chart for: ${input.birthDate.toISOString()}`);

    try {
      // 1. Parsear fecha y hora (convirtiendo a UTC con el timezone del nacimiento)
      const { year, month, day, hour, minute } = this.parseDateTime(
        input.birthDate,
        input.birthTime,
        input.timezone,
      );

      // 2. Validar inputs
      this.validateInputs(year, input.latitude, input.longitude);

      // 3. Calcular efemérides raw
      const ephemerisOutput = this.ephemeris.calculate({
        year,
        month,
        day,
        hour,
        minute,
        latitude: input.latitude,
        longitude: input.longitude,
      });

      // 4. Transformar posiciones planetarias
      const planets = this.planetService.calculatePositions(
        ephemerisOutput.planets,
        ephemerisOutput.houses,
      );

      // 5. Transformar cúspides de casas
      const houses = this.houseService.calculateCusps(ephemerisOutput.houses);

      // 6. Calcular Ascendente y MC
      const ascendant = this.planetService.calculateAscendant(
        ephemerisOutput.houses.ascendant,
      );
      const midheaven = this.planetService.calculateMidheaven(
        ephemerisOutput.houses.midheaven,
      );

      // 7. Calcular aspectos
      const aspects = this.aspectService.calculateAspects(planets, ascendant);

      // 8. Calcular distribución (elementos, modalidades, polaridad)
      const distribution = this.calculateDistribution(planets, ascendant);

      // 9. Obtener Big Three
      const bigThree = this.planetService.getBigThree(planets, ascendant);

      // 10. Ensamblar ChartData
      const chartData: ChartData = {
        planets,
        houses,
        aspects,
        ascendant,
        midheaven,
        distribution,
        aiSynthesis: undefined, // Se agrega después por AI
      };

      // 11. Validar completitud de la carta
      const validation = this.validateChartData(chartData);
      if (!validation.valid) {
        throw new Error(
          `Chart data validation failed: ${validation.errors.join(', ')}`,
        );
      }

      const calculationTimeMs = Date.now() - startTime;

      this.logger.log(`Chart calculated in ${calculationTimeMs}ms`);

      return {
        chartData,
        sunSign: bigThree.sun,
        moonSign: bigThree.moon,
        ascendantSign: bigThree.ascendant,
        calculationTimeMs,
      };
    } catch (error) {
      this.logger.error('Error calculating chart:', error);
      throw new Error(
        `Chart calculation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Parsea fecha y hora de nacimiento
   */
  private parseDateTime(
    birthDate: Date,
    birthTime: string,
    timezone: string,
  ): {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  } {
    // Validar formato de birthTime
    const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
    const match = birthTime.match(timeRegex);

    if (!match) {
      throw new Error(
        `Invalid birthTime format: "${birthTime}". Expected format: "HH:mm" or "HH:mm:ss"`,
      );
    }

    const localHour = Number(match[1]);
    const localMinute = Number(match[2]);

    // Validar rangos
    if (localHour < 0 || localHour > 23) {
      throw new Error(
        `Invalid hour: ${localHour}. Hour must be between 0 and 23.`,
      );
    }

    if (localMinute < 0 || localMinute > 59) {
      throw new Error(
        `Invalid minute: ${localMinute}. Minute must be between 0 and 59.`,
      );
    }

    // Validar que birthDate sea válido
    if (isNaN(birthDate.getTime())) {
      throw new Error('Invalid birthDate: Date object is invalid (NaN).');
    }

    // Convertir hora local → UTC usando el timezone IANA del nacimiento
    // Swiss Ephemeris requiere UT (Universal Time) como entrada
    return localToUtc(
      {
        year: birthDate.getUTCFullYear(),
        month: birthDate.getUTCMonth() + 1, // JavaScript usa 0-11
        day: birthDate.getUTCDate(),
        hour: localHour,
        minute: localMinute,
      },
      timezone,
    );
  }

  /**
   * Valida inputs antes de calcular
   */
  private validateInputs(
    year: number,
    latitude: number,
    longitude: number,
  ): void {
    if (!this.ephemeris.validateDate(year)) {
      throw new Error(`Invalid year: ${year}. Must be between 1800 and 2400.`);
    }

    if (!this.ephemeris.validateCoordinates(latitude, longitude)) {
      throw new Error(`Invalid coordinates: lat=${latitude}, lon=${longitude}`);
    }
  }

  /**
   * Calcula distribución de elementos, modalidades y polaridad
   */
  private calculateDistribution(
    planets: PlanetPosition[],
    ascendant: PlanetPosition,
  ): ChartDistribution {
    // Incluir Ascendente en el conteo (es significativo)
    const allPoints = [...planets, ascendant];

    const elements = { fire: 0, earth: 0, air: 0, water: 0 };
    const modalities = { cardinal: 0, fixed: 0, mutable: 0 };
    const polarity = { masculine: 0, feminine: 0 };

    for (const point of allPoints) {
      const sign = point.sign as ZodiacSign;
      const metadata = ZodiacSignMetadata[sign];

      if (metadata) {
        // Contar elemento
        elements[metadata.element]++;

        // Contar modalidad
        modalities[metadata.modality]++;

        // Contar polaridad (fuego y aire = masculino, tierra y agua = femenino)
        if (metadata.element === 'fire' || metadata.element === 'air') {
          polarity.masculine++;
        } else {
          polarity.feminine++;
        }
      }
    }

    return { elements, modalities, polarity };
  }

  /**
   * Obtiene resumen de la carta para logs/debug
   */
  getChartSummary(result: ChartCalculationResult): string {
    const { chartData, sunSign, moonSign, ascendantSign } = result;

    return [
      `Big Three: Sol en ${sunSign}, Luna en ${moonSign}, Ascendente en ${ascendantSign}`,
      `Planetas: ${chartData.planets.length}`,
      `Aspectos: ${chartData.aspects.length}`,
      `Distribución: Fuego=${chartData.distribution.elements.fire}, ` +
        `Tierra=${chartData.distribution.elements.earth}, ` +
        `Aire=${chartData.distribution.elements.air}, ` +
        `Agua=${chartData.distribution.elements.water}`,
    ].join('\n');
  }

  /**
   * Valida si una carta calculada tiene datos completos
   */
  validateChartData(chartData: ChartData): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!chartData.planets || chartData.planets.length !== 10) {
      errors.push(`Expected 10 planets, got ${chartData.planets?.length || 0}`);
    }

    if (!chartData.houses || chartData.houses.length !== 12) {
      errors.push(`Expected 12 houses, got ${chartData.houses?.length || 0}`);
    }

    if (!chartData.ascendant) {
      errors.push('Missing ascendant');
    }

    if (!chartData.distribution) {
      errors.push('Missing distribution data');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
