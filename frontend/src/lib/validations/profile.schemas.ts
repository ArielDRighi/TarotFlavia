/**
 * Zod Validation Schemas for Profile Management
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
 * Schema for updating user profile (name, email, birthDate)
 * All fields are optional
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(CONFIG.USERNAME_MIN_LENGTH, `Mínimo ${CONFIG.USERNAME_MIN_LENGTH} caracteres`)
    .max(CONFIG.USERNAME_MAX_LENGTH, `Máximo ${CONFIG.USERNAME_MAX_LENGTH} caracteres`)
    .optional(),
  email: z.string().email('Email inválido').optional(),
  birthDate: birthDateSchema.nullable().optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

/**
 * Schema for updating user password
 * Requires current password and new password confirmation
 */
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(CONFIG.PASSWORD_MIN_LENGTH, `Mínimo ${CONFIG.PASSWORD_MIN_LENGTH} caracteres`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

/**
 * Schema for account deletion confirmation
 * Requires exact text match for safety
 */
export const deleteAccountSchema = z
  .object({
    confirmationText: z.string().min(1, 'Debes escribir el texto de confirmación'),
  })
  .refine((data) => data.confirmationText === 'ELIMINAR MI CUENTA', {
    message: 'Debes escribir exactamente: ELIMINAR MI CUENTA',
    path: ['confirmationText'],
  });

export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;
