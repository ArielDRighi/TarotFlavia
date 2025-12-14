/**
 * Admin Cache Management Types
 *
 * Estos tipos reflejan exactamente los DTOs del backend para cache analytics
 */

/**
 * Estadísticas de rendimiento del caché
 */
export interface CacheStats {
  totalEntries: number;
  hitRate: number; // Porcentaje
  missRate: number; // Porcentaje
  memoryUsageMB: number;
}

/**
 * Combinación más cacheada
 */
export interface TopCachedCombination {
  tarotistaName: string;
  spreadName: string;
  categoryName: string;
  hitCount: number;
  lastUpdated: string; // ISO date
}

/**
 * Estado del warming
 */
export interface WarmingStatus {
  isRunning: boolean;
  lastExecutionAt: string | null; // ISO date
  nextScheduledAt: string | null; // ISO date
  entriesWarmed: number;
}

/**
 * Analytics completos de caché
 */
export interface CacheAnalytics {
  stats: CacheStats;
  topCombinations: TopCachedCombination[];
  warmingStatus: WarmingStatus;
}

/**
 * Respuesta de invalidación de caché
 */
export interface InvalidateCacheResponse {
  entriesDeleted: number;
  message: string;
}

/**
 * Respuesta de trigger de warming
 */
export interface TriggerWarmingResponse {
  status: string;
  message: string;
  entriesWarmed: number;
}
