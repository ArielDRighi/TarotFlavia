/**
 * Admin Cache API Functions
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  CacheAnalytics,
  InvalidateCacheResponse,
  TriggerWarmingResponse,
} from '@/types/admin-cache.types';

/**
 * Get cache analytics (stats, top combinations, warming status)
 * @returns Cache analytics data
 */
export async function getCacheAnalytics(): Promise<CacheAnalytics> {
  const response = await apiClient.get<CacheAnalytics>(API_ENDPOINTS.ADMIN.CACHE_ANALYTICS);
  return response.data;
}

/**
 * Invalidate all cache entries
 * @returns Response with entries deleted count
 */
export async function invalidateAllCache(): Promise<InvalidateCacheResponse> {
  const response = await apiClient.delete<InvalidateCacheResponse>(
    API_ENDPOINTS.ADMIN.INVALIDATE_ALL_CACHE
  );
  return response.data;
}

/**
 * Invalidate cache for a specific tarotista
 * @param tarotistaId - ID of the tarotista
 * @returns Response with entries deleted count
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
 * Invalidate cache for a specific spread
 * @param spreadId - ID of the spread
 * @returns Response with entries deleted count
 */
export async function invalidateSpreadCache(spreadId: number): Promise<InvalidateCacheResponse> {
  const response = await apiClient.delete<InvalidateCacheResponse>(
    API_ENDPOINTS.ADMIN.INVALIDATE_SPREAD_CACHE(spreadId)
  );
  return response.data;
}

/**
 * Trigger cache warming process
 * @returns Response with warming status
 */
export async function triggerCacheWarming(): Promise<TriggerWarmingResponse> {
  const response = await apiClient.post<TriggerWarmingResponse>(
    API_ENDPOINTS.ADMIN.TRIGGER_CACHE_WARMING
  );
  return response.data;
}
