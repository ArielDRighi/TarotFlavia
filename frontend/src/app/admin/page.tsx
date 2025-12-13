/**
 * Admin Dashboard Page
 *
 * Dashboard principal con métricas y estadísticas para administradores
 */

'use client';

import { StatsCard } from '@/components/features/admin/StatsCard';
import { DailyReadingsChart } from '@/components/features/admin/DailyReadingsChart';
import { PlanDistributionChart } from '@/components/features/admin/PlanDistributionChart';
import { RecentReadingsTable } from '@/components/features/admin/RecentReadingsTable';
import { useDashboardStats } from '@/hooks/api/useDashboardStats';
import { useDashboardCharts } from '@/hooks/api/useDashboardCharts';
import { Skeleton } from '@/components/ui/skeleton';
import { transformStatsToMetrics } from '@/lib/utils/dashboard-utils';

/**
 * Skeleton loader para las tarjetas de métricas
 */
function StatsCardsSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </>
  );
}

/**
 * Skeleton loader para los gráficos
 */
function ChartsSkeleton() {
  return (
    <>
      {[1, 2].map((i) => (
        <Skeleton key={i} className="h-[400px]" />
      ))}
    </>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useDashboardStats();
  const { data: charts, isLoading: isLoadingCharts, error: chartsError } = useDashboardCharts();

  return (
    <div className="container py-8">
      <h1 className="mb-8 font-serif text-3xl font-bold">Dashboard Admin</h1>

      {/* Cards de Métricas */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingStats ? (
          <StatsCardsSkeleton />
        ) : statsError ? (
          <div className="col-span-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            Error al cargar estadísticas. Por favor, intenta de nuevo.
          </div>
        ) : stats ? (
          <>
            {(() => {
              const metrics = transformStatsToMetrics(stats);
              return (
                <>
                  <StatsCard title="Total Usuarios" metric={metrics.totalUsers} icon="users" />
                  <StatsCard
                    title="Lecturas del Mes"
                    metric={metrics.monthlyReadings}
                    icon="book"
                  />
                  <StatsCard
                    title="Tarotistas Activos"
                    metric={metrics.activeTarotistas}
                    icon="star"
                  />
                  <StatsCard
                    title="Revenue del Mes"
                    metric={metrics.monthlyRevenue}
                    icon="dollar-sign"
                    prefix="$"
                  />
                </>
              );
            })()}
          </>
        ) : null}
      </div>

      {/* Gráficos */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        {/* Daily Readings Chart */}
        {isLoadingCharts ? (
          <Skeleton className="h-[400px]" />
        ) : chartsError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            Error al cargar gráfico de lecturas. Por favor, intenta de nuevo.
          </div>
        ) : charts ? (
          <DailyReadingsChart data={charts.readingsPerDay} />
        ) : null}

        {/* Plan Distribution Chart */}
        {isLoadingStats ? (
          <Skeleton className="h-[400px]" />
        ) : statsError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            Error al cargar distribución de planes. Por favor, intenta de nuevo.
          </div>
        ) : stats?.users?.planDistribution && Array.isArray(stats.users.planDistribution) ? (
          <PlanDistributionChart data={stats.users.planDistribution} />
        ) : (
          <div className="border-border bg-bg-main flex h-[400px] items-center justify-center rounded-lg border">
            <p className="text-text-secondary">No hay datos de distribución disponibles</p>
          </div>
        )}
      </div>

      {/* Tabla de Lecturas Recientes */}
      <div>
        <h2 className="mb-4 font-serif text-2xl font-semibold">Lecturas Recientes</h2>
        {isLoadingStats ? (
          <Skeleton className="h-[400px]" />
        ) : stats?.recentReadings ? (
          <RecentReadingsTable readings={stats.recentReadings} />
        ) : (
          <div className="text-muted-foreground rounded-lg border p-8 text-center">
            No hay lecturas recientes disponibles
          </div>
        )}
      </div>
    </div>
  );
}
