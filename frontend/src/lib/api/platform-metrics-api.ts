/**
 * Platform Metrics API Functions
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { PlatformMetricsQueryDto, PlatformMetricsDto } from '@/types';

/**
 * Get platform-wide metrics (Admin only)
 * GET /tarotistas/metrics/platform
 */
export async function getPlatformMetrics(
  query: PlatformMetricsQueryDto
): Promise<PlatformMetricsDto> {
  const response = await apiClient.get<PlatformMetricsDto>(
    API_ENDPOINTS.TAROTISTAS.METRICS_PLATFORM,
    {
      params: query,
    }
  );
  return response.data;
}
