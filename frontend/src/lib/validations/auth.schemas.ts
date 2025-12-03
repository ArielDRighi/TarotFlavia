/**
 * Zod Validation Schemas for Authentication
 */
import { z } from "zod";
import { CONFIG } from "@/lib/constants/config";

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
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
    email: z.string().email("Email inválido"),
    password: z.string().min(CONFIG.PASSWORD_MIN_LENGTH, `Mínimo ${CONFIG.PASSWORD_MIN_LENGTH} caracteres`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
