import { BirthChartInterpretation } from './birth-chart-interpretation.entity';
import {
  InterpretationCategory,
  Planet,
  ZodiacSign,
  AspectType,
} from '../domain/enums';

describe('BirthChartInterpretation Entity', () => {
  describe('generateKey', () => {
    it('should generate key for planet_intro category', () => {
      const key = BirthChartInterpretation.generateKey(
        InterpretationCategory.PLANET_INTRO,
        Planet.SUN,
      );
      expect(key).toBe('planet_intro:sun::::');
    });

    it('should generate key for planet_in_sign category', () => {
      const key = BirthChartInterpretation.generateKey(
        InterpretationCategory.PLANET_IN_SIGN,
        Planet.MOON,
        ZodiacSign.ARIES,
      );
      expect(key).toBe('planet_in_sign:moon:aries:::');
    });

    it('should generate key for planet_in_house category', () => {
      const key = BirthChartInterpretation.generateKey(
        InterpretationCategory.PLANET_IN_HOUSE,
        Planet.VENUS,
        null,
        5,
      );
      expect(key).toBe('planet_in_house:venus::5::');
    });

    it('should generate key for aspect category', () => {
      const key = BirthChartInterpretation.generateKey(
        InterpretationCategory.ASPECT,
        Planet.MARS,
        null,
        null,
        AspectType.CONJUNCTION,
        Planet.JUPITER,
      );
      expect(key).toBe('aspect:mars:::conjunction:jupiter');
    });

    it('should generate key for ascendant category', () => {
      const key = BirthChartInterpretation.generateKey(
        InterpretationCategory.ASCENDANT,
        null,
        ZodiacSign.LEO,
      );
      expect(key).toBe('ascendant::leo:::');
    });

    it('should handle null/undefined values correctly', () => {
      const key = BirthChartInterpretation.generateKey(
        InterpretationCategory.PLANET_INTRO,
        Planet.MERCURY,
        null,
        null,
        null,
        null,
      );
      expect(key).toBe('planet_intro:mercury::::');
    });
  });

  describe('validateCombination', () => {
    describe('PLANET_INTRO validations', () => {
      it('should validate correct planet_intro combination', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.PLANET_INTRO,
          Planet.SUN,
        );
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject planet_intro without planet', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.PLANET_INTRO,
        );
        expect(result.valid).toBe(false);
        expect(result.error).toBe('planet_intro requires planet');
      });

      it('should reject planet_intro with extra fields', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.PLANET_INTRO,
          Planet.MOON,
          ZodiacSign.ARIES,
        );
        expect(result.valid).toBe(false);
        expect(result.error).toBe('planet_intro only needs planet');
      });
    });

    describe('PLANET_IN_SIGN validations', () => {
      it('should validate correct planet_in_sign combination', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.PLANET_IN_SIGN,
          Planet.VENUS,
          ZodiacSign.TAURUS,
        );
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject planet_in_sign without planet', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.PLANET_IN_SIGN,
          null,
          ZodiacSign.GEMINI,
        );
        expect(result.valid).toBe(false);
        expect(result.error).toBe('planet_in_sign requires planet and sign');
      });

      it('should reject planet_in_sign without sign', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.PLANET_IN_SIGN,
          Planet.MARS,
        );
        expect(result.valid).toBe(false);
        expect(result.error).toBe('planet_in_sign requires planet and sign');
      });
    });

    describe('PLANET_IN_HOUSE validations', () => {
      it('should validate correct planet_in_house combination', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.PLANET_IN_HOUSE,
          Planet.JUPITER,
          null,
          7,
        );
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject planet_in_house without planet', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.PLANET_IN_HOUSE,
          null,
          null,
          3,
        );
        expect(result.valid).toBe(false);
        expect(result.error).toBe('planet_in_house requires planet and house');
      });

      it('should reject planet_in_house without house', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.PLANET_IN_HOUSE,
          Planet.SATURN,
        );
        expect(result.valid).toBe(false);
        expect(result.error).toBe('planet_in_house requires planet and house');
      });
    });

    describe('ASPECT validations', () => {
      it('should validate correct aspect combination', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.ASPECT,
          Planet.SUN,
          null,
          null,
          AspectType.TRINE,
          Planet.MOON,
        );
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject aspect without planet', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.ASPECT,
          null,
          null,
          null,
          AspectType.OPPOSITION,
          Planet.VENUS,
        );
        expect(result.valid).toBe(false);
        expect(result.error).toBe(
          'aspect requires planet, planet2, and aspectType',
        );
      });

      it('should reject aspect without planet2', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.ASPECT,
          Planet.MERCURY,
          null,
          null,
          AspectType.SQUARE,
        );
        expect(result.valid).toBe(false);
        expect(result.error).toBe(
          'aspect requires planet, planet2, and aspectType',
        );
      });

      it('should reject aspect without aspectType', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.ASPECT,
          Planet.MARS,
          null,
          null,
          null,
          Planet.JUPITER,
        );
        expect(result.valid).toBe(false);
        expect(result.error).toBe(
          'aspect requires planet, planet2, and aspectType',
        );
      });
    });

    describe('ASCENDANT validations', () => {
      it('should validate correct ascendant combination', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.ASCENDANT,
          null,
          ZodiacSign.SCORPIO,
        );
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject ascendant without sign', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.ASCENDANT,
        );
        expect(result.valid).toBe(false);
        expect(result.error).toBe('ascendant requires sign');
      });

      it('should reject ascendant with extra fields', () => {
        const result = BirthChartInterpretation.validateCombination(
          InterpretationCategory.ASCENDANT,
          Planet.SUN,
          ZodiacSign.CAPRICORN,
        );
        expect(result.valid).toBe(false);
        expect(result.error).toBe('ascendant only needs sign');
      });
    });
  });

  describe('Entity instance', () => {
    it('should create an interpretation entity with all fields', () => {
      const interpretation = new BirthChartInterpretation();
      interpretation.id = 1;
      interpretation.category = InterpretationCategory.PLANET_IN_SIGN;
      interpretation.planet = Planet.SUN;
      interpretation.sign = ZodiacSign.LEO;
      interpretation.house = null;
      interpretation.aspectType = null;
      interpretation.planet2 = null;
      interpretation.content = 'El Sol en Leo representa...';
      interpretation.summary = 'Personalidad radiante';
      interpretation.isActive = true;

      expect(interpretation.id).toBe(1);
      expect(interpretation.category).toBe(
        InterpretationCategory.PLANET_IN_SIGN,
      );
      expect(interpretation.planet).toBe(Planet.SUN);
      expect(interpretation.sign).toBe(ZodiacSign.LEO);
      expect(interpretation.content).toContain('Sol en Leo');
      expect(interpretation.isActive).toBe(true);
    });

    it('should handle null optional fields', () => {
      const interpretation = new BirthChartInterpretation();
      interpretation.category = InterpretationCategory.PLANET_INTRO;
      interpretation.planet = Planet.MERCURY;
      interpretation.sign = null;
      interpretation.house = null;
      interpretation.aspectType = null;
      interpretation.planet2 = null;
      interpretation.summary = null;

      expect(interpretation.sign).toBeNull();
      expect(interpretation.house).toBeNull();
      expect(interpretation.aspectType).toBeNull();
      expect(interpretation.planet2).toBeNull();
      expect(interpretation.summary).toBeNull();
    });
  });
});
