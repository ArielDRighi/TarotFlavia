/**
 * Session Types (Scheduling & Live Readings)
 */

/**
 * Time slot availability
 * Coincide con backend AvailableSlotDto
 */
export interface TimeSlot {
  date: string;
  time: string;
  durationMinutes: number;
  available: boolean;
}

/**
 * Session type enum
 * DEBE coincidir exactamente con backend SessionType enum
 */
export type SessionType =
  | 'TAROT_READING'
  | 'ENERGY_CLEANING'
  | 'HEBREW_PENDULUM'
  | 'CONSULTATION'
  | 'FAMILY_TREE';

/**
 * Payment status enum
 * DEBE coincidir exactamente con backend PaymentStatus enum
 */
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

/**
 * Session status enum
 * DEBE coincidir exactamente con backend SessionStatus enum
 */
export type SessionStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled_by_user'
  | 'cancelled_by_tarotist';

/**
 * Session básica para listados
 * Coincide con backend SessionResponseDto
 */
export interface Session {
  id: number;
  tarotistaId: number;
  userId: number;
  sessionDate: string;
  sessionTime: string;
  durationMinutes: number;
  sessionType: SessionType;
  status: SessionStatus;
  priceUsd: number;
  paymentStatus: PaymentStatus;
  googleMeetLink: string;
  userEmail: string;
  userNotes?: string;
  tarotistNotes?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

/**
 * Resumen de tarotista para detalles de sesión
 * Usado en propiedad anidada de SessionDetail
 */
export interface TarotistaSummary {
  id: number;
  nombre: string;
  foto?: string;
}

/**
 * Detalle completo de sesión
 * Coincide con GET /api/scheduling/my-sessions/:id response
 * (Nota: Backend podría retornar Session + relación populate con tarotista)
 */
export interface SessionDetail extends Session {
  tarotista?: TarotistaSummary;
}

/**
 * DTO para crear una sesión (booking)
 * Coincide con POST /api/scheduling/sessions request body (backend BookSessionDto)
 */
export interface BookSessionDto {
  tarotistaId: number;
  sessionDate: string;
  sessionTime: string;
  durationMinutes: number;
  sessionType: SessionType;
  userNotes?: string;
}

/**
 * DTO para cancelar una sesión
 * Coincide con POST /api/scheduling/sessions/:id/cancel request body (backend CancelSessionDto)
 */
export interface CancelSessionDto {
  reason: string;
}
