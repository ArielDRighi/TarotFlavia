import { describe, it, expect } from 'vitest';
import {
  SpreadType,
  createReadingSchema,
  updateReadingSchema,
  type SpreadTypeValue,
  type CreateReadingFormData,
} from './reading.schemas';
import { CONFIG } from '@/lib/constants/config';

describe('Reading Validation Schemas', () => {
  describe('SpreadType enum', () => {
    it('should have SIMPLE type', () => {
      expect(SpreadType.SIMPLE).toBe('SIMPLE');
    });

    it('should have THREE_CARDS type', () => {
      expect(SpreadType.THREE_CARDS).toBe('THREE_CARDS');
    });

    it('should have CELTIC_CROSS type', () => {
      expect(SpreadType.CELTIC_CROSS).toBe('CELTIC_CROSS');
    });

    it('should have exactly 3 spread types', () => {
      const spreadTypes = Object.values(SpreadType);
      expect(spreadTypes).toHaveLength(3);
    });

    it('SpreadTypeValue should accept valid spread types', () => {
      // Type-level test - if this compiles, it works
      const validTypes: SpreadTypeValue[] = ['SIMPLE', 'THREE_CARDS', 'CELTIC_CROSS'];
      expect(validTypes).toHaveLength(3);
    });
  });

  describe('createReadingSchema', () => {
    const validReadingData: CreateReadingFormData = {
      question: '¿Qué me espera en el amor este mes?',
      spreadType: 'SIMPLE',
      isPrivate: true,
    };

    it('should validate correct reading data', () => {
      const result = createReadingSchema.safeParse(validReadingData);
      expect(result.success).toBe(true);
    });

    it('should apply default value for isPrivate', () => {
      const dataWithoutPrivate = {
        question: '¿Qué me espera en el amor este mes?',
        spreadType: 'SIMPLE',
      };

      const result = createReadingSchema.safeParse(dataWithoutPrivate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isPrivate).toBe(true);
      }
    });

    it('should reject question shorter than minimum length', () => {
      const invalidData = {
        ...validReadingData,
        question: 'Short', // Less than MIN_QUESTION_LENGTH (10)
      };

      const result = createReadingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          `Mínimo ${CONFIG.MIN_QUESTION_LENGTH} caracteres`
        );
      }
    });

    it('should reject question longer than maximum length', () => {
      const invalidData = {
        ...validReadingData,
        question: 'A'.repeat(CONFIG.MAX_QUESTION_LENGTH + 1),
      };

      const result = createReadingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          `Máximo ${CONFIG.MAX_QUESTION_LENGTH} caracteres`
        );
      }
    });

    it('should accept question at minimum length boundary', () => {
      const boundaryData = {
        ...validReadingData,
        question: 'A'.repeat(CONFIG.MIN_QUESTION_LENGTH),
      };

      const result = createReadingSchema.safeParse(boundaryData);
      expect(result.success).toBe(true);
    });

    it('should accept question at maximum length boundary', () => {
      const boundaryData = {
        ...validReadingData,
        question: 'A'.repeat(CONFIG.MAX_QUESTION_LENGTH),
      };

      const result = createReadingSchema.safeParse(boundaryData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid spread type', () => {
      const invalidData = {
        ...validReadingData,
        spreadType: 'INVALID_TYPE',
      };

      const result = createReadingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept all valid spread types', () => {
      const spreadTypes: SpreadTypeValue[] = ['SIMPLE', 'THREE_CARDS', 'CELTIC_CROSS'];

      spreadTypes.forEach((spreadType) => {
        const data = { ...validReadingData, spreadType };
        const result = createReadingSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should accept isPrivate as false', () => {
      const publicReading = {
        ...validReadingData,
        isPrivate: false,
      };

      const result = createReadingSchema.safeParse(publicReading);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isPrivate).toBe(false);
      }
    });

    it('should reject missing required fields', () => {
      const result = createReadingSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject empty question', () => {
      const invalidData = {
        ...validReadingData,
        question: '',
      };

      const result = createReadingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateReadingSchema', () => {
    it('should allow partial updates', () => {
      const partialData = {
        question: '¿Nueva pregunta actualizada?',
      };

      const result = updateReadingSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('should allow empty object (no fields to update)', () => {
      const result = updateReadingSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should still validate question length when provided', () => {
      const invalidData = {
        question: 'Short',
      };

      const result = updateReadingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should still validate spread type when provided', () => {
      const invalidData = {
        spreadType: 'INVALID_TYPE',
      };

      const result = updateReadingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow updating only isPrivate', () => {
      const result = updateReadingSchema.safeParse({ isPrivate: false });
      expect(result.success).toBe(true);
    });

    it('should allow updating only spreadType', () => {
      const result = updateReadingSchema.safeParse({ spreadType: 'CELTIC_CROSS' });
      expect(result.success).toBe(true);
    });
  });
});
