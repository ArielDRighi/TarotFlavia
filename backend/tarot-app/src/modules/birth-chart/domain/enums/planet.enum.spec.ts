import { Planet, PlanetMetadata } from './planet.enum';

describe('Planet Enum', () => {
  describe('Enum Values', () => {
    it('should have 10 planets', () => {
      const planets = Object.values(Planet);
      expect(planets).toHaveLength(10);
    });

    it('should have string values in lowercase', () => {
      Object.values(Planet).forEach((planet) => {
        expect(typeof planet).toBe('string');
        expect(planet).toBe(planet.toLowerCase());
      });
    });

    it('should have all expected planets', () => {
      expect(Planet.SUN).toBeDefined();
      expect(Planet.MOON).toBeDefined();
      expect(Planet.MERCURY).toBeDefined();
      expect(Planet.VENUS).toBeDefined();
      expect(Planet.MARS).toBeDefined();
      expect(Planet.JUPITER).toBeDefined();
      expect(Planet.SATURN).toBeDefined();
      expect(Planet.URANUS).toBeDefined();
      expect(Planet.NEPTUNE).toBeDefined();
      expect(Planet.PLUTO).toBeDefined();
    });
  });

  describe('Planet Metadata', () => {
    it('should have metadata for all planets', () => {
      Object.values(Planet).forEach((planet) => {
        expect(PlanetMetadata[planet]).toBeDefined();
      });
    });

    it('should have complete metadata structure', () => {
      Object.values(Planet).forEach((planet) => {
        const metadata = PlanetMetadata[planet];
        expect(metadata).toHaveProperty('name');
        expect(metadata).toHaveProperty('symbol');
        expect(metadata).toHaveProperty('unicode');
        expect(typeof metadata.name).toBe('string');
        expect(typeof metadata.symbol).toBe('string');
        expect(typeof metadata.unicode).toBe('string');
      });
    });

    it('should have names in Spanish', () => {
      expect(PlanetMetadata[Planet.SUN].name).toBe('Sol');
      expect(PlanetMetadata[Planet.MOON].name).toBe('Luna');
      expect(PlanetMetadata[Planet.MERCURY].name).toBe('Mercurio');
      expect(PlanetMetadata[Planet.VENUS].name).toBe('Venus');
      expect(PlanetMetadata[Planet.MARS].name).toBe('Marte');
      expect(PlanetMetadata[Planet.JUPITER].name).toBe('Júpiter');
      expect(PlanetMetadata[Planet.SATURN].name).toBe('Saturno');
      expect(PlanetMetadata[Planet.URANUS].name).toBe('Urano');
      expect(PlanetMetadata[Planet.NEPTUNE].name).toBe('Neptuno');
      expect(PlanetMetadata[Planet.PLUTO].name).toBe('Plutón');
    });

    it('should have valid Unicode symbols', () => {
      Object.values(Planet).forEach((planet) => {
        const metadata = PlanetMetadata[planet];
        // Verificar que unicode es un string de un solo carácter (emoji/symbol)
        expect(metadata.unicode.length).toBe(1);
        expect(typeof metadata.unicode).toBe('string');
      });
    });

    it('should have non-empty symbols', () => {
      Object.values(Planet).forEach((planet) => {
        const metadata = PlanetMetadata[planet];
        expect(metadata.symbol.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Specific Planet Values', () => {
    it('should have correct enum values', () => {
      expect(Planet.SUN).toBe('sun');
      expect(Planet.MOON).toBe('moon');
      expect(Planet.MERCURY).toBe('mercury');
      expect(Planet.VENUS).toBe('venus');
      expect(Planet.MARS).toBe('mars');
      expect(Planet.JUPITER).toBe('jupiter');
      expect(Planet.SATURN).toBe('saturn');
      expect(Planet.URANUS).toBe('uranus');
      expect(Planet.NEPTUNE).toBe('neptune');
      expect(Planet.PLUTO).toBe('pluto');
    });
  });
});
