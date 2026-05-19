/**
 * Dashboard Utils - Transformaciones de datos del backend a formato UI
 */

import type { StatsResponseDto, DashboardMetric } from '@/types/admin.types';

/**
 * Calcula el cambio porcentual entre dos valores
 */
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Determina la tendencia basada en el cambio porcentual
 */
function getTrend(change: number): 'up' | 'down' | 'stable' {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'stable';
}

/**
 * Transforma los stats del backend a métricas para las cards
 */
export function transformStatsToMetrics(stats: StatsResponseDto) {
  // Total Users
  const totalUsers: DashboardMetric = {
    value: stats.users.totalUsers,
    change: calculateChange(stats.users.activeUsersLast7Days, stats.users.activeUsersLast30Days),
    trend: getTrend(
      calculateChange(stats.users.activeUsersLast7Days, stats.users.activeUsersLast30Days)
    ),
  };

  // Monthly Readings (usando last 30 days como "mensual")
  const monthlyReadings: DashboardMetric = {
    value: stats.readings.readingsLast30Days,
    change: calculateChange(stats.readings.readingsLast7Days, stats.readings.readingsLast30Days),
    trend: getTrend(
      calculateChange(stats.readings.readingsLast7Days, stats.readings.readingsLast30Days)
    ),
  };

  // Active Tarotistas (dato real del backend: Tarotista.isActive = true)
  const activeTarotistas: DashboardMetric = {
    value: stats.activeTarotistas,
    change: 0,
    trend: 'stable',
  };

  return {
    totalUsers,
    monthlyReadings,
    activeTarotistas,
  };
}
