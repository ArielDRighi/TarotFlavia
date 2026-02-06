import { House, HouseMetadata } from './house.enum';

describe('House Enum', () => {
  describe('Enum Values', () => {
    it('should have 12 houses', () => {
      const houses = Object.values(House).filter((v) => typeof v === 'number');
      expect(houses).toHaveLength(12);
    });

    it('should have numeric values from 1 to 12', () => {
      const numericValues = Object.values(House).filter(
        (v) => typeof v === 'number',
      ) as number[];
      numericValues.forEach((house) => {
        expect(house).toBeGreaterThanOrEqual(1);
        expect(house).toBeLessThanOrEqual(12);
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
      const numericValues = Object.values(House).filter(
        (v) => typeof v === 'number',
      ) as House[];
      numericValues.forEach((house) => {
        expect(HouseMetadata[house]).toBeDefined();
      });
    });

    it('should have complete metadata structure', () => {
      const numericValues = Object.values(House).filter(
        (v) => typeof v === 'number',
      ) as House[];
      numericValues.forEach((house) => {
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
      const numericValues = Object.values(House).filter(
        (v) => typeof v === 'number',
      ) as House[];
      numericValues.forEach((house) => {
        const metadata = HouseMetadata[house];
        expect(metadata.theme.length).toBeGreaterThan(0);
      });
    });

    it('should have at least 2 keywords per house', () => {
      const numericValues = Object.values(House).filter(
        (v) => typeof v === 'number',
      ) as House[];
      numericValues.forEach((house) => {
        const metadata = HouseMetadata[house];
        expect(metadata.keywords.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Specific House Values', () => {
    it('should have correct enum values', () => {
      expect(House.FIRST).toBe(1);
      expect(House.SECOND).toBe(2);
      expect(House.THIRD).toBe(3);
      expect(House.FOURTH).toBe(4);
      expect(House.FIFTH).toBe(5);
      expect(House.SIXTH).toBe(6);
      expect(House.SEVENTH).toBe(7);
      expect(House.EIGHTH).toBe(8);
      expect(House.NINTH).toBe(9);
      expect(House.TENTH).toBe(10);
      expect(House.ELEVENTH).toBe(11);
      expect(House.TWELFTH).toBe(12);
    });
  });
});
