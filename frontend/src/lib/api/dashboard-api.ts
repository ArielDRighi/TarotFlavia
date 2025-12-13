/**
 * API functions for admin dashboard
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { DashboardStats, DashboardCharts } from '@/types/admin.types';

/**
 * Fetch dashboard statistics
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<DashboardStats>(API_ENDPOINTS.ADMIN.DASHBOARD_STATS);
  return response.data;
}

/**
 * Fetch dashboard charts data
 */
export async function fetchDashboardCharts(): Promise<DashboardCharts> {
  const response = await apiClient.get<DashboardCharts>(API_ENDPOINTS.ADMIN.DASHBOARD_CHARTS);
  return response.data;
}
