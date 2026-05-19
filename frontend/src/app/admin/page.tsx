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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { BarChart3, BookOpen } from 'lucide-react';
import { transformStatsToMetrics } from '@/lib/utils/dashboard-utils';

/**
 * Skeleton loader para las tarjetas de métricas
 */
function StatsCardsSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32" />
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
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingStats ? (
          <StatsCardsSkeleton />
        ) : statsError ? (
          <Alert variant="destructive" className="col-span-3">
            <AlertDescription>
              Error al cargar estadísticas. Por favor, intenta de nuevo.
            </AlertDescription>
          </Alert>
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
          <Alert variant="destructive">
            <AlertDescription>
              Error al cargar gráfico de lecturas. Por favor, intenta de nuevo.
            </AlertDescription>
          </Alert>
        ) : charts ? (
          <DailyReadingsChart data={charts.readingsPerDay} />
        ) : null}

        {/* Plan Distribution Chart */}
        {isLoadingStats ? (
          <Skeleton className="h-[400px]" />
        ) : statsError ? (
          <Alert variant="destructive">
            <AlertDescription>
              Error al cargar distribución de planes. Por favor, intenta de nuevo.
            </AlertDescription>
          </Alert>
        ) : stats?.users?.planDistribution && Array.isArray(stats.users.planDistribution) ? (
          <PlanDistributionChart data={stats.users.planDistribution} />
        ) : (
          <EmptyState
            icon={<BarChart3 />}
            title="Sin datos"
            message="No hay datos de distribución disponibles"
            className="border-border bg-bg-main h-[400px] rounded-lg border"
          />
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
          <EmptyState
            icon={<BookOpen />}
            title="Sin lecturas recientes"
            message="No hay lecturas recientes disponibles"
            className="rounded-lg border"
          />
        )}
      </div>
    </div>
  );
}
