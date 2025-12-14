/**
 * CacheStatsCards - Grid of cache statistics cards
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, TrendingUp, TrendingDown, HardDrive } from 'lucide-react';
import type { CacheStats } from '@/types/admin-cache.types';
import { cn } from '@/lib/utils';

interface CacheStatsCardsProps {
  stats: CacheStats;
}

export function CacheStatsCards({ stats }: CacheStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Entries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          <Database className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEntries}</div>
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
              'text-green-600': stats.hitRate > 80,
            })}
          >
            {stats.hitRate}%
          </div>
        </CardContent>
      </Card>

      {/* Miss Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Miss Rate</CardTitle>
          <TrendingDown className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.missRate}%</div>
        </CardContent>
      </Card>

      {/* Memory Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          <HardDrive className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.memoryUsageMB} MB</div>
        </CardContent>
      </Card>
    </div>
  );
}
