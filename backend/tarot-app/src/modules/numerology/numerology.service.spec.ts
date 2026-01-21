import { Test, TestingModule } from '@nestjs/testing';
import { NumerologyService } from './numerology.service';
import { CalculateNumerologyDto } from './dto/calculate-numerology.dto';

describe('NumerologyService', () => {
  let service: NumerologyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NumerologyService],
    }).compile();

    service = module.get<NumerologyService>(NumerologyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculate', () => {
    it('should calculate numerology with only birthDate', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: '1990-03-25',
      };

      const result = service.calculate(dto);

      expect(result).toBeDefined();
      expect(result.birthDate).toBe('1990-03-25');
      expect(result.lifePath).toBeDefined();
      expect(result.lifePath.value).toBeGreaterThanOrEqual(1);
      expect(result.lifePath.value).toBeLessThanOrEqual(33);
      expect(result.birthday).toBeDefined();
      expect(result.personalYear).toBeGreaterThanOrEqual(1);
      expect(result.personalYear).toBeLessThanOrEqual(9);
      expect(result.personalMonth).toBeGreaterThanOrEqual(1);
      expect(result.personalMonth).toBeLessThanOrEqual(9);
      // Sin nombre, estos deben ser null
      expect(result.expression).toBeNull();
      expect(result.soulUrge).toBeNull();
      expect(result.personality).toBeNull();
      expect(result.fullName).toBeNull();
    });

    it('should calculate numerology with birthDate and fullName', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: '1990-03-25',
        fullName: 'Juan Carlos Pérez',
      };

      const result = service.calculate(dto);

      expect(result).toBeDefined();
      expect(result.birthDate).toBe('1990-03-25');
      expect(result.fullName).toBe('Juan Carlos Pérez');
      expect(result.lifePath).toBeDefined();
      expect(result.birthday).toBeDefined();
      // Con nombre, estos NO deben ser null
      expect(result.expression).toBeDefined();
      expect(result.expression).not.toBeNull();
      expect(result.soulUrge).toBeDefined();
      expect(result.soulUrge).not.toBeNull();
      expect(result.personality).toBeDefined();
      expect(result.personality).not.toBeNull();
    });

    it('should detect master numbers correctly', () => {
      // 1991-11-07 debe dar Life Path 11 (maestro)
      const dto: CalculateNumerologyDto = {
        birthDate: '1991-11-07',
      };

      const result = service.calculate(dto);

      expect(result.lifePath.value).toBe(11);
      expect(result.lifePath.isMaster).toBe(true);
      expect(result.lifePath.name).toContain('Visionario');
    });

    it('should include interpretations in number details', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: '1990-03-25',
      };

      const result = service.calculate(dto);

      expect(result.lifePath.name).toBeDefined();
      expect(result.lifePath.name).not.toBe('');
      expect(result.lifePath.keywords).toBeDefined();
      expect(result.lifePath.keywords.length).toBeGreaterThan(0);
      expect(result.lifePath.description).toBeDefined();
      expect(result.lifePath.description).not.toBe('');
    });

    it('should handle dates with different Life Path numbers', () => {
      const testCases = [
        { birthDate: '1990-01-01', expectedRange: [1, 33] },
        { birthDate: '1985-05-15', expectedRange: [1, 33] },
        { birthDate: '2000-12-31', expectedRange: [1, 33] },
      ];

      testCases.forEach((testCase) => {
        const dto: CalculateNumerologyDto = {
          birthDate: testCase.birthDate,
        };

        const result = service.calculate(dto);

        expect(result.lifePath.value).toBeGreaterThanOrEqual(
          testCase.expectedRange[0],
        );
        expect(result.lifePath.value).toBeLessThanOrEqual(
          testCase.expectedRange[1],
        );
        // Verificar que solo sean números válidos (1-9, 11, 22, 33)
        const validNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
        expect(validNumbers).toContain(result.lifePath.value);
      });
    });
  });

  describe('getInterpretation', () => {
    it('should return interpretation for valid number', () => {
      const interpretation = service.getInterpretation(7);

      expect(interpretation).toBeDefined();
      expect(interpretation).not.toBeNull();
      if (interpretation) {
        expect(interpretation.number).toBe(7);
        expect(interpretation.name).toBeDefined();
        expect(interpretation.keywords).toBeDefined();
        expect(interpretation.description).toBeDefined();
      }
    });

    it('should return interpretation for master numbers', () => {
      const masterNumbers = [11, 22, 33];

      masterNumbers.forEach((num) => {
        const interpretation = service.getInterpretation(num);

        expect(interpretation).toBeDefined();
        expect(interpretation).not.toBeNull();
        if (interpretation) {
          expect(interpretation.number).toBe(num);
          expect(interpretation.isMaster).toBe(true);
        }
      });
    });

    it('should return null for invalid number', () => {
      const interpretation = service.getInterpretation(99);

      expect(interpretation).toBeNull();
    });

    it('should return interpretation for all valid numbers (1-9)', () => {
      for (let i = 1; i <= 9; i++) {
        const interpretation = service.getInterpretation(i);

        expect(interpretation).toBeDefined();
        expect(interpretation).not.toBeNull();
        if (interpretation) {
          expect(interpretation.number).toBe(i);
          expect(interpretation.isMaster).toBe(false);
        }
      }
    });
  });

  describe('getCompatibility', () => {
    it('should return compatibility for valid number pair', () => {
      const compatibility = service.getCompatibility(1, 2);

      expect(compatibility).toBeDefined();
      expect(compatibility).not.toBeNull();
      if (compatibility) {
        expect(compatibility.numbers).toContain(1);
        expect(compatibility.numbers).toContain(2);
        expect(compatibility.level).toBeDefined();
        expect(compatibility.description).toBeDefined();
        expect(compatibility.strengths).toBeDefined();
        expect(compatibility.challenges).toBeDefined();
      }
    });

    it('should return same compatibility regardless of order', () => {
      const compatibility1 = service.getCompatibility(1, 2);
      const compatibility2 = service.getCompatibility(2, 1);

      // Debe ser la misma compatibilidad
      if (compatibility1 && compatibility2) {
        expect(compatibility1.level).toBe(compatibility2.level);
        expect(compatibility1.description).toBe(compatibility2.description);
      }
    });

    it('should return null for non-existent compatibility pair', () => {
      // Asumiendo que no hay compatibilidad para todos los pares
      const compatibility = service.getCompatibility(99, 88);

      expect(compatibility).toBeNull();
    });
  });

  describe('getNumberDetail (private method behavior)', () => {
    it('should create number detail with correct structure', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: '1990-03-25',
      };

      const result = service.calculate(dto);

      // Verificar estructura de NumberDetailDto
      expect(result.lifePath).toHaveProperty('value');
      expect(result.lifePath).toHaveProperty('name');
      expect(result.lifePath).toHaveProperty('keywords');
      expect(result.lifePath).toHaveProperty('description');
      expect(result.lifePath).toHaveProperty('isMaster');

      // Verificar tipos
      expect(typeof result.lifePath.value).toBe('number');
      expect(typeof result.lifePath.name).toBe('string');
      expect(Array.isArray(result.lifePath.keywords)).toBe(true);
      expect(typeof result.lifePath.description).toBe('string');
      expect(typeof result.lifePath.isMaster).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('should handle leap year dates correctly', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: '2000-02-29',
      };

      const result = service.calculate(dto);

      expect(result).toBeDefined();
      expect(result.birthDate).toBe('2000-02-29');
      expect(result.birthday.value).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty string for fullName', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: '1990-03-25',
        fullName: '',
      };

      const result = service.calculate(dto);

      // Empty string debe tratarse como sin nombre
      expect(result.expression).toBeNull();
      expect(result.soulUrge).toBeNull();
      expect(result.personality).toBeNull();
    });

    it('should handle names with special characters and accents', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: '1990-03-25',
        fullName: 'José María García-López',
      };

      const result = service.calculate(dto);

      expect(result).toBeDefined();
      expect(result.expression).toBeDefined();
      expect(result.expression).not.toBeNull();
    });

    it('should calculate personal year correctly for current year', () => {
      const dto: CalculateNumerologyDto = {
        birthDate: `1990-03-25`,
      };

      const result = service.calculate(dto);

      // Personal year debe estar entre 1-9
      expect(result.personalYear).toBeGreaterThanOrEqual(1);
      expect(result.personalYear).toBeLessThanOrEqual(9);
    });
  });
});
