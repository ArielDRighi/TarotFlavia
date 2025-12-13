/**
 * Admin Users Validation Schemas
 *
 * Schemas de validación con Zod para formularios de gestión de usuarios
 */

import { z } from 'zod';

/**
 * Schema para banear un usuario
 */
export const banUserSchema = z.object({
  reason: z
    .string()
    .min(10, 'La razón debe tener al menos 10 caracteres')
    .max(500, 'La razón no puede exceder 500 caracteres'),
});

export type BanUserForm = z.infer<typeof banUserSchema>;

/**
 * Schema para cambiar plan de usuario
 */
export const updateUserPlanSchema = z.object({
  plan: z.enum(['guest', 'free', 'premium', 'professional'], {
    errorMap: () => ({ message: 'Selecciona un plan válido' }),
  }),
});

export type UpdateUserPlanForm = z.infer<typeof updateUserPlanSchema>;

/**
 * Schema para filtros de búsqueda (validación en frontend)
 */
export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['consumer', 'tarotist', 'admin']).optional(),
  plan: z.enum(['guest', 'free', 'premium', 'professional']).optional(),
  banned: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'lastLogin', 'email', 'name']).optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type UserFiltersForm = z.infer<typeof userFiltersSchema>;
