/**
 * Admin Cache Management Types
 *
 * Estos tipos reflejan exactamente los DTOs del backend para cache analytics
 * Backend: backend/tarot-app/src/modules/cache/application/dto/cache-analytics.dto.ts
 */

/**
 * Hit rate metrics - coincide con HitRateMetricsDto del backend
 */
export interface HitRateMetrics {
  percentage: number; // 0-100
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  windowHours: number;
}

/**
 * Savings metrics - coincide con SavingsMetricsDto del backend
 */
export interface SavingsMetrics {
  openaiSavings: number; // USD
  deepseekSavings: number; // USD
  groqRateLimitSaved: number;
  groqRateLimitPercentage: number;
}

/**
 * Response time metrics - coincide con ResponseTimeMetricsDto del backend
 */
export interface ResponseTimeMetrics {
  cacheAvg: number; // ms
  aiAvg: number; // ms
  improvementFactor: number;
}

/**
 * Combinación más cacheada - coincide con TopCachedCombinationDto del backend
 */
export interface TopCachedCombination {
  cacheKey: string;
  hitCount: number;
  cardIds: string[]; // Card IDs como strings
  spreadId: number | null;
  lastUsedAt: string; // ISO date
}

/**
 * Analytics completos de caché - coincide con CacheAnalyticsDto del backend
 */
export interface CacheAnalytics {
  hitRate: HitRateMetrics;
  savings: SavingsMetrics;
  responseTime: ResponseTimeMetrics;
  topCombinations: TopCachedCombination[];
  generatedAt: string; // ISO date
}

/**
 * Estado del warming - coincide con CacheWarmingStatusDto del backend
 */
export interface WarmingStatus {
  isRunning: boolean;
  progress: number; // 0-100
  totalCombinations: number;
  processedCombinations: number;
  successCount: number;
  errorCount: number;
  estimatedTimeRemainingMinutes: number;
}

/**
 * Respuesta de invalidación de caché
 * Backend: DELETE /admin/cache/global y DELETE /admin/cache/tarotistas/:id
 */
export interface InvalidateCacheResponse {
  deletedCount: number;
  message: string;
  timestamp: string; // ISO date
  reason?: string; // Solo para invalidación por tarotista
}

/**
 * Respuesta de trigger de warming
 * Backend: POST /admin/cache/warm
 */
export interface TriggerWarmingResponse {
  started: boolean;
  totalCombinations?: number;
  estimatedTimeMinutes?: number;
  message?: string;
}
