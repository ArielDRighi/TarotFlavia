import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { SacredEvent } from '@/types';

/**
 * Obtener eventos sagrados próximos
 * @param days - Número de días hacia adelante (default: 30)
 * @returns Lista de eventos próximos (limitado a 3 para usuarios free)
 */
export async function getUpcomingEvents(days: number = 30): Promise<SacredEvent[]> {
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
 * Obtener eventos sagrados de un mes específico (Premium only)
 * @param year - Año
 * @param month - Mes (1-12)
 * @returns Lista de eventos del mes
 */
export async function getMonthEvents(year: number, month: number): Promise<SacredEvent[]> {
  const response = await apiClient.get<SacredEvent[]>(
    API_ENDPOINTS.SACRED_CALENDAR.MONTH(year, month)
  );
  return response.data;
}
