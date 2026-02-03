/**
 * Notification Types
 * Frontend types for in-app notifications system
 */

// Enums
export enum NotificationType {
  SACRED_EVENT = 'sacred_event', // Evento sagrado próximo
  RITUAL_REMINDER = 'ritual_reminder', // Recordatorio de ritual
  READING_SHARED = 'reading_shared', // Lectura compartida contigo
  SYSTEM = 'system', // Notificación del sistema
  PROMOTION = 'promotion', // Promoción o anuncio
}

// Interfaces
export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  actionUrl?: string | null;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}

// Helpers de UI
export const NOTIFICATION_TYPE_INFO: Record<
  NotificationType,
  {
    name: string;
    icon: string;
    color: string;
  }
> = {
  [NotificationType.SACRED_EVENT]: {
    name: 'Evento Sagrado',
    icon: '✨',
    color: 'text-purple-500',
  },
  [NotificationType.RITUAL_REMINDER]: {
    name: 'Ritual',
    icon: '🕯️',
    color: 'text-amber-500',
  },
  [NotificationType.READING_SHARED]: {
    name: 'Lectura',
    icon: '🔮',
    color: 'text-blue-500',
  },
  [NotificationType.SYSTEM]: {
    name: 'Sistema',
    icon: '⚙️',
    color: 'text-gray-500',
  },
  [NotificationType.PROMOTION]: {
    name: 'Promoción',
    icon: '🎁',
    color: 'text-pink-500',
  },
};
