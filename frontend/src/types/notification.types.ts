/**
 * Notification Types
 * Frontend types for in-app notifications system
 */

// Enums
/**
 * Tipos de notificación.
 *
 * Los cuatro primeros son los que el backend emite hoy — la fuente de verdad es
 * `backend/tarot-app/src/modules/notifications/entities/user-notification.entity.ts`.
 * Los tres últimos están reservados para la UI y ningún productor los genera aún.
 *
 * Al agregar un tipo en el backend, agregarlo también acá y en NOTIFICATION_TYPE_INFO.
 */
export enum NotificationType {
  // Emitidos por el backend
  SACRED_EVENT = 'sacred_event', // Evento sagrado próximo
  SACRED_EVENT_REMINDER = 'sacred_event_reminder', // Recordatorio de evento sagrado
  RITUAL_REMINDER = 'ritual_reminder', // Recordatorio de ritual
  PATTERN_INSIGHT = 'pattern_insight', // Patrón detectado en la actividad
  // Reservados (sin productor todavía)
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
export interface NotificationTypeInfo {
  name: string;
  icon: string;
  color: string;
}

export const NOTIFICATION_TYPE_INFO: Record<NotificationType, NotificationTypeInfo> = {
  [NotificationType.SACRED_EVENT]: {
    name: 'Evento Sagrado',
    icon: '✨',
    color: 'text-purple-500',
  },
  [NotificationType.SACRED_EVENT_REMINDER]: {
    name: 'Recordatorio',
    icon: '🌙',
    color: 'text-indigo-500',
  },
  [NotificationType.RITUAL_REMINDER]: {
    name: 'Ritual',
    icon: '🕯️',
    color: 'text-amber-500',
  },
  [NotificationType.PATTERN_INSIGHT]: {
    name: 'Patrón',
    icon: '🔎',
    color: 'text-teal-500',
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

/** Se usa cuando el backend emite un tipo que este frontend todavía no conoce. */
const FALLBACK_NOTIFICATION_TYPE_INFO: NotificationTypeInfo = {
  name: 'Notificación',
  icon: '🔔',
  color: 'text-gray-500',
};

/**
 * Devuelve la info de UI de un tipo de notificación, siempre definida.
 *
 * El acceso directo `NOTIFICATION_TYPE_INFO[type]` devuelve `undefined` si el
 * backend emite un tipo nuevo que el frontend no tiene mapeado, y leer `.icon`
 * sobre eso rompe el render. Este helper degrada a un fallback genérico.
 */
export function getNotificationTypeInfo(type: NotificationType): NotificationTypeInfo {
  const info: NotificationTypeInfo | undefined = (
    NOTIFICATION_TYPE_INFO as Partial<Record<NotificationType, NotificationTypeInfo>>
  )[type];

  return info ?? FALLBACK_NOTIFICATION_TYPE_INFO;
}
