/**
 * AIUsageMetricsCards Component
 *
 * Displays key metrics for AI usage
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateTotalCost, calculateSuccessRate } from '@/lib/utils/ai-usage';
import { getProviderLabel } from '@/lib/utils/ai-usage';
import type { AIUsageStats } from '@/types/admin.types';

interface AIUsageMetricsCardsProps {
  stats: AIUsageStats;
}

export function AIUsageMetricsCards({ stats }: AIUsageMetricsCardsProps) {
  // Calculate totals
  const totalRequests = stats.statistics.reduce((sum, provider) => sum + provider.totalCalls, 0);

  const totalTokens = stats.statistics.reduce((sum, provider) => sum + provider.totalTokens, 0);

  const totalCost = calculateTotalCost(stats.statistics);
  const successRate = calculateSuccessRate(stats.statistics);

  const totalCached = stats.statistics.reduce((sum, provider) => sum + provider.cachedCalls, 0);
  const totalSuccessful = stats.statistics.reduce(
    (sum, provider) => sum + provider.successCalls,
    0
  );
  const cacheHitRate = totalRequests > 0 ? (totalCached / totalRequests) * 100 : 0;

  // Groq daily limit comes from the backend DTO
  const groqDailyLimit = stats.groqDailyLimit;

  // Free tier note: only when there are active providers that are in the free tier list.
  // Compute the intersection of active providers (from statistics) and freeProviders.
  const activeProviders = stats.statistics.map((s) => s.provider);
  const activeFreeProviders = activeProviders.filter((p) => stats.freeProviders.includes(p));
  const hasActiveFreeProviders = activeFreeProviders.length > 0;
  const allActiveAreFree =
    hasActiveFreeProviders && activeProviders.every((p) => stats.freeProviders.includes(p));

  const freeTierLabel = hasActiveFreeProviders
    ? `Free tier: ${activeFreeProviders.map(getProviderLabel).join(', ')}`
    : undefined;

  // Determine success rate color
  const getSuccessRateColor = (rate: number) => {
    if (rate > 95) return 'text-green-600';
    if (rate > 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
          <p className="text-muted-foreground text-xs">
            Groq hoy: {stats.groqCallsToday.toLocaleString()} / {groqDailyLimit.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Tokens Consumidos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tokens Consumidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
          <p className="text-muted-foreground text-xs">Cache hit: {cacheHitRate.toFixed(2)}%</p>
        </CardContent>
      </Card>

      {/* Costo Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalCost.toFixed(4)}</div>
          {allActiveAreFree && freeTierLabel ? (
            <p className="text-muted-foreground text-xs" data-testid="free-tier-note">
              {freeTierLabel} — $0 es correcto
            </p>
          ) : freeTierLabel ? (
            <p className="text-muted-foreground text-xs" data-testid="free-tier-note">
              {freeTierLabel} sin costo
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">USD</p>
          )}
        </CardContent>
      </Card>

      {/* Tasa de Éxito */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getSuccessRateColor(successRate)}`}>
            {successRate.toFixed(2)}%
          </div>
          <p className="text-muted-foreground text-xs">
            {totalSuccessful.toLocaleString()} / {totalRequests.toLocaleString()} llamadas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
