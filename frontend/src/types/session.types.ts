/**
 * Session Types (Scheduling & Live Readings)
 */

/**
 * Time slot availability
 * Used for displaying available booking times
 */
export interface TimeSlot {
  time: string;
  available: boolean;
}

/**
 * Session status enum
 */
export type SessionStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

/**
 * Session básica para listados
 * Coincide con GET /api/scheduling/my-sessions response
 */
export interface Session {
  id: number;
  tarotistaId: number;
  userId: number;
  date: string;
  time: string;
  duration: number;
  status: SessionStatus;
  meetLink: string | null;
}

/**
 * Detalle completo de sesión
 * Coincide con GET /api/scheduling/my-sessions/:id response
 */
export interface SessionDetail extends Session {
  tarotistaNombre: string;
  tarotistaFoto?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear una sesión (booking)
 * Coincide con POST /api/scheduling/book request body
 */
export interface BookSessionDto {
  tarotistaId: number;
  date: string;
  time: string;
  duration: number;
}
