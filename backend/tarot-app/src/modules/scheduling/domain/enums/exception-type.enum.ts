/**
 * Exception type for tarotist availability
 * - BLOCKED: Day is completely unavailable
 * - CUSTOM_HOURS: Day has different hours than weekly schedule
 */
export enum ExceptionType {
  BLOCKED = 'blocked',
  CUSTOM_HOURS = 'custom_hours',
}
