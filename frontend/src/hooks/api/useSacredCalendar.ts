'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getUpcomingEvents,
  getTodayEvents,
  getEventsByDateRange,
  getEventById,
} from '@/lib/api/sacred-calendar-api';
import type { SacredCalendarFilters } from '@/types/sacred-calendar.types';

/**
 * Query keys for sacred calendar-related queries
 * Used for cache invalidation and refetching
 */
export const sacredCalendarKeys = {
  all: ['sacred-calendar'] as const,
  upcoming: (days?: number) => [...sacredCalendarKeys.all, 'upcoming', days] as const,
  today: () => [...sacredCalendarKeys.all, 'today'] as const,
  byDateRange: (
    startDate: string,
    endDate: string,
    filters?: Omit<SacredCalendarFilters, 'startDate' | 'endDate'>
  ) => [...sacredCalendarKeys.all, 'range', startDate, endDate, filters] as const,
  detail: (id: number) => [...sacredCalendarKeys.all, 'detail', id] as const,
};

/**
 * Hook para obtener eventos sagrados próximos
 *
 * @param days - Número de días hacia adelante (por defecto: 7)
 * @returns Query con eventos próximos
 *
 * @example
 * ```tsx
 * const { data: events } = useUpcomingEvents(14);
 * ```
 */
export function useUpcomingEvents(days: number = 7) {
  return useQuery({
    queryKey: sacredCalendarKeys.upcoming(days),
    queryFn: () => getUpcomingEvents(days),
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

/**
 * Hook para obtener eventos sagrados del día actual
 * Auto-refetch cada 30 minutos
 *
 * @returns Query con eventos de hoy
 *
 * @example
 * ```tsx
 * const { data: todayEvents } = useTodayEvents();
 * ```
 */
export function useTodayEvents() {
  return useQuery({
    queryKey: sacredCalendarKeys.today(),
    queryFn: getTodayEvents,
    staleTime: 1000 * 60 * 30, // 30 minutos
    refetchInterval: 1000 * 60 * 30, // Refetch cada 30 minutos
  });
}

/**
 * Hook para obtener eventos sagrados por rango de fechas
 *
 * @param startDate - Fecha de inicio (ISO 8601)
 * @param endDate - Fecha de fin (ISO 8601)
 * @param filters - Filtros opcionales (eventType, importance)
 * @returns Query con eventos en el rango
 *
 * @example
 * ```tsx
 * const { data: events } = useEventsByDateRange(
 *   '2026-01-01T00:00:00Z',
 *   '2026-01-31T23:59:59Z',
 *   { eventType: 'sabbat' }
 * );
 * ```
 */
export function useEventsByDateRange(
  startDate: string,
  endDate: string,
  filters?: Omit<SacredCalendarFilters, 'startDate' | 'endDate'>
) {
  return useQuery({
    queryKey: sacredCalendarKeys.byDateRange(startDate, endDate, filters),
    queryFn: () => getEventsByDateRange(startDate, endDate, filters),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (eventos no cambian frecuentemente)
  });
}

/**
 * Hook para obtener detalle de un evento sagrado por ID
 *
 * @param id - ID del evento
 * @returns Query con detalle del evento
 *
 * @example
 * ```tsx
 * const { data: event } = useSacredEvent(1);
 * ```
 */
export function useSacredEvent(id: number) {
  return useQuery({
    queryKey: sacredCalendarKeys.detail(id),
    queryFn: () => getEventById(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}
