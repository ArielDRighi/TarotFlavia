/**
 * AIUsageMetricsCards Component
 *
 * Displays key metrics for AI usage
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AIUsageStats } from '@/types/admin.types';

interface AIUsageMetricsCardsProps {
  stats: AIUsageStats;
}

const GROQ_DAILY_LIMIT = 14400;

export function AIUsageMetricsCards({ stats }: AIUsageMetricsCardsProps) {
  // Calculate totals
  const totalRequests = stats.statistics.reduce((sum, provider) => sum + provider.totalCalls, 0);

  const totalTokens = stats.statistics.reduce((sum, provider) => sum + provider.totalTokens, 0);

  const totalCost = stats.statistics.reduce((sum, provider) => sum + provider.totalCost, 0);

  const totalSuccessful = stats.statistics.reduce(
    (sum, provider) => sum + provider.successCalls,
    0
  );

  const totalCached = stats.statistics.reduce((sum, provider) => sum + provider.cachedCalls, 0);

  const successRate = totalRequests > 0 ? (totalSuccessful / totalRequests) * 100 : 0;
  const cacheHitRate = totalRequests > 0 ? (totalCached / totalRequests) * 100 : 0;

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
            Groq hoy: {stats.groqCallsToday.toLocaleString()} / {GROQ_DAILY_LIMIT.toLocaleString()}
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
          <p className="text-muted-foreground text-xs">USD</p>
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
