import { House, HouseMetadata } from './house.enum';

describe('House Enum', () => {
  describe('Enum Values', () => {
    it('should have 12 houses', () => {
      const houses = Object.values(House);
      expect(houses).toHaveLength(12);
    });

    it('should have string values in lowercase', () => {
      Object.values(House).forEach((house) => {
        expect(typeof house).toBe('string');
        expect(house).toBe(house.toLowerCase());
      });
    });

    it('should have all expected houses', () => {
      expect(House.FIRST).toBeDefined();
      expect(House.SECOND).toBeDefined();
      expect(House.THIRD).toBeDefined();
      expect(House.FOURTH).toBeDefined();
      expect(House.FIFTH).toBeDefined();
      expect(House.SIXTH).toBeDefined();
      expect(House.SEVENTH).toBeDefined();
      expect(House.EIGHTH).toBeDefined();
      expect(House.NINTH).toBeDefined();
      expect(House.TENTH).toBeDefined();
      expect(House.ELEVENTH).toBeDefined();
      expect(House.TWELFTH).toBeDefined();
    });
  });

  describe('House Metadata', () => {
    it('should have metadata for all houses', () => {
      Object.values(House).forEach((house) => {
        expect(HouseMetadata[house]).toBeDefined();
      });
    });

    it('should have complete metadata structure', () => {
      Object.values(House).forEach((house) => {
        const metadata = HouseMetadata[house];
        expect(metadata).toHaveProperty('name');
        expect(metadata).toHaveProperty('theme');
        expect(metadata).toHaveProperty('keywords');
        expect(typeof metadata.name).toBe('string');
        expect(typeof metadata.theme).toBe('string');
        expect(Array.isArray(metadata.keywords)).toBe(true);
      });
    });

    it('should have names in Spanish', () => {
      expect(HouseMetadata[House.FIRST].name).toBe('Casa I');
      expect(HouseMetadata[House.SECOND].name).toBe('Casa II');
      expect(HouseMetadata[House.THIRD].name).toBe('Casa III');
      expect(HouseMetadata[House.FOURTH].name).toBe('Casa IV');
      expect(HouseMetadata[House.FIFTH].name).toBe('Casa V');
      expect(HouseMetadata[House.SIXTH].name).toBe('Casa VI');
      expect(HouseMetadata[House.SEVENTH].name).toBe('Casa VII');
      expect(HouseMetadata[House.EIGHTH].name).toBe('Casa VIII');
      expect(HouseMetadata[House.NINTH].name).toBe('Casa IX');
      expect(HouseMetadata[House.TENTH].name).toBe('Casa X');
      expect(HouseMetadata[House.ELEVENTH].name).toBe('Casa XI');
      expect(HouseMetadata[House.TWELFTH].name).toBe('Casa XII');
    });

    it('should have non-empty themes', () => {
      Object.values(House).forEach((house) => {
        const metadata = HouseMetadata[house];
        expect(metadata.theme.length).toBeGreaterThan(0);
      });
    });

    it('should have at least 2 keywords per house', () => {
      Object.values(House).forEach((house) => {
        const metadata = HouseMetadata[house];
        expect(metadata.keywords.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Specific House Values', () => {
    it('should have correct enum values', () => {
      expect(House.FIRST).toBe('first');
      expect(House.SECOND).toBe('second');
      expect(House.THIRD).toBe('third');
      expect(House.FOURTH).toBe('fourth');
      expect(House.FIFTH).toBe('fifth');
      expect(House.SIXTH).toBe('sixth');
      expect(House.SEVENTH).toBe('seventh');
      expect(House.EIGHTH).toBe('eighth');
      expect(House.NINTH).toBe('ninth');
      expect(House.TENTH).toBe('tenth');
      expect(House.ELEVENTH).toBe('eleventh');
      expect(House.TWELFTH).toBe('twelfth');
    });
  });
});
