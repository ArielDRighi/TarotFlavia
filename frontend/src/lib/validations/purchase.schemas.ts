/**
 * Purchase Validation Schemas
 *
 * Zod schemas for purchase-related forms.
 */

import { z } from 'zod';

/**
 * Schema for creating a purchase (user confirms service selection)
 */
export const createPurchaseSchema = z.object({
  holisticServiceId: z
    .number({ invalid_type_error: 'Debes seleccionar un servicio' })
    .int('El ID del servicio debe ser un número entero')
    .positive('Debes seleccionar un servicio válido'),
});

export type CreatePurchaseForm = z.infer<typeof createPurchaseSchema>;

/**
 * Schema for approving a payment (admin form)
 */
export const approvePurchaseSchema = z.object({
  paymentReference: z
    .string()
    .max(255, 'La referencia de pago no puede exceder 255 caracteres')
    .optional(),
});

export type ApprovePurchaseForm = z.infer<typeof approvePurchaseSchema>;
