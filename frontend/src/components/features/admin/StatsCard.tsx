/**
 * StatsCard - Tarjeta de métrica para dashboard admin
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Star, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DashboardMetric } from '@/types/admin.types';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  metric: DashboardMetric;
  icon: 'users' | 'book' | 'star' | 'dollar-sign';
  prefix?: string;
}

const iconMap = {
  users: Users,
  book: BookOpen,
  star: Star,
  'dollar-sign': DollarSign,
};

/**
 * Formatea un número con separador de miles
 */
function formatNumber(value: number, prefix?: string): string {
  const formatted = value.toLocaleString('en-US');
  return prefix ? `${prefix}${formatted}` : formatted;
}

/**
 * Renderiza el indicador de cambio con color y icono
 */
function ChangeIndicator({ change }: { change?: number }) {
  if (change === undefined || change === null) return null;

  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  const colorClass = cn({
    'text-green-600': isPositive,
    'text-red-600': isNegative,
    'text-gray-600': isNeutral,
  });

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const sign = isPositive ? '+' : '';

  return (
    <div className={cn('flex items-center gap-1 text-sm', colorClass)}>
      <Icon className="h-4 w-4" />
      <span>
        {sign}
        {change}%
      </span>
    </div>
  );
}

export function StatsCard({ title, metric, icon, prefix }: StatsCardProps) {
  const Icon = iconMap[icon];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatNumber(metric.value, prefix)}</div>
        {metric.change !== undefined && <ChangeIndicator change={metric.change} />}
      </CardContent>
    </Card>
  );
}
