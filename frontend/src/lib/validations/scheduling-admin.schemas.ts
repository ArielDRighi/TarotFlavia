/**
 * Scheduling Admin Validation Schemas
 *
 * Zod schemas for admin scheduling forms (T-SF-M03).
 */
import { z } from 'zod';
import { DayOfWeek, ExceptionType } from '@/types';

// ============================================================================
// Set Weekly Availability
// ============================================================================

/** HH:MM format (24h) — aligned with backend @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/) */
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'El horario debe tener formato HH:MM (00-23:00-59)');

export const setWeeklyAvailabilitySchema = z
  .object({
    dayOfWeek: z.nativeEnum(DayOfWeek, {
      errorMap: () => ({ message: 'Selecciona un día válido' }),
    }),
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'La hora de inicio debe ser anterior a la hora de fin',
    path: ['endTime'],
  });

export type SetWeeklyAvailabilityForm = z.infer<typeof setWeeklyAvailabilitySchema>;

// ============================================================================
// Add Blocked Date / Exception
// ============================================================================

export const addBlockedDateSchema = z
  .object({
    exceptionDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: 'La fecha no es válida',
      }),
    exceptionType: z.nativeEnum(ExceptionType, {
      errorMap: () => ({ message: 'Selecciona un tipo válido' }),
    }),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    reason: z.string().max(500, 'El motivo no puede superar 500 caracteres').optional(),
  })
  .refine(
    (data) => {
      // For custom_hours type both times are required and start < end
      if (data.exceptionType === ExceptionType.CUSTOM_HOURS) {
        if (!data.startTime || !data.endTime) return false;
        return data.startTime < data.endTime;
      }
      return true;
    },
    {
      message: 'Para horario personalizado debes indicar hora de inicio y fin (inicio < fin)',
      path: ['startTime'],
    }
  );

export type AddBlockedDateForm = z.infer<typeof addBlockedDateSchema>;
