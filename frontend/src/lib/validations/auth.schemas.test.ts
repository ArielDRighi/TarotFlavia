import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  type LoginFormData,
  type RegisterFormData,
  type ForgotPasswordFormData,
} from './auth.schemas';
import { CONFIG } from '@/lib/constants/config';

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData: LoginFormData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email inválido');
      }
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La contraseña es requerida');
      }
    });

    it('should reject missing fields', () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const validRegisterData: RegisterFormData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse(validRegisterData);
      expect(result.success).toBe(true);
    });

    it('should reject name shorter than minimum length', () => {
      const invalidData = {
        ...validRegisterData,
        name: 'AB', // Less than USERNAME_MIN_LENGTH (3)
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          `Mínimo ${CONFIG.USERNAME_MIN_LENGTH} caracteres`
        );
      }
    });

    it('should reject name longer than maximum length', () => {
      const invalidData = {
        ...validRegisterData,
        name: 'A'.repeat(CONFIG.USERNAME_MAX_LENGTH + 1),
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          `Máximo ${CONFIG.USERNAME_MAX_LENGTH} caracteres`
        );
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        ...validRegisterData,
        email: 'not-an-email',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email inválido');
      }
    });

    it('should reject password shorter than minimum length', () => {
      const invalidData = {
        ...validRegisterData,
        password: 'short',
        confirmPassword: 'short',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          `Mínimo ${CONFIG.PASSWORD_MIN_LENGTH} caracteres`
        );
      }
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        ...validRegisterData,
        password: 'password123',
        confirmPassword: 'different456',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmPasswordError = result.error.issues.find((issue) =>
          issue.path.includes('confirmPassword')
        );
        expect(confirmPasswordError?.message).toBe('Las contraseñas no coinciden');
      }
    });

    it('should accept name at minimum length boundary', () => {
      const boundaryData = {
        ...validRegisterData,
        name: 'A'.repeat(CONFIG.USERNAME_MIN_LENGTH),
      };

      const result = registerSchema.safeParse(boundaryData);
      expect(result.success).toBe(true);
    });

    it('should accept name at maximum length boundary', () => {
      const boundaryData = {
        ...validRegisterData,
        name: 'A'.repeat(CONFIG.USERNAME_MAX_LENGTH),
      };

      const result = registerSchema.safeParse(boundaryData);
      expect(result.success).toBe(true);
    });

    it('should accept password at minimum length boundary', () => {
      const boundaryData = {
        ...validRegisterData,
        password: 'A'.repeat(CONFIG.PASSWORD_MIN_LENGTH),
        confirmPassword: 'A'.repeat(CONFIG.PASSWORD_MIN_LENGTH),
      };

      const result = registerSchema.safeParse(boundaryData);
      expect(result.success).toBe(true);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const validData: ForgotPasswordFormData = {
        email: 'test@example.com',
      };

      const result = forgotPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email inválido');
      }
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
      };

      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing email field', () => {
      const result = forgotPasswordSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
