import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { SacredEvent, SacredCalendarFilters } from '@/types/sacred-calendar.types';

/**
 * Obtener eventos sagrados próximos
 * @param days - Número de días hacia adelante (por defecto 7)
 */
export async function getUpcomingEvents(days: number = 7): Promise<SacredEvent[]> {
  const response = await apiClient.get<SacredEvent[]>(
    `${API_ENDPOINTS.SACRED_CALENDAR.UPCOMING}?days=${days}`
  );
  return response.data;
}

/**
 * Obtener eventos sagrados del día actual
 */
export async function getTodayEvents(): Promise<SacredEvent[]> {
  const response = await apiClient.get<SacredEvent[]>(API_ENDPOINTS.SACRED_CALENDAR.TODAY);
  return response.data;
}

/**
 * Obtener eventos sagrados por rango de fechas
 * @param startDate - Fecha de inicio (ISO 8601)
 * @param endDate - Fecha de fin (ISO 8601)
 * @param filters - Filtros adicionales opcionales
 */
export async function getEventsByDateRange(
  startDate: string,
  endDate: string,
  filters?: Omit<SacredCalendarFilters, 'startDate' | 'endDate'>
): Promise<SacredEvent[]> {
  const params = new URLSearchParams();
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  if (filters?.eventType) params.append('eventType', filters.eventType);
  if (filters?.importance) params.append('importance', filters.importance);

  const response = await apiClient.get<SacredEvent[]>(
    `${API_ENDPOINTS.SACRED_CALENDAR.BY_DATE_RANGE}?${params.toString()}`
  );
  return response.data;
}

/**
 * Obtener evento sagrado por ID
 * @param id - ID del evento
 */
export async function getEventById(id: number): Promise<SacredEvent> {
  const response = await apiClient.get<SacredEvent>(API_ENDPOINTS.SACRED_CALENDAR.BY_ID(id));
  return response.data;
}
