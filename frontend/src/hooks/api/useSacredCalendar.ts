import { useQuery } from '@tanstack/react-query';
import { getUpcomingEvents, getTodayEvents, getMonthEvents } from '@/lib/api/sacred-calendar-api';

/**
 * Query keys para Sacred Calendar
 */
export const sacredCalendarKeys = {
  all: ['sacred-calendar'] as const,
  upcoming: (days?: number) => [...sacredCalendarKeys.all, 'upcoming', days] as const,
  today: () => [...sacredCalendarKeys.all, 'today'] as const,
  month: (year: number, month: number) =>
    [...sacredCalendarKeys.all, 'month', year, month] as const,
};

/**
 * Hook para obtener eventos sagrados próximos
 *
 * @param days - Número de días hacia adelante (default: 30)
 * @returns Query con eventos próximos (limitado a 3 para usuarios free)
 *
 * @example
 * ```tsx
 * const { data: events } = useUpcomingEvents(30);
 * ```
 */
export function useUpcomingEvents(days?: number) {
  return useQuery({
    queryKey: sacredCalendarKeys.upcoming(days),
    queryFn: () => getUpcomingEvents(days),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (eventos no cambian frecuentemente)
  });
}

/**
 * Hook para obtener eventos sagrados del día actual
 *
 * @returns Query con eventos del día de hoy
 *
 * @example
 * ```tsx
 * const { data: todayEvents } = useTodayEvents();
 * ```
 */
export function useTodayEvents() {
  return useQuery({
    queryKey: sacredCalendarKeys.today(),
    queryFn: () => getTodayEvents(),
    staleTime: 1000 * 60 * 60, // 1 hora (más corto que upcoming porque cambia cada día)
  });
}

/**
 * Hook para obtener eventos de un mes específico (Premium only)
 *
 * @param year - Año
 * @param month - Mes (1-12)
 * @returns Query con eventos del mes
 *
 * @example
 * ```tsx
 * const { data: monthEvents } = useMonthEvents(2025, 1);
 * ```
 */
export function useMonthEvents(year: number, month: number) {
  return useQuery({
    queryKey: sacredCalendarKeys.month(year, month),
    queryFn: () => getMonthEvents(year, month),
    enabled: !!year && !!month && month >= 1 && month <= 12,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}
