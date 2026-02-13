/**
 * Schema de validación para el formulario de datos de nacimiento
 */

import { z } from 'zod';

export const birthDataSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .refine((date) => {
      const parsed = new Date(date);
      const now = new Date();
      return parsed <= now;
    }, 'La fecha no puede ser futura')
    .refine((date) => {
      const parsed = new Date(date);
      return parsed.getFullYear() >= 1900;
    }, 'La fecha debe ser posterior a 1900'),

  birthTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:mm)'),

  birthPlace: z.string().min(1, 'Selecciona un lugar de nacimiento'),

  latitude: z.number().min(-90, 'Latitud inválida').max(90, 'Latitud inválida'),

  longitude: z.number().min(-180, 'Longitud inválida').max(180, 'Longitud inválida'),

  timezone: z.string().min(1, 'Zona horaria requerida'),
});

export type BirthDataFormValues = z.infer<typeof birthDataSchema>;
