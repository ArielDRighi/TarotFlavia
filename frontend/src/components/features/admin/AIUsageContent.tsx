'use client';

/**
 * AIUsageContent Component
 *
 * Main content component for AI usage statistics page
 * Handles state and data fetching logic
 */

import { useAIUsageStats } from '@/hooks/queries/useAdminAIUsage';
import { AIUsageAlerts } from './AIUsageAlerts';
import { AIUsageMetricsCards } from './AIUsageMetricsCards';
import { AIProvidersTable } from './AIProvidersTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AIUsageContent() {
  const { data: stats, isLoading, error } = useAIUsageStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error al cargar las estadísticas de IA. Por favor, intenta de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert>
        <AlertDescription>No hay datos disponibles.</AlertDescription>
      </Alert>
    );
  }

  const hasAlerts =
    stats.groqRateLimitAlert ||
    stats.highErrorRateAlert ||
    stats.highFallbackRateAlert ||
    stats.highDailyCostAlert;

  return (
    <div className="space-y-6">
      {hasAlerts && <AIUsageAlerts stats={stats} />}

      <AIUsageMetricsCards stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas por Proveedor</CardTitle>
        </CardHeader>
        <CardContent>
          <AIProvidersTable providers={stats.statistics} />
        </CardContent>
      </Card>
    </div>
  );
}
