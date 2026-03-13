/**
 * Holistic Service Validation Schemas (Admin)
 *
 * Zod schemas for admin forms: create and update holistic services.
 */

import { z } from 'zod';

/**
 * Valid session types for holistic services
 */
const holisticSessionTypeSchema = z.enum(['FAMILY_TREE', 'ENERGY_CLEANING', 'HEBREW_PENDULUM'], {
  errorMap: () => ({ message: 'Tipo de sesión no válido' }),
});

/**
 * Schema for creating a holistic service (admin form)
 */
export const createHolisticServiceSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(100, 'El slug no puede exceder 100 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  shortDescription: z
    .string()
    .min(10, 'La descripción corta debe tener al menos 10 caracteres')
    .max(250, 'La descripción corta no puede exceder 250 caracteres'),
  longDescription: z
    .string()
    .min(20, 'La descripción larga debe tener al menos 20 caracteres')
    .max(5000, 'La descripción larga no puede exceder 5000 caracteres'),
  priceArs: z
    .number({ invalid_type_error: 'El precio debe ser un número' })
    .int('El precio debe ser un número entero')
    .positive('El precio debe ser mayor a 0'),
  durationMinutes: z
    .number({ invalid_type_error: 'La duración debe ser un número' })
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser mayor a 0')
    .max(480, 'La duración no puede exceder 480 minutos'),
  sessionType: holisticSessionTypeSchema,
  whatsappNumber: z
    .string()
    .min(10, 'El número de WhatsApp debe tener al menos 10 caracteres')
    .max(20, 'El número de WhatsApp no puede exceder 20 caracteres'),
  mercadoPagoLink: z
    .string()
    .url('El link de MercadoPago debe ser una URL válida')
    .max(500, 'El link de MercadoPago no puede exceder 500 caracteres'),
  imageUrl: z.string().url('La imagen debe ser una URL válida').optional().or(z.literal('')),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateHolisticServiceForm = z.infer<typeof createHolisticServiceSchema>;

/**
 * Schema for updating a holistic service (all fields optional)
 */
export const updateHolisticServiceSchema = createHolisticServiceSchema.partial();

export type UpdateHolisticServiceForm = z.infer<typeof updateHolisticServiceSchema>;
