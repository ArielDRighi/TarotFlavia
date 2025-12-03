/**
 * Zod Validation Schemas for Readings
 */
import { z } from "zod";
import { CONFIG } from "@/lib/constants/config";

/**
 * Spread types enum
 */
export const SpreadType = {
  SIMPLE: "SIMPLE",
  THREE_CARDS: "THREE_CARDS",
  CELTIC_CROSS: "CELTIC_CROSS",
} as const;

export type SpreadTypeValue = (typeof SpreadType)[keyof typeof SpreadType];

/**
 * Create reading form schema
 */
export const createReadingSchema = z.object({
  question: z
    .string()
    .min(CONFIG.MIN_QUESTION_LENGTH, `Mínimo ${CONFIG.MIN_QUESTION_LENGTH} caracteres`)
    .max(CONFIG.MAX_QUESTION_LENGTH, `Máximo ${CONFIG.MAX_QUESTION_LENGTH} caracteres`),
  spreadType: z.enum([SpreadType.SIMPLE, SpreadType.THREE_CARDS, SpreadType.CELTIC_CROSS]),
  isPrivate: z.boolean().default(true),
});

export type CreateReadingFormData = z.infer<typeof createReadingSchema>;

/**
 * Update reading schema
 */
export const updateReadingSchema = createReadingSchema.partial();

export type UpdateReadingFormData = z.infer<typeof updateReadingSchema>;
