/**
 * Admin Dashboard Types
 *
 * Tipos para el panel de administración
 */

/**
 * Métrica individual del dashboard
 */
export interface DashboardMetric {
  value: number;
  change?: number; // Cambio porcentual vs periodo anterior
  trend?: 'up' | 'down' | 'stable';
}

/**
 * Estadísticas principales del dashboard
 */
export interface DashboardStats {
  totalUsers: DashboardMetric;
  monthlyReadings: DashboardMetric;
  activeTarotistas: DashboardMetric;
  monthlyRevenue: DashboardMetric;
}

/**
 * Punto de dato para gráfico de líneas
 */
export interface ChartDataPoint {
  date: string;
  value: number;
}

/**
 * Distribución por plan
 */
export interface PlanDistribution {
  plan: string;
  count: number;
  percentage: number;
  [key: string]: string | number; // Index signature para compatibilidad con recharts
}

/**
 * Datos para gráficos del dashboard
 */
export interface DashboardCharts {
  dailyReadings: ChartDataPoint[]; // Últimos 30 días
  planDistribution: PlanDistribution[];
}

/**
 * Lectura reciente para tabla
 */
export interface RecentReading {
  id: number;
  userName: string;
  date: string;
  spreadType: string;
  status: 'completed' | 'pending' | 'failed';
}

/**
 * Respuesta completa del dashboard
 */
export interface DashboardData {
  stats: DashboardStats;
  charts: DashboardCharts;
  recentReadings: RecentReading[];
}
