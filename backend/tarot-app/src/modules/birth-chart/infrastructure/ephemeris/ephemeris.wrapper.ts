import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sweph from 'sweph';
import {
  EphemerisInput,
  EphemerisOutput,
  RawHouseCusps,
  RawPlanetPosition,
} from './ephemeris.types';

const HOUSE_SYSTEMS: Record<string, string> = {
  placidus: 'P',
  koch: 'K',
  equal: 'E',
  whole_sign: 'W',
  campanus: 'C',
  regiomontanus: 'R',
};

@Injectable()
export class EphemerisWrapper implements OnModuleInit {
  private readonly logger = new Logger(EphemerisWrapper.name);
  private readonly houseSystem: string;
  private isInitialized = false;

  private readonly PLANETS = [
    { id: sweph.constants.SE_SUN, name: 'sun' },
    { id: sweph.constants.SE_MOON, name: 'moon' },
    { id: sweph.constants.SE_MERCURY, name: 'mercury' },
    { id: sweph.constants.SE_VENUS, name: 'venus' },
    { id: sweph.constants.SE_MARS, name: 'mars' },
    { id: sweph.constants.SE_JUPITER, name: 'jupiter' },
    { id: sweph.constants.SE_SATURN, name: 'saturn' },
    { id: sweph.constants.SE_URANUS, name: 'uranus' },
    { id: sweph.constants.SE_NEPTUNE, name: 'neptune' },
    { id: sweph.constants.SE_PLUTO, name: 'pluto' },
  ];

  constructor(private readonly configService: ConfigService) {
    this.houseSystem = this.configService.get<string>(
      'ephemeris.houseSystem',
      'placidus',
    );
  }

  /**
   * Initializes Swiss Ephemeris on module load
   */
  onModuleInit(): void {
    try {
      const ephePath = this.configService.get<string>('SWEPH_PATH');
      if (ephePath) {
        sweph.set_ephe_path(ephePath);
      }

      this.isInitialized = true;
      this.logger.log('Swiss Ephemeris initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Swiss Ephemeris:', error);
      throw error;
    }
  }

  /**
   * Calculates planetary positions and houses for a given date/time/location
   */
  calculate(input: EphemerisInput): EphemerisOutput {
    if (!this.isInitialized) {
      throw new Error('Swiss Ephemeris not initialized');
    }

    const { year, month, day } = input;
    this.logger.debug(
      `Calculating ephemeris for date ${year}-${month}-${day} using house system ${this.houseSystem}`,
    );

    try {
      const julianDay = this.calculateJulianDay(
        input.year,
        input.month,
        input.day,
        input.hour,
        input.minute,
      );

      const planets = this.calculatePlanets(julianDay);
      const houses = this.calculateHouses(
        julianDay,
        input.latitude,
        input.longitude,
      );
      const siderealTime = sweph.sidtime(julianDay);

      return {
        planets,
        houses,
        julianDay,
        siderealTime,
      };
    } catch (error) {
      this.logger.error('Error calculating ephemeris:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Ephemeris calculation failed: ${message}`);
    }
  }

  /**
   * Calculates Julian Day from date/time
   */
  private calculateJulianDay(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
  ): number {
    const hourDecimal = hour + minute / 60;
    return sweph.julday(
      year,
      month,
      day,
      hourDecimal,
      sweph.constants.SE_GREG_CAL,
    );
  }

  /**
   * Calculates positions of the 10 main planets
   */
  private calculatePlanets(julianDay: number): RawPlanetPosition[] {
    const flags = sweph.constants.SEFLG_SWIEPH | sweph.constants.SEFLG_SPEED;

    return this.PLANETS.map(({ id, name }) => {
      try {
        const result = sweph.calc_ut(julianDay, id, flags);

        return {
          name,
          longitude: result.data[0],
          latitude: result.data[1],
          distance: result.data[2],
          longitudeSpeed: result.data[3],
        };
      } catch (error) {
        this.logger.warn(`Exception calculating ${name}:`, error);
        return this.createEmptyPosition(name);
      }
    });
  }

  /**
   * Calculates the 12 house cusps + Ascendant + MC
   */
  private calculateHouses(
    julianDay: number,
    latitude: number,
    longitude: number,
  ): RawHouseCusps {
    const houseSystemChar = HOUSE_SYSTEMS[this.houseSystem] || 'P';

    try {
      const result = sweph.houses(
        julianDay,
        latitude,
        longitude,
        houseSystemChar,
      );

      const cusps: number[] = [];
      for (let i = 0; i < 12; i++) {
        cusps.push(result.data.houses[i]);
      }

      return {
        cusps,
        ascendant: result.data.points[0],
        midheaven: result.data.points[1],
      };
    } catch (error) {
      this.logger.warn('Exception calculating houses:', error);
      return this.createEmptyHouses();
    }
  }

  /**
   * Creates an empty position for error handling
   */
  private createEmptyPosition(name: string): RawPlanetPosition {
    return {
      name,
      longitude: 0,
      latitude: 0,
      distance: 0,
      longitudeSpeed: 0,
    };
  }

  /**
   * Creates empty houses for error handling
   */
  private createEmptyHouses(): RawHouseCusps {
    return {
      cusps: Array(12)
        .fill(0)
        .map((_, i) => i * 30),
      ascendant: 0,
      midheaven: 270,
    };
  }

  /**
   * Validates that coordinates are valid
   */
  validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    );
  }

  /**
   * Validates that the year is within the application's supported range.
   * Restricted to 1800-2400 for practical astrological use cases.
   * (Swiss Ephemeris itself supports ~-13000 to ~+16800)
   */
  validateDate(year: number): boolean {
    return year >= 1800 && year <= 2400;
  }

  /**
   * Closes Swiss Ephemeris (call when destroying the module)
   */
  close(): void {
    sweph.close();
    this.isInitialized = false;
    this.logger.log('Swiss Ephemeris closed');
  }
}
