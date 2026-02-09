import {
  EphemerisInput,
  EphemerisOutput,
  RawHouseCusps,
  RawPlanetPosition,
} from './ephemeris.types';

describe('Ephemeris Types', () => {
  describe('EphemerisInput', () => {
    it('should accept valid input data', () => {
      const input: EphemerisInput = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        minute: 30,
        latitude: -34.6037,
        longitude: -58.3816,
      };

      expect(input.year).toBe(1990);
      expect(input.month).toBe(5);
      expect(input.latitude).toBe(-34.6037);
    });
  });

  describe('RawPlanetPosition', () => {
    it('should represent a planet position', () => {
      const position: RawPlanetPosition = {
        name: 'sun',
        longitude: 53.75,
        latitude: 0.0002,
        distance: 1.012,
        longitudeSpeed: 0.985,
      };

      expect(position.name).toBe('sun');
      expect(position.longitude).toBe(53.75);
    });

    it('should represent retrograde with negative speed', () => {
      const retrograde: RawPlanetPosition = {
        name: 'mercury',
        longitude: 120.5,
        latitude: 1.2,
        distance: 0.8,
        longitudeSpeed: -1.2,
      };

      expect(retrograde.longitudeSpeed).toBeLessThan(0);
    });
  });

  describe('RawHouseCusps', () => {
    it('should contain 12 cusps', () => {
      const houses: RawHouseCusps = {
        cusps: Array(12)
          .fill(0)
          .map((_, i) => i * 30),
        ascendant: 0,
        midheaven: 270,
      };

      expect(houses.cusps).toHaveLength(12);
      expect(houses.ascendant).toBe(0);
      expect(houses.midheaven).toBe(270);
    });
  });

  describe('EphemerisOutput', () => {
    it('should contain all required fields', () => {
      const output: EphemerisOutput = {
        planets: [
          {
            name: 'sun',
            longitude: 53.75,
            latitude: 0,
            distance: 1,
            longitudeSpeed: 1,
          },
        ],
        houses: {
          cusps: Array(12)
            .fill(0)
            .map((_, i) => i * 30),
          ascendant: 0,
          midheaven: 270,
        },
        julianDay: 2448027.1,
        siderealTime: 6.037,
      };

      expect(output.planets).toHaveLength(1);
      expect(output.julianDay).toBeDefined();
      expect(output.siderealTime).toBeDefined();
    });
  });
});
