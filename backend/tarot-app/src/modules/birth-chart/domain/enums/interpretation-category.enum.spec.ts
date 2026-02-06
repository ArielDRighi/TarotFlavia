import {
  InterpretationCategory,
  InterpretationCategoryMetadata,
} from './interpretation-category.enum';

describe('InterpretationCategory Enum', () => {
  describe('Enum Values', () => {
    it('should have 5 interpretation categories', () => {
      const categories = Object.values(InterpretationCategory);
      expect(categories).toHaveLength(5);
    });

    it('should have string values in snake_case', () => {
      Object.values(InterpretationCategory).forEach((category) => {
        expect(typeof category).toBe('string');
        expect(category).toMatch(/^[a-z_]+$/);
      });
    });

    it('should have all expected categories', () => {
      expect(InterpretationCategory.PLANET_INTRO).toBeDefined();
      expect(InterpretationCategory.PLANET_IN_SIGN).toBeDefined();
      expect(InterpretationCategory.PLANET_IN_HOUSE).toBeDefined();
      expect(InterpretationCategory.ASPECT).toBeDefined();
      expect(InterpretationCategory.ASCENDANT).toBeDefined();
    });
  });

  describe('InterpretationCategory Metadata', () => {
    it('should have metadata for all categories', () => {
      Object.values(InterpretationCategory).forEach((category) => {
        expect(InterpretationCategoryMetadata[category]).toBeDefined();
      });
    });

    it('should have complete metadata structure', () => {
      Object.values(InterpretationCategory).forEach((category) => {
        const metadata = InterpretationCategoryMetadata[category];
        expect(metadata).toHaveProperty('name');
        expect(metadata).toHaveProperty('description');
        expect(typeof metadata.name).toBe('string');
        expect(typeof metadata.description).toBe('string');
      });
    });

    it('should have names in Spanish', () => {
      expect(
        InterpretationCategoryMetadata[InterpretationCategory.PLANET_INTRO]
          .name,
      ).toBe('Introducción al Planeta');
      expect(
        InterpretationCategoryMetadata[InterpretationCategory.PLANET_IN_SIGN]
          .name,
      ).toBe('Planeta en Signo');
      expect(
        InterpretationCategoryMetadata[InterpretationCategory.PLANET_IN_HOUSE]
          .name,
      ).toBe('Planeta en Casa');
      expect(
        InterpretationCategoryMetadata[InterpretationCategory.ASPECT].name,
      ).toBe('Aspecto');
      expect(
        InterpretationCategoryMetadata[InterpretationCategory.ASCENDANT].name,
      ).toBe('Ascendente');
    });

    it('should have non-empty descriptions', () => {
      Object.values(InterpretationCategory).forEach((category) => {
        const metadata = InterpretationCategoryMetadata[category];
        expect(metadata.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Specific Category Values', () => {
    it('should have correct enum values', () => {
      expect(InterpretationCategory.PLANET_INTRO).toBe('planet_intro');
      expect(InterpretationCategory.PLANET_IN_SIGN).toBe('planet_in_sign');
      expect(InterpretationCategory.PLANET_IN_HOUSE).toBe('planet_in_house');
      expect(InterpretationCategory.ASPECT).toBe('aspect');
      expect(InterpretationCategory.ASCENDANT).toBe('ascendant');
    });
  });
});
