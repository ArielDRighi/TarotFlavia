'use client';

import type { ReactNode } from 'react';
import { BarChart3, BookOpen } from 'lucide-react';
import { useUserCapabilities } from '@/hooks/api/useUserCapabilities';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/ui/error-display';
import { RevealWidget } from './RevealWidget';
import { WidgetCard } from './WidgetCard';

/**
 * Stat card component
 */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description?: string;
}

function StatCard({ icon, label, value, description }: StatCardProps) {
  return (
    <div className="border-border flex items-start gap-3 rounded-lg border p-4">
      <div className="bg-secondary/15 flex h-10 w-10 items-center justify-center rounded-full">
        <div className="text-secondary">{icon}</div>
      </div>
      <div className="flex-1">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-foreground text-2xl font-bold">{value}</p>
        {description && <p className="text-muted-foreground mt-1 text-xs">{description}</p>}
      </div>
    </div>
  );
}

interface StatsSectionProps {
  /**
   * Posición en el grid del dashboard; define el retardo del reveal escalonado
   * (T-DASH-006). Por defecto `0` para uso aislado.
   */
  index?: number;
}

/**
 * Stats Section component (Premium only)
 *
 * Displays user statistics:
 * - Daily readings count
 * - Monthly readings (future)
 * - Most consulted categories (future)
 *
 * Se auto-oculta (`return null`) cuando no hay `capabilities`. Por eso envuelve su
 * propia salida no-nula en `RevealWidget` (en lugar de que lo haga el padre): así
 * el `null` sigue liberando la celda del grid sin dejar una celda "fantasma"
 * vacía (T-DASH-001).
 *
 * @example
 * ```tsx
 * {isPremium && <StatsSection index={6} />}
 * ```
 */
export function StatsSection({ index = 0 }: StatsSectionProps) {
  const { data: capabilities, isLoading, error, refetch } = useUserCapabilities();

  let content: ReactNode;

  if (isLoading) {
    content = (
      <WidgetCard title="Tus Estadísticas" icon={<BarChart3 className="h-5 w-5" />}>
        <div className="space-y-4" data-testid="stats-loading">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </WidgetCard>
    );
  } else if (error) {
    content = (
      <WidgetCard title="Tus Estadísticas" icon={<BarChart3 className="h-5 w-5" />}>
        <ErrorDisplay
          data-testid="retry-button"
          message="No pudimos cargar tus estadísticas. Por favor, intenta nuevamente."
          onRetry={() => refetch()}
        />
      </WidgetCard>
    );
  } else if (!capabilities || capabilities.plan === 'anonymous') {
    // Defensive: never render an anonymous capabilities payload here. This widget
    // is only shown to authenticated (premium) users; an 'anonymous' plan means a
    // stale pre-auth response (used:0/limit:0) — treat it as "still loading" so we
    // don't flash a bogus "0/0 - límite alcanzado" until the authenticated fetch lands.
    return null;
  } else {
    const dailyReadingsCount = capabilities.tarotReadings.used;
    const dailyReadingsLimit = capabilities.tarotReadings.limit;
    const remaining = dailyReadingsLimit - dailyReadingsCount;

    content = (
      <WidgetCard
        title="Tus Estadísticas"
        icon={<BarChart3 className="h-5 w-5" />}
        contentClassName="space-y-4"
      >
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Lecturas de Hoy"
          value={`${dailyReadingsCount} / ${dailyReadingsLimit}`}
          description={
            remaining > 0
              ? `Te quedan ${remaining} ${remaining === 1 ? 'lectura' : 'lecturas'} hoy`
              : 'Has alcanzado tu límite diario'
          }
        />
      </WidgetCard>
    );
  }

  return <RevealWidget index={index}>{content}</RevealWidget>;
}
