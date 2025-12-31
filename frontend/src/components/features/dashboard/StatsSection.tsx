'use client';

import { BarChart3, BookOpen } from 'lucide-react';
import { useProfile } from '@/hooks/api/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
        <div className="text-purple-600 dark:text-purple-400">{icon}</div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{description}</p>
        )}
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
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Tus Estadísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-testid="stats-loading">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Tus Estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error al cargar estadísticas</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  const { dailyReadingsCount, dailyReadingsLimit } = profile;
  const remaining = dailyReadingsLimit - dailyReadingsCount;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-xl">Tus Estadísticas</CardTitle>
          <BarChart3 className="h-5 w-5 text-purple-600" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
