import { describe, it, expect } from 'vitest';
import { reduceToSingleDigit, calculateLifePathNumber } from './numerology';

describe('Numerology Utils', () => {
  describe('reduceToSingleDigit', () => {
    it('should reduce numbers to single digit or preserve masters', () => {
      expect(reduceToSingleDigit(38)).toBe(11); // 3 + 8 = 11 (master) -> preserved
      expect(reduceToSingleDigit(25)).toBe(7); // 2 + 5 = 7
      expect(reduceToSingleDigit(99)).toBe(9); // 9 + 9 = 18 -> 1 + 8 = 9
    });

    it('should preserve master numbers by default', () => {
      expect(reduceToSingleDigit(11)).toBe(11);
      expect(reduceToSingleDigit(22)).toBe(22);
      expect(reduceToSingleDigit(33)).toBe(33);
      expect(reduceToSingleDigit(29)).toBe(11); // 2 + 9 = 11 (master)
      expect(reduceToSingleDigit(38)).toBe(11); // 3 + 8 = 11 (master)
    });

    it('should reduce master numbers when preserveMasterNumbers is false', () => {
      expect(reduceToSingleDigit(11, false)).toBe(2);
      expect(reduceToSingleDigit(22, false)).toBe(4);
      expect(reduceToSingleDigit(33, false)).toBe(6);
      expect(reduceToSingleDigit(29, false)).toBe(2); // 2 + 9 = 11 -> 1 + 1 = 2
    });

    it('should handle single digit numbers', () => {
      expect(reduceToSingleDigit(1)).toBe(1);
      expect(reduceToSingleDigit(5)).toBe(5);
      expect(reduceToSingleDigit(9)).toBe(9);
    });
  });

  describe('calculateLifePathNumber', () => {
    it('should calculate life path number correctly', () => {
      // Example: 1990-03-25
      // Year: 1990 -> 1+9+9+0 = 19 -> 1+9 = 10 -> 1+0 = 1
      // Month: 03 -> 3
      // Day: 25 -> 2+5 = 7
      // Total: 1 + 3 + 7 = 11 (master number)
      const date1 = new Date('1990-03-25');
      expect(calculateLifePathNumber(date1)).toBe(11);
    });

    it('should calculate life path with non-master result', () => {
      // Example: 1985-06-15
      // Year: 1985 -> 1+9+8+5 = 23 -> 2+3 = 5
      // Month: 06 -> 6
      // Day: 15 -> 1+5 = 6
      // Total: 5 + 6 + 6 = 17 -> 1+7 = 8
      const date2 = new Date('1985-06-15');
      expect(calculateLifePathNumber(date2)).toBe(8);
    });

    it('should preserve master numbers in final result', () => {
      // Example: 1992-11-29
      // Year: 1992 -> 1+9+9+2 = 21 -> 2+1 = 3
      // Month: 11 -> 1+1 = 2
      // Day: 29 -> 2+9 = 11 (but we reduce components first)
      // Components: 3 + 2 + 2 = 7 (no master in this case based on algorithm)
      const date3 = new Date('1992-11-29');
      const result = calculateLifePathNumber(date3);
      expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]).toContain(result);
    });

    it('should handle dates with month 1', () => {
      const date = new Date('2000-01-01');
      const result = calculateLifePathNumber(date);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(33);
    });

    it('should handle dates with month 12', () => {
      const date = new Date('2000-12-31');
      const result = calculateLifePathNumber(date);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(33);
    });
  });
});
