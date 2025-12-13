/**
 * API functions for admin dashboard
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { StatsResponseDto, ChartsResponseDto } from '@/types/admin.types';

/**
 * Fetch dashboard statistics
 * Retorna exactamente el DTO del backend sin transformación
 */
export async function fetchDashboardStats(): Promise<StatsResponseDto> {
  const response = await apiClient.get<StatsResponseDto>(API_ENDPOINTS.ADMIN.DASHBOARD_STATS);
  return response.data;
}

/**
 * Fetch dashboard charts data
 * Retorna exactamente el DTO del backend sin transformación
 */
export async function fetchDashboardCharts(): Promise<ChartsResponseDto> {
  const response = await apiClient.get<ChartsResponseDto>(API_ENDPOINTS.ADMIN.DASHBOARD_CHARTS);
  return response.data;
}
