import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  RitualSummary,
  RitualDetail,
  RitualFilters,
  LunarInfo,
  RitualHistoryEntry,
  UserRitualStats,
  CompleteRitualRequest,
} from '@/types/ritual.types';

/**
 * Obtener lista de rituales con filtros opcionales
 */
export async function getRituals(filters?: RitualFilters): Promise<RitualSummary[]> {
  const params = new URLSearchParams();

  if (filters?.category) params.append('category', filters.category);
  if (filters?.difficulty) params.append('difficulty', filters.difficulty);
  if (filters?.lunarPhase) params.append('lunarPhase', filters.lunarPhase);
  if (filters?.search) params.append('search', filters.search);

  const url = params.toString()
    ? `${API_ENDPOINTS.RITUALS.LIST}?${params.toString()}`
    : API_ENDPOINTS.RITUALS.LIST;

  const response = await apiClient.get<RitualSummary[]>(url);
  return response.data;
}

/**
 * Obtener rituales destacados según fase lunar actual
 */
export async function getFeaturedRituals(): Promise<RitualSummary[]> {
  const response = await apiClient.get<RitualSummary[]>(API_ENDPOINTS.RITUALS.FEATURED);
  return response.data;
}

/**
 * Obtener categorías de rituales con conteo
 */
export async function getCategories(): Promise<{ category: string; count: number }[]> {
  const response = await apiClient.get<{ category: string; count: number }[]>(
    API_ENDPOINTS.RITUALS.CATEGORIES
  );
  return response.data;
}

/**
 * Obtener información de la fase lunar actual
 */
export async function getLunarInfo(): Promise<LunarInfo> {
  const response = await apiClient.get<LunarInfo>(API_ENDPOINTS.RITUALS.LUNAR_INFO);
  return response.data;
}

/**
 * Obtener detalle de un ritual por slug
 */
export async function getRitualBySlug(slug: string): Promise<RitualDetail> {
  const response = await apiClient.get<RitualDetail>(API_ENDPOINTS.RITUALS.DETAIL(slug));
  return response.data;
}

/**
 * Marcar ritual como completado
 * Requiere autenticación
 */
export async function completeRitual(
  ritualId: number,
  data: CompleteRitualRequest
): Promise<{ message: string; historyId: number; lunarPhase: string; lunarSign: string }> {
  const response = await apiClient.post(API_ENDPOINTS.RITUALS.COMPLETE(ritualId), data);
  return response.data;
}

/**
 * Obtener historial de rituales del usuario
 * Requiere autenticación
 */
export async function getRitualHistory(limit?: number): Promise<RitualHistoryEntry[]> {
  const url = limit
    ? `${API_ENDPOINTS.RITUALS.HISTORY}?limit=${limit}`
    : API_ENDPOINTS.RITUALS.HISTORY;

  const response = await apiClient.get<RitualHistoryEntry[]>(url);
  return response.data;
}

/**
 * Obtener estadísticas de rituales del usuario
 * Requiere autenticación
 */
export async function getRitualStats(): Promise<UserRitualStats> {
  const response = await apiClient.get<UserRitualStats>(API_ENDPOINTS.RITUALS.STATS);
  return response.data;
}
