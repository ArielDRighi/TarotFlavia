import {
  reduceToSingleDigit,
  calculateLifePath,
  calculateBirthdayNumber,
  calculateExpressionNumber,
  calculateSoulUrge,
  calculatePersonality,
  calculatePersonalYear,
  calculatePersonalMonth,
  calculateDayNumber,
  calculateAllNumbers,
} from './numerology.utils';

describe('numerology.utils', () => {
  describe('reduceToSingleDigit', () => {
    it('should reduce 29 to 11 (master number)', () => {
      expect(reduceToSingleDigit(29, true)).toBe(11);
    });

    it('should reduce 38 to 11 (master number)', () => {
      expect(reduceToSingleDigit(38, true)).toBe(11);
    });

    it('should reduce 29 to 2 when preserveMaster is false', () => {
      expect(reduceToSingleDigit(29, false)).toBe(2);
    });

    it('should reduce 22 to 22 (master number)', () => {
      expect(reduceToSingleDigit(22, true)).toBe(22);
    });

    it('should reduce 33 to 33 (master number)', () => {
      expect(reduceToSingleDigit(33, true)).toBe(33);
    });

    it('should reduce 47 to 11 (4+7=11, master)', () => {
      expect(reduceToSingleDigit(47, true)).toBe(11);
    });

    it('should reduce 99 to 9 (9+9=18, 1+8=9)', () => {
      expect(reduceToSingleDigit(99, true)).toBe(9);
    });

    it('should keep single digit as is', () => {
      expect(reduceToSingleDigit(7, true)).toBe(7);
    });

    it('should reduce 1990 correctly', () => {
      // 1+9+9+0 = 19, 1+9 = 10, 1+0 = 1
      expect(reduceToSingleDigit(1990, false)).toBe(1);
    });
  });

  describe('calculateLifePath', () => {
    it('should calculate life path for 1990-03-25 (Camino de Vida 2)', () => {
      // Año: 1990 → 1+9+9+0 = 19 → 1+9 = 10 → 1+0 = 1
      // Mes: 03 → 3
      // Día: 25 → 2+5 = 7
      // Total: 1 + 3 + 7 = 11 (maestro, no se reduce)
      const date = new Date('1990-03-25');
      expect(calculateLifePath(date)).toBe(11);
    });

    it('should calculate life path for 1992-11-29 (Master 11)', () => {
      // Año: 1992 → 1+9+9+2 = 21 → 2+1 = 3
      // Mes: 11 → 1+1 = 2
      // Día: 29 → 2+9 = 11 (maestro)
      // Total: 3 + 2 + 11 = 16 → 1+6 = 7
      const date = new Date('1992-11-29');
      expect(calculateLifePath(date)).toBe(7);
    });

    it('should calculate life path for 1985-12-25', () => {
      // Año: 1985 → 1+9+8+5 = 23 → 2+3 = 5
      // Mes: 12 → 1+2 = 3
      // Día: 25 → 2+5 = 7
      // Total: 5 + 3 + 7 = 15 → 1+5 = 6
      const date = new Date('1985-12-25');
      expect(calculateLifePath(date)).toBe(6);
    });

    it('should preserve master number 22', () => {
      // Buscar fecha que de 22
      // Año: 2000 → 2+0+0+0 = 2
      // Mes: 11 → 1+1 = 2
      // Día: 18 → 1+8 = 9
      // Total: 2 + 2 + 9 = 13 → 1+3 = 4 (no es 22)
      // Probemos: Año: 1999 → 1+9+9+9 = 28 → 2+8 = 10 → 1+0 = 1
      // Mes: 12 → 3, Día: 27 → 9, Total: 1+3+9 = 13 → 4
      // Para 22: necesitamos componentes que sumen 22
      // Año: 1984 → 22, Mes: 3, Día: 6 → 22+3+6 = 31 → 4
      // Año: 1993 → 22, Mes: 5, Día: 4 → 22+5+4 = 31 → 4
      // Año: 1993 → 22, Mes: 11 → 2, Día: 9 → 22+2+9 = 33 → 33
      // Necesitamos que sume exactamente 22
      // 1993 (22) + 11 (2) = 24, falta -2
      // Probemos: 1984 → 1+9+8+4 = 22
      // 1984-01-01 → 22 + 1 + 1 = 24 → 6
      // Difícil, dejemos este test con una fecha conocida que de 22
      // Según calculadora: 1988-04-06 da 22
      // 1988 → 26 → 8, 04 → 4, 06 → 6, Total: 8+4+6 = 18 → 9
      // Probemos: 1979-09-05
      // 1979 → 26 → 8, 09 → 9, 05 → 5, Total: 8+9+5 = 22
      const date = new Date('1979-09-05');
      expect(calculateLifePath(date)).toBe(22);
    });
  });

  describe('calculateBirthdayNumber', () => {
    it('should calculate birthday number for day 25 as 7', () => {
      const date = new Date('1990-03-25');
      expect(calculateBirthdayNumber(date)).toBe(7); // 2+5 = 7
    });

    it('should calculate birthday number for day 11 as 11 (master)', () => {
      const date = new Date('1990-03-11');
      expect(calculateBirthdayNumber(date)).toBe(11);
    });

    it('should calculate birthday number for day 22 as 22 (master)', () => {
      const date = new Date('1990-03-22');
      expect(calculateBirthdayNumber(date)).toBe(22);
    });

    it('should calculate birthday number for day 29 as 11 (master)', () => {
      const date = new Date('1990-03-29');
      expect(calculateBirthdayNumber(date)).toBe(11); // 2+9 = 11
    });

    it('should calculate birthday number for day 5 as 5', () => {
      const date = new Date('1990-03-05');
      expect(calculateBirthdayNumber(date)).toBe(5);
    });
  });

  describe('calculateExpressionNumber', () => {
    it('should calculate expression number for "JUAN"', () => {
      // J=1, U=3, A=1, N=5 → 1+3+1+5 = 10 → 1+0 = 1
      expect(calculateExpressionNumber('JUAN')).toBe(1);
    });

    it('should calculate expression number for "Juan Carlos Pérez"', () => {
      // J=1, U=3, A=1, N=5, C=3, A=1, R=9, L=3, O=6, S=1
      // P=7, E=5, R=9, E=5, Z=8
      // JUANCARLOSPEREZ (sin espacios ni acentos)
      // J=1,U=3,A=1,N=5,C=3,A=1,R=9,L=3,O=6,S=1,P=7,E=5,R=9,E=5,Z=8
      // 1+3+1+5+3+1+9+3+6+1+7+5+9+5+8 = 67 → 6+7 = 13 → 1+3 = 4
      expect(calculateExpressionNumber('Juan Carlos Pérez')).toBe(4);
    });

    it('should handle names with accents', () => {
      // "José" → JOSE (sin acento)
      // J=1, O=6, S=1, E=5 → 1+6+1+5 = 13 → 1+3 = 4
      expect(calculateExpressionNumber('José')).toBe(4);
    });

    it('should calculate expression number for vowels only "AEIOU"', () => {
      // A=1, E=5, I=9, O=6, U=3 → 1+5+9+6+3 = 24 → 2+4 = 6
      expect(calculateExpressionNumber('AEIOU')).toBe(6);
    });

    it('should handle empty name', () => {
      expect(calculateExpressionNumber('')).toBe(0);
    });

    it('should preserve master number 11', () => {
      // Necesitamos nombre que sume 11
      // "BA" → B=2, A=1 → 3 (no)
      // "KA" → K=2, A=1 → 3 (no)
      // "CA" → C=3, A=1 → 4 (no)
      // "DAI" → D=4, A=1, I=9 → 14 → 5 (no)
      // "BC" → B=2, C=3 → 5 (no)
      // "EB" → E=5, B=2 → 7 (no)
      // "FB" → F=6, B=2 → 8 (no)
      // "GB" → G=7, B=2 → 9 (no)
      // "HB" → H=8, B=2 → 10 → 1 (no)
      // "IB" → I=9, B=2 → 11 (SÍ!)
      expect(calculateExpressionNumber('IB')).toBe(11);
    });
  });

  describe('calculateSoulUrge', () => {
    it('should calculate soul urge from vowels only', () => {
      // "AEIOU" → A=1, E=5, I=9, O=6, U=3 → 24 → 6
      expect(calculateSoulUrge('AEIOU')).toBe(6);
    });

    it('should calculate soul urge for "Juan"', () => {
      // Vocales: U=3, A=1 → 4
      expect(calculateSoulUrge('Juan')).toBe(4);
    });

    it('should calculate soul urge for "Maria"', () => {
      // Vocales: A=1, I=9, A=1 → 11 (maestro)
      expect(calculateSoulUrge('Maria')).toBe(11);
    });

    it('should ignore consonants', () => {
      // "BCDFG" → no vocales → 0
      expect(calculateSoulUrge('BCDFG')).toBe(0);
    });

    it('should handle accents', () => {
      // "José" → JOSE → Vocales O=6, E=5 → 11 (maestro)
      expect(calculateSoulUrge('José')).toBe(11);
    });
  });

  describe('calculatePersonality', () => {
    it('should calculate personality from consonants only', () => {
      // "BCDFG" → B=2, C=3, D=4, F=6, G=7 → 22 (maestro)
      expect(calculatePersonality('BCDFG')).toBe(22);
    });

    it('should calculate personality for "Juan"', () => {
      // Consonantes: J=1, N=5 → 6
      expect(calculatePersonality('Juan')).toBe(6);
    });

    it('should ignore vowels', () => {
      // "AEIOU" → no consonantes → 0
      expect(calculatePersonality('AEIOU')).toBe(0);
    });

    it('should handle names with accents', () => {
      // "José" → JOSE → Consonantes J=1, S=1 → 2
      expect(calculatePersonality('José')).toBe(2);
    });

    it('should calculate personality for "Maria"', () => {
      // Consonantes: M=4, R=9 → 13 → 4
      expect(calculatePersonality('Maria')).toBe(4);
    });
  });

  describe('calculatePersonalYear', () => {
    it('should calculate personal year for current year', () => {
      const date = new Date('1990-03-25');
      const currentYear = new Date().getFullYear();
      const personalYear = calculatePersonalYear(date, currentYear);

      // El resultado depende del año actual, solo verificamos que sea 1-9
      expect(personalYear).toBeGreaterThanOrEqual(1);
      expect(personalYear).toBeLessThanOrEqual(9);
    });

    it('should calculate personal year for 1990-03-25 in 2026', () => {
      // Mes: 03 → 3
      // Día: 25 → 7
      // Año: 2026 → 2+0+2+6 = 10 → 1
      // Total: 3 + 7 + 1 = 11 → 1+1 = 2 (no preserva maestros)
      const date = new Date('1990-03-25');
      expect(calculatePersonalYear(date, 2026)).toBe(2);
    });

    it('should NOT preserve master numbers in personal year', () => {
      // Buscar combinación que de 11
      // Mes: 11 → 2, Día: 29 → 2, Año: 2026 → 1
      // Total: 2 + 2 + 1 = 5 (no es 11)
      // Año: 2024 → 8, Mes: 11 → 2, Día: 1 → 1
      // Total: 8 + 2 + 1 = 11 → debe reducirse a 2
      const date = new Date('1990-11-01');
      const result = calculatePersonalYear(date, 2024);
      // 11 → 2, Día 1 → 1, Año 2024 → 8
      // Total: 2 + 1 + 8 = 11 → 2 (se reduce)
      expect(result).toBeLessThanOrEqual(9);
    });

    it('should use current year by default', () => {
      const date = new Date('1990-03-25');
      const result1 = calculatePersonalYear(date);
      const result2 = calculatePersonalYear(date, new Date().getFullYear());

      expect(result1).toBe(result2);
    });
  });

  describe('calculatePersonalMonth', () => {
    it('should calculate personal month', () => {
      // Año personal 5 + Mes 3 = 8
      expect(calculatePersonalMonth(5, 3)).toBe(8);
    });

    it('should reduce to single digit', () => {
      // Año personal 9 + Mes 12 = 21 → 3
      expect(calculatePersonalMonth(9, 12)).toBe(3);
    });

    it('should NOT preserve master numbers', () => {
      // Año personal 2 + Mes 9 = 11 → debe reducirse a 2
      expect(calculatePersonalMonth(2, 9)).toBe(2);
    });

    it('should use current month by default', () => {
      const currentMonth = new Date().getMonth() + 1;
      const result1 = calculatePersonalMonth(5);
      const result2 = calculatePersonalMonth(5, currentMonth);

      expect(result1).toBe(result2);
    });

    it('should always return 1-9', () => {
      for (let personalYear = 1; personalYear <= 9; personalYear++) {
        for (let month = 1; month <= 12; month++) {
          const result = calculatePersonalMonth(personalYear, month);
          expect(result).toBeGreaterThanOrEqual(1);
          expect(result).toBeLessThanOrEqual(9);
        }
      }
    });
  });

  describe('calculateDayNumber', () => {
    it('should calculate day number for specific date', () => {
      // 2026-01-17 → Año: 2026 → 1, Mes: 01 → 1, Día: 17 → 8
      // Total: 1 + 1 + 8 = 10 → 1
      const date = new Date('2026-01-17');
      expect(calculateDayNumber(date)).toBe(1);
    });

    it('should NOT preserve master numbers', () => {
      // Buscar fecha que sume 11
      // 2026-01-09 → Año: 1, Mes: 1, Día: 9 → 11 → debe reducirse a 2
      const date = new Date('2026-01-09');
      expect(calculateDayNumber(date)).toBe(2);
    });

    it('should always return 1-9', () => {
      const date = new Date('2026-01-17');
      const result = calculateDayNumber(date);

      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('should use today by default', () => {
      const today = new Date();
      const result1 = calculateDayNumber();
      const result2 = calculateDayNumber(today);

      expect(result1).toBe(result2);
    });
  });

  describe('calculateAllNumbers', () => {
    it('should calculate all numbers with birth date only', () => {
      const date = new Date('1990-03-25');
      const result = calculateAllNumbers(date);

      expect(result.lifePath).toBe(11);
      expect(result.birthday).toBe(7); // 25 → 2+5 = 7
      expect(result.expression).toBeNull();
      expect(result.soulUrge).toBeNull();
      expect(result.personality).toBeNull();
      expect(result.personalYear).toBeGreaterThanOrEqual(1);
      expect(result.personalYear).toBeLessThanOrEqual(9);
      expect(result.personalMonth).toBeGreaterThanOrEqual(1);
      expect(result.personalMonth).toBeLessThanOrEqual(9);
      expect(result.isMasterNumber).toBe(true); // 11 es maestro
      expect(result.birthDate).toBe('1990-03-25');
      expect(result.fullName).toBeNull();
    });

    it('should calculate all numbers with birth date and name', () => {
      const date = new Date('1990-03-25');
      const result = calculateAllNumbers(date, 'Juan Pérez');

      expect(result.lifePath).toBe(11);
      expect(result.birthday).toBe(7);
      expect(result.expression).toBeDefined();
      expect(result.expression).not.toBeNull();
      expect(result.soulUrge).toBeDefined();
      expect(result.soulUrge).not.toBeNull();
      expect(result.personality).toBeDefined();
      expect(result.personality).not.toBeNull();
      expect(result.fullName).toBe('Juan Pérez');
    });

    it('should mark master number correctly', () => {
      const date1 = new Date('1979-09-05'); // Life path 22
      const result1 = calculateAllNumbers(date1);
      expect(result1.isMasterNumber).toBe(true);

      const date2 = new Date('1985-12-25'); // Life path 6
      const result2 = calculateAllNumbers(date2);
      expect(result2.isMasterNumber).toBe(false);
    });

    it('should format birth date as ISO string', () => {
      const date = new Date('1990-03-25');
      const result = calculateAllNumbers(date);

      expect(result.birthDate).toBe('1990-03-25');
    });
  });
});
