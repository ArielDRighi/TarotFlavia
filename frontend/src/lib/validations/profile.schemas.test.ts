import { describe, it, expect } from 'vitest';
import { updateProfileSchema, updatePasswordSchema, deleteAccountSchema } from './profile.schemas';

describe('Profile Validation Schemas', () => {
  describe('updateProfileSchema', () => {
    it('should validate a valid profile update with name only', () => {
      const validData = {
        name: 'John Doe',
      };

      const result = updateProfileSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate a valid profile update with name and email', () => {
      const validData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
      };

      const result = updateProfileSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject name shorter than 3 characters', () => {
      const invalidData = {
        name: 'Jo',
      };

      const result = updateProfileSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Mínimo 3 caracteres');
      }
    });

    it('should reject name longer than 30 characters', () => {
      const invalidData = {
        name: 'A'.repeat(31),
      };

      const result = updateProfileSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Máximo 30 caracteres');
      }
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
      };

      const result = updateProfileSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Email inválido');
      }
    });

    it('should accept empty object (all fields optional)', () => {
      const emptyData = {};

      const result = updateProfileSchema.safeParse(emptyData);

      expect(result.success).toBe(true);
    });
  });

  describe('updatePasswordSchema', () => {
    it('should validate a valid password update', () => {
      const validData = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword456',
        confirmPassword: 'NewPassword456',
      };

      const result = updatePasswordSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject when current password is missing', () => {
      const invalidData = {
        newPassword: 'NewPassword456',
        confirmPassword: 'NewPassword456',
      };

      const result = updatePasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject when new password is shorter than 8 characters', () => {
      const invalidData = {
        currentPassword: 'OldPassword123',
        newPassword: 'Short1',
        confirmPassword: 'Short1',
      };

      const result = updatePasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Mínimo 8 caracteres');
      }
    });

    it('should reject when passwords do not match', () => {
      const invalidData = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword456',
        confirmPassword: 'DifferentPassword',
      };

      const result = updatePasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue: { message: string }) => issue.message === 'Las contraseñas no coinciden'
          )
        ).toBe(true);
      }
    });
  });

  describe('deleteAccountSchema', () => {
    it('should validate confirmation text exactly', () => {
      const validData = {
        confirmationText: 'ELIMINAR MI CUENTA',
      };

      const result = deleteAccountSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject when confirmation text is incorrect', () => {
      const invalidData = {
        confirmationText: 'eliminar mi cuenta',
      };

      const result = deleteAccountSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('ELIMINAR MI CUENTA');
      }
    });

    it('should reject when confirmation text is empty', () => {
      const invalidData = {
        confirmationText: '',
      };

      const result = deleteAccountSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});
