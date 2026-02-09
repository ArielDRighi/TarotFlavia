/**
 * Input data for ephemeris calculations
 */
export interface EphemerisInput {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number; // 0-59
  latitude: number; // -90 to 90
  longitude: number; // -180 to 180
}

/**
 * Raw planetary position from Swiss Ephemeris
 */
export interface RawPlanetPosition {
  name: string;
  longitude: number; // 0-360 absolute degrees
  latitude: number; // Ecliptic latitude
  distance: number; // Distance in AU
  longitudeSpeed: number; // Speed (negative = retrograde)
}

/**
 * Raw house cusps from Swiss Ephemeris
 */
export interface RawHouseCusps {
  cusps: number[]; // 12 cusps in degrees
  ascendant: number; // Ascendant degree
  midheaven: number; // Midheaven (MC) degree
}

/**
 * Complete output from ephemeris calculations
 */
export interface EphemerisOutput {
  planets: RawPlanetPosition[];
  houses: RawHouseCusps;
  julianDay: number;
  siderealTime: number;
}
