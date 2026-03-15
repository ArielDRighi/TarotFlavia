/**
 * Scheduling Admin Types
 *
 * Types for the admin scheduling management panel (T-SF-M03)
 */

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum ExceptionType {
  BLOCKED = 'blocked',
  CUSTOM_HOURS = 'custom_hours',
}

export interface TarotistAvailability {
  id: number;
  tarotistaId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TarotistException {
  id: number;
  tarotistaId: number;
  exceptionDate: string;
  exceptionType: ExceptionType;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  createdAt: string;
}

export interface SetWeeklyAvailabilityDto {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface AddExceptionDto {
  exceptionDate: string;
  exceptionType: ExceptionType;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export const DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.SUNDAY]: 'Domingo',
  [DayOfWeek.MONDAY]: 'Lunes',
  [DayOfWeek.TUESDAY]: 'Martes',
  [DayOfWeek.WEDNESDAY]: 'Miércoles',
  [DayOfWeek.THURSDAY]: 'Jueves',
  [DayOfWeek.FRIDAY]: 'Viernes',
  [DayOfWeek.SATURDAY]: 'Sábado',
};
