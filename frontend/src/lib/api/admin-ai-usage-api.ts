/**
 * Admin AI Usage API Functions
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { AIUsageStats } from '@/types/admin.types';

/**
 * Get AI usage statistics
 * @param startDate - Optional start date filter (ISO format)
 * @param endDate - Optional end date filter (ISO format)
 * @returns AI usage statistics with provider data and alerts
 */
export async function getAIUsageStats(startDate?: string, endDate?: string): Promise<AIUsageStats> {
  const params: Record<string, string> = {};

  if (startDate) {
    params.startDate = startDate;
  }

  if (endDate) {
    params.endDate = endDate;
  }

  const response = await apiClient.get<AIUsageStats>(API_ENDPOINTS.ADMIN.AI_USAGE, { params });

  return response.data;
}
