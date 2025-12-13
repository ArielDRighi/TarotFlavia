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
import type { RecentReading } from '@/types/admin.types';

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

  // Mock de lecturas recientes (en producción vendrá del backend)
  const recentReadings: RecentReading[] = [
    {
      id: 1,
      userName: 'Juan Pérez',
      date: '2025-12-13T10:00:00Z',
      spreadType: 'TRES_CARTAS',
      status: 'completed',
    },
    {
      id: 2,
      userName: 'María García',
      date: '2025-12-13T09:30:00Z',
      spreadType: 'CRUZ_CELTA',
      status: 'completed',
    },
    {
      id: 3,
      userName: 'Pedro López',
      date: '2025-12-13T09:00:00Z',
      spreadType: 'SIMPLE',
      status: 'completed',
    },
    {
      id: 4,
      userName: 'Ana Martínez',
      date: '2025-12-13T08:30:00Z',
      spreadType: 'TRES_CARTAS',
      status: 'pending',
    },
    {
      id: 5,
      userName: 'Carlos Rodríguez',
      date: '2025-12-13T08:00:00Z',
      spreadType: 'CRUZ_CELTA',
      status: 'completed',
    },
    {
      id: 6,
      userName: 'Laura Fernández',
      date: '2025-12-12T22:00:00Z',
      spreadType: 'SIMPLE',
      status: 'failed',
    },
    {
      id: 7,
      userName: 'Diego González',
      date: '2025-12-12T20:00:00Z',
      spreadType: 'TRES_CARTAS',
      status: 'completed',
    },
    {
      id: 8,
      userName: 'Sofia Ruiz',
      date: '2025-12-12T18:00:00Z',
      spreadType: 'CRUZ_CELTA',
      status: 'completed',
    },
    {
      id: 9,
      userName: 'Miguel Torres',
      date: '2025-12-12T16:00:00Z',
      spreadType: 'SIMPLE',
      status: 'completed',
    },
    {
      id: 10,
      userName: 'Elena Ramírez',
      date: '2025-12-12T14:00:00Z',
      spreadType: 'TRES_CARTAS',
      status: 'completed',
    },
  ];

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
        {isLoadingCharts ? (
          <ChartsSkeleton />
        ) : chartsError ? (
          <div className="col-span-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            Error al cargar gráficos. Por favor, intenta de nuevo.
          </div>
        ) : charts ? (
          <>
            <DailyReadingsChart data={charts.readingsPerDay} />
            <PlanDistributionChart data={stats?.users.planDistribution || []} />
          </>
        ) : null}
      </div>

      {/* Tabla de Lecturas Recientes */}
      <div>
        <h2 className="mb-4 font-serif text-2xl font-semibold">Lecturas Recientes</h2>
        <RecentReadingsTable readings={recentReadings} />
      </div>
    </div>
  );
}
