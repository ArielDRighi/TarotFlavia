/**
 * Zod Validation Schemas for Authentication
 */
import { z } from 'zod';
import { CONFIG } from '@/lib/constants/config';

/**
 * Helper to validate birthDate string
 * - Checks YYYY-MM-DD format
 * - Validates the date is real (not 2025-02-30)
 * - Validates the date is not in the future
 */
const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)')
  .refine(
    (val) => {
      const date = new Date(val);
      // Check if date is valid (not NaN and matches input)
      return !isNaN(date.getTime()) && date.toISOString().startsWith(val);
    },
    { message: 'Fecha inválida' }
  )
  .refine(
    (val) => {
      const date = new Date(val);
      return date <= new Date();
    },
    { message: 'La fecha no puede ser futura' }
  )
  .or(z.literal(''));

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Register form schema
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(CONFIG.USERNAME_MIN_LENGTH, `Mínimo ${CONFIG.USERNAME_MIN_LENGTH} caracteres`)
      .max(CONFIG.USERNAME_MAX_LENGTH, `Máximo ${CONFIG.USERNAME_MAX_LENGTH} caracteres`),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(CONFIG.PASSWORD_MIN_LENGTH, `Mínimo ${CONFIG.PASSWORD_MIN_LENGTH} caracteres`),
    confirmPassword: z.string(),
    birthDate: birthDateSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Forgot password form schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
