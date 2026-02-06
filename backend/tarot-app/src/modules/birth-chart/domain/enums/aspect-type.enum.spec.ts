import { AspectType, AspectTypeMetadata } from './aspect-type.enum';

describe('AspectType Enum', () => {
  describe('Enum Values', () => {
    it('should have 5 aspect types', () => {
      const aspects = Object.values(AspectType);
      expect(aspects).toHaveLength(5);
    });

    it('should have string values in lowercase', () => {
      Object.values(AspectType).forEach((aspect) => {
        expect(typeof aspect).toBe('string');
        expect(aspect).toBe(aspect.toLowerCase());
      });
    });

    it('should have all expected aspects', () => {
      expect(AspectType.CONJUNCTION).toBeDefined();
      expect(AspectType.OPPOSITION).toBeDefined();
      expect(AspectType.SQUARE).toBeDefined();
      expect(AspectType.TRINE).toBeDefined();
      expect(AspectType.SEXTILE).toBeDefined();
    });
  });

  describe('Aspect Metadata', () => {
    it('should have metadata for all aspects', () => {
      Object.values(AspectType).forEach((aspect) => {
        expect(AspectTypeMetadata[aspect]).toBeDefined();
      });
    });

    it('should have complete metadata structure', () => {
      Object.values(AspectType).forEach((aspect) => {
        const metadata = AspectTypeMetadata[aspect];
        expect(metadata).toHaveProperty('name');
        expect(metadata).toHaveProperty('symbol');
        expect(metadata).toHaveProperty('angle');
        expect(metadata).toHaveProperty('orb');
        expect(metadata).toHaveProperty('nature');
        expect(typeof metadata.name).toBe('string');
        expect(typeof metadata.symbol).toBe('string');
        expect(typeof metadata.angle).toBe('number');
        expect(typeof metadata.orb).toBe('number');
        expect(typeof metadata.nature).toBe('string');
      });
    });

    it('should have names in Spanish', () => {
      expect(AspectTypeMetadata[AspectType.CONJUNCTION].name).toBe(
        'Conjunción',
      );
      expect(AspectTypeMetadata[AspectType.OPPOSITION].name).toBe('Oposición');
      expect(AspectTypeMetadata[AspectType.SQUARE].name).toBe('Cuadratura');
      expect(AspectTypeMetadata[AspectType.TRINE].name).toBe('Trígono');
      expect(AspectTypeMetadata[AspectType.SEXTILE].name).toBe('Sextil');
    });

    it('should have valid nature values', () => {
      const validNatures = ['harmonious', 'challenging', 'neutral'];
      Object.values(AspectType).forEach((aspect) => {
        const metadata = AspectTypeMetadata[aspect];
        expect(validNatures).toContain(metadata.nature);
      });
    });

    it('should have correct angles', () => {
      expect(AspectTypeMetadata[AspectType.CONJUNCTION].angle).toBe(0);
      expect(AspectTypeMetadata[AspectType.OPPOSITION].angle).toBe(180);
      expect(AspectTypeMetadata[AspectType.SQUARE].angle).toBe(90);
      expect(AspectTypeMetadata[AspectType.TRINE].angle).toBe(120);
      expect(AspectTypeMetadata[AspectType.SEXTILE].angle).toBe(60);
    });

    it('should have positive orb values', () => {
      Object.values(AspectType).forEach((aspect) => {
        const metadata = AspectTypeMetadata[aspect];
        expect(metadata.orb).toBeGreaterThan(0);
        expect(metadata.orb).toBeLessThanOrEqual(10);
      });
    });

    it('should have non-empty symbols', () => {
      Object.values(AspectType).forEach((aspect) => {
        const metadata = AspectTypeMetadata[aspect];
        expect(metadata.symbol.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Specific Aspect Values', () => {
    it('should have correct enum values', () => {
      expect(AspectType.CONJUNCTION).toBe('conjunction');
      expect(AspectType.OPPOSITION).toBe('opposition');
      expect(AspectType.SQUARE).toBe('square');
      expect(AspectType.TRINE).toBe('trine');
      expect(AspectType.SEXTILE).toBe('sextile');
    });
  });
});
