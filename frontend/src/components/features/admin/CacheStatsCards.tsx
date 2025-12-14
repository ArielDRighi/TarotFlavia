/**
 * CacheStatsCards - Grid of cache statistics cards
 * Backend retorna estructura anidada: { hitRate, savings, responseTime }
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import type {
  HitRateMetrics,
  SavingsMetrics,
  ResponseTimeMetrics,
} from '@/types/admin-cache.types';
import { cn } from '@/lib/utils';

interface CacheStatsCardsProps {
  hitRate: HitRateMetrics;
  savings: SavingsMetrics; // eslint-disable-line @typescript-eslint/no-unused-vars
  responseTime: ResponseTimeMetrics;
}

export function CacheStatsCards({ hitRate, savings, responseTime }: CacheStatsCardsProps) {
  const missRate = 100 - hitRate.percentage;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          <Database className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{hitRate.totalRequests.toLocaleString()}</div>
          <p className="text-muted-foreground text-xs">Last {hitRate.windowHours}h</p>
        </CardContent>
      </Card>

      {/* Hit Rate */}
      <Card data-testid="hit-rate-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
          <TrendingUp className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div
            className={cn('text-2xl font-bold', {
              'text-green-600': hitRate.percentage > 80,
            })}
          >
            {hitRate.percentage.toFixed(1)}%
          </div>
          <p className="text-muted-foreground text-xs">
            {hitRate.cacheHits.toLocaleString()} cache hits
          </p>
        </CardContent>
      </Card>

      {/* Miss Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Miss Rate</CardTitle>
          <TrendingDown className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{missRate.toFixed(1)}%</div>
          <p className="text-muted-foreground text-xs">
            {hitRate.cacheMisses.toLocaleString()} AI generations
          </p>
        </CardContent>
      </Card>

      {/* Performance Improvement */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Speed Improvement</CardTitle>
          <Zap className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{responseTime.improvementFactor}x</div>
          <p className="text-muted-foreground text-xs">
            Cache: {responseTime.cacheAvg}ms vs AI: {responseTime.aiAvg}ms
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
