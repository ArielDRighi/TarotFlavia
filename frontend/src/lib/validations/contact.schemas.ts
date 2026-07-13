/**
 * Zod Validation Schemas for Contact Form
 */
import { z } from 'zod';

/**
 * Contact form schema
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z.string().email('Email inválido'),
  subject: z
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(200, 'El asunto no puede exceder 200 caracteres')
    // El asunto viaja a una cabecera del email; el backend rechaza los saltos de línea
    // (inyección de cabeceras). Espejarlo acá evita un 400 que el usuario no entendería.
    .regex(/^[^\r\n]+$/, 'El asunto no puede contener saltos de línea'),
  message: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(2000, 'El mensaje no puede exceder 2000 caracteres'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
