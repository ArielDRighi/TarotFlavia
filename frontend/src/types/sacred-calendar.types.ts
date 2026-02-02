import { RitualCategory } from './ritual.types';

// Enums
export enum SacredEventType {
  SABBAT = 'sabbat', // Sabbats (Rueda del Año)
  LUNAR_PHASE = 'lunar_phase', // Fases lunares especiales
  PORTAL = 'portal', // Portales energéticos
  CULTURAL = 'cultural', // Festividades culturales
  ECLIPSE = 'eclipse', // Eclipses
}

export enum ImportanceLevel {
  HIGH = 'high', // Alta energía / Muy propicio
  MEDIUM = 'medium', // Propicio
  LOW = 'low', // Nivel normal
}

// Interfaces
export interface SacredEvent {
  id: number;
  name: string;
  slug: string;
  description: string;
  eventType: SacredEventType;
  sabbat?: string | null; // Sabbat type (if applicable)
  lunarPhase?: string | null; // Lunar phase (if applicable)
  eventDate: string; // Fecha sólo (YYYY-MM-DD) enviada por el backend
  eventTime?: string | null; // Hora asociada al evento (por ejemplo, "18:30"), puede ser null
  hemisphere?: string | null; // Hemisferio (north/south)
  importance: ImportanceLevel;
  energyDescription: string;
  suggestedRitualCategories?: RitualCategory[] | null;
  suggestedRitualIds?: number[] | null;
  daysUntil?: number; // Calculado en frontend
}

export interface SacredCalendarFilters {
  eventType?: SacredEventType;
  importance?: ImportanceLevel;
  startDate?: string;
  endDate?: string;
}

// Helpers de UI
export const EVENT_TYPE_INFO: Record<
  SacredEventType,
  {
    name: string;
    icon: string;
    color: string;
  }
> = {
  [SacredEventType.SABBAT]: {
    name: 'Sabbat',
    icon: '☀️',
    color: 'text-orange-500',
  },
  [SacredEventType.LUNAR_PHASE]: {
    name: 'Fase Lunar',
    icon: '🌙',
    color: 'text-blue-400',
  },
  [SacredEventType.PORTAL]: {
    name: 'Portal',
    icon: '✨',
    color: 'text-purple-500',
  },
  [SacredEventType.CULTURAL]: {
    name: 'Cultural',
    icon: '💫',
    color: 'text-pink-500',
  },
  [SacredEventType.ECLIPSE]: {
    name: 'Eclipse',
    icon: '🌑',
    color: 'text-indigo-600',
  },
};

export const IMPORTANCE_INFO: Record<
  ImportanceLevel,
  {
    name: string;
    badge: string;
    color: string;
  }
> = {
  [ImportanceLevel.HIGH]: {
    name: 'Alta energía',
    badge: 'Alta energía',
    color: 'bg-red-100 text-red-700',
  },
  [ImportanceLevel.MEDIUM]: {
    name: 'Propicio',
    badge: 'Propicio',
    color: 'bg-amber-100 text-amber-700',
  },
  [ImportanceLevel.LOW]: {
    name: 'Normal',
    badge: 'Normal',
    color: 'bg-gray-100 text-gray-700',
  },
};
