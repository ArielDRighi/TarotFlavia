/**
 * Platform Metrics Hooks
 *
 * React Query hooks para obtener métricas de plataforma
 */
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getPlatformMetrics } from '@/lib/api/platform-metrics-api';
import type { PlatformMetricsDto, PlatformMetricsQueryDto } from '@/types';
import { MetricsPeriod } from '@/types';

/**
 * Query keys for platform metrics
 * Exported for manual cache invalidation
 */
export const platformMetricsQueryKeys = {
  all: ['platform-metrics'] as const,
  byPeriod: (period: MetricsPeriod, customDates?: { startDate?: string; endDate?: string }) =>
    [...platformMetricsQueryKeys.all, period, customDates] as const,
} as const;

/**
 * Hook para obtener métricas de plataforma
 */
export function usePlatformMetrics(
  period: MetricsPeriod = MetricsPeriod.MONTH,
  customDates?: { startDate?: string; endDate?: string }
): UseQueryResult<PlatformMetricsDto> {
  const query: PlatformMetricsQueryDto = {
    period,
    ...customDates,
  };

  return useQuery({
    queryKey: platformMetricsQueryKeys.byPeriod(period, customDates),
    queryFn: () => getPlatformMetrics(query),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}
