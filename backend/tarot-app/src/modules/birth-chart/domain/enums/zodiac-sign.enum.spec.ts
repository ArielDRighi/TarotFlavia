import { ZodiacSign, ZodiacSignMetadata } from './zodiac-sign.enum';

describe('ZodiacSign Enum', () => {
  describe('Enum Values', () => {
    it('should have 12 zodiac signs', () => {
      const signs = Object.values(ZodiacSign);
      expect(signs).toHaveLength(12);
    });

    it('should have string values in lowercase', () => {
      Object.values(ZodiacSign).forEach((sign) => {
        expect(typeof sign).toBe('string');
        expect(sign).toBe(sign.toLowerCase());
      });
    });

    it('should have all expected signs', () => {
      expect(ZodiacSign.ARIES).toBeDefined();
      expect(ZodiacSign.TAURUS).toBeDefined();
      expect(ZodiacSign.GEMINI).toBeDefined();
      expect(ZodiacSign.CANCER).toBeDefined();
      expect(ZodiacSign.LEO).toBeDefined();
      expect(ZodiacSign.VIRGO).toBeDefined();
      expect(ZodiacSign.LIBRA).toBeDefined();
      expect(ZodiacSign.SCORPIO).toBeDefined();
      expect(ZodiacSign.SAGITTARIUS).toBeDefined();
      expect(ZodiacSign.CAPRICORN).toBeDefined();
      expect(ZodiacSign.AQUARIUS).toBeDefined();
      expect(ZodiacSign.PISCES).toBeDefined();
    });
  });

  describe('ZodiacSign Metadata', () => {
    it('should have metadata for all signs', () => {
      Object.values(ZodiacSign).forEach((sign) => {
        expect(ZodiacSignMetadata[sign]).toBeDefined();
      });
    });

    it('should have complete metadata structure', () => {
      Object.values(ZodiacSign).forEach((sign) => {
        const metadata = ZodiacSignMetadata[sign];
        expect(metadata).toHaveProperty('name');
        expect(metadata).toHaveProperty('symbol');
        expect(metadata).toHaveProperty('unicode');
        expect(metadata).toHaveProperty('element');
        expect(metadata).toHaveProperty('modality');
        expect(metadata).toHaveProperty('startDate');
        expect(metadata).toHaveProperty('endDate');
      });
    });

    it('should have names in Spanish', () => {
      expect(ZodiacSignMetadata[ZodiacSign.ARIES].name).toBe('Aries');
      expect(ZodiacSignMetadata[ZodiacSign.TAURUS].name).toBe('Tauro');
      expect(ZodiacSignMetadata[ZodiacSign.GEMINI].name).toBe('Géminis');
      expect(ZodiacSignMetadata[ZodiacSign.CANCER].name).toBe('Cáncer');
      expect(ZodiacSignMetadata[ZodiacSign.LEO].name).toBe('Leo');
      expect(ZodiacSignMetadata[ZodiacSign.VIRGO].name).toBe('Virgo');
      expect(ZodiacSignMetadata[ZodiacSign.LIBRA].name).toBe('Libra');
      expect(ZodiacSignMetadata[ZodiacSign.SCORPIO].name).toBe('Escorpio');
      expect(ZodiacSignMetadata[ZodiacSign.SAGITTARIUS].name).toBe('Sagitario');
      expect(ZodiacSignMetadata[ZodiacSign.CAPRICORN].name).toBe('Capricornio');
      expect(ZodiacSignMetadata[ZodiacSign.AQUARIUS].name).toBe('Acuario');
      expect(ZodiacSignMetadata[ZodiacSign.PISCES].name).toBe('Piscis');
    });

    it('should have valid elements', () => {
      const validElements = ['fire', 'earth', 'air', 'water'];
      Object.values(ZodiacSign).forEach((sign) => {
        const metadata = ZodiacSignMetadata[sign];
        expect(validElements).toContain(metadata.element);
      });
    });

    it('should have valid modalities', () => {
      const validModalities = ['cardinal', 'fixed', 'mutable'];
      Object.values(ZodiacSign).forEach((sign) => {
        const metadata = ZodiacSignMetadata[sign];
        expect(validModalities).toContain(metadata.modality);
      });
    });

    it('should have valid date ranges', () => {
      Object.values(ZodiacSign).forEach((sign) => {
        const metadata = ZodiacSignMetadata[sign];
        expect(metadata.startDate.month).toBeGreaterThanOrEqual(1);
        expect(metadata.startDate.month).toBeLessThanOrEqual(12);
        expect(metadata.startDate.day).toBeGreaterThanOrEqual(1);
        expect(metadata.startDate.day).toBeLessThanOrEqual(31);
        expect(metadata.endDate.month).toBeGreaterThanOrEqual(1);
        expect(metadata.endDate.month).toBeLessThanOrEqual(12);
        expect(metadata.endDate.day).toBeGreaterThanOrEqual(1);
        expect(metadata.endDate.day).toBeLessThanOrEqual(31);
      });
    });

    it('should have non-empty symbols', () => {
      Object.values(ZodiacSign).forEach((sign) => {
        const metadata = ZodiacSignMetadata[sign];
        expect(metadata.symbol.length).toBeGreaterThan(0);
        expect(metadata.unicode.length).toBe(1);
      });
    });

    it('should have 3 signs per element', () => {
      const elements = { fire: 0, earth: 0, air: 0, water: 0 };
      Object.values(ZodiacSign).forEach((sign) => {
        const element = ZodiacSignMetadata[sign].element;
        elements[element]++;
      });
      expect(elements.fire).toBe(3);
      expect(elements.earth).toBe(3);
      expect(elements.air).toBe(3);
      expect(elements.water).toBe(3);
    });

    it('should have 4 signs per modality', () => {
      const modalities = { cardinal: 0, fixed: 0, mutable: 0 };
      Object.values(ZodiacSign).forEach((sign) => {
        const modality = ZodiacSignMetadata[sign].modality;
        modalities[modality]++;
      });
      expect(modalities.cardinal).toBe(4);
      expect(modalities.fixed).toBe(4);
      expect(modalities.mutable).toBe(4);
    });
  });

  describe('Specific Sign Values', () => {
    it('should have correct enum values', () => {
      expect(ZodiacSign.ARIES).toBe('aries');
      expect(ZodiacSign.TAURUS).toBe('taurus');
      expect(ZodiacSign.GEMINI).toBe('gemini');
      expect(ZodiacSign.CANCER).toBe('cancer');
      expect(ZodiacSign.LEO).toBe('leo');
      expect(ZodiacSign.VIRGO).toBe('virgo');
      expect(ZodiacSign.LIBRA).toBe('libra');
      expect(ZodiacSign.SCORPIO).toBe('scorpio');
      expect(ZodiacSign.SAGITTARIUS).toBe('sagittarius');
      expect(ZodiacSign.CAPRICORN).toBe('capricorn');
      expect(ZodiacSign.AQUARIUS).toBe('aquarius');
      expect(ZodiacSign.PISCES).toBe('pisces');
    });
  });
});
