/**
 * Admin Cache API Functions
 *
 * Estos clientes API coinciden exactamente con los endpoints del backend:
 * backend/tarot-app/src/modules/cache/infrastructure/controllers/cache-admin.controller.ts
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  CacheAnalytics,
  WarmingStatus,
  InvalidateCacheResponse,
  TriggerWarmingResponse,
} from '@/types/admin-cache.types';

/**
 * Get cache analytics (sin warming status - ese es endpoint separado)
 * Backend: GET /admin/cache/analytics
 * @returns Cache analytics data (hitRate, savings, responseTime, topCombinations)
 */
export async function getCacheAnalytics(): Promise<CacheAnalytics> {
  const response = await apiClient.get<CacheAnalytics>(API_ENDPOINTS.ADMIN.CACHE_ANALYTICS);
  return response.data;
}

/**
 * Get cache warming status (endpoint separado)
 * Backend: GET /admin/cache/warm/status
 * @returns Warming status
 */
export async function getCacheWarmingStatus(): Promise<WarmingStatus> {
  const response = await apiClient.get<WarmingStatus>(API_ENDPOINTS.ADMIN.CACHE_WARMING_STATUS);
  return response.data;
}

/**
 * Invalidate all cache entries (global clear)
 * Backend: DELETE /admin/cache/global
 * @returns Response with deletedCount
 */
export async function invalidateAllCache(): Promise<InvalidateCacheResponse> {
  const response = await apiClient.delete<InvalidateCacheResponse>(
    API_ENDPOINTS.ADMIN.INVALIDATE_ALL_CACHE
  );
  return response.data;
}

/**
 * Invalidate cache for a specific tarotista
 * Backend: DELETE /admin/cache/tarotistas/:id
 * @param tarotistaId - ID of the tarotista
 * @returns Response with deletedCount and reason
 */
export async function invalidateTarotistaCache(
  tarotistaId: number
): Promise<InvalidateCacheResponse> {
  const response = await apiClient.delete<InvalidateCacheResponse>(
    API_ENDPOINTS.ADMIN.INVALIDATE_TAROTISTA_CACHE(tarotistaId)
  );
  return response.data;
}

/**
 * Trigger cache warming process
 * Backend: POST /admin/cache/warm
 * @param topN - Number of top combinations to warm (default: 100)
 * @returns Response with started status and estimated time
 */
export async function triggerCacheWarming(topN: number = 100): Promise<TriggerWarmingResponse> {
  const response = await apiClient.post<TriggerWarmingResponse>(
    API_ENDPOINTS.ADMIN.TRIGGER_CACHE_WARMING,
    undefined,
    { params: { topN } }
  );
  return response.data;
}
