'use client';

import { BarChart3, BookOpen } from 'lucide-react';
import { useUserCapabilities } from '@/hooks/api/useUserCapabilities';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/ui/error-display';
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

/**
 * Stats Section component (Premium only)
 *
 * Displays user statistics:
 * - Daily readings count
 * - Monthly readings (future)
 * - Most consulted categories (future)
 *
 * @example
 * ```tsx
 * {isPremium && <StatsSection />}
 * ```
 */
export function StatsSection() {
  const { data: capabilities, isLoading, error, refetch } = useUserCapabilities();

  if (isLoading) {
    return (
      <WidgetCard title="Tus Estadísticas" icon={<BarChart3 className="h-5 w-5" />}>
        <div className="space-y-4" data-testid="stats-loading">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="Tus Estadísticas" icon={<BarChart3 className="h-5 w-5" />}>
        <ErrorDisplay
          data-testid="retry-button"
          message="No pudimos cargar tus estadísticas. Por favor, intenta nuevamente."
          onRetry={() => refetch()}
        />
      </WidgetCard>
    );
  }

  if (!capabilities) {
    return null;
  }

  const dailyReadingsCount = capabilities.tarotReadings.used;
  const dailyReadingsLimit = capabilities.tarotReadings.limit;
  const remaining = dailyReadingsLimit - dailyReadingsCount;

  return (
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
