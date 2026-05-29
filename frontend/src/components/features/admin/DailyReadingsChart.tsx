/**
 * DailyReadingsChart - Gráfico de líneas para lecturas diarias
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import type { ReadingsPerDayDto } from '@/types/admin.types';
import { formatDateCompact, formatDateLocalized } from '@/lib/utils';

interface DailyReadingsChartProps {
  data: ReadingsPerDayDto[];
}

export function DailyReadingsChart({ data }: DailyReadingsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lecturas por Día</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={<TrendingUp />}
            title="Sin datos"
            message="No hay datos disponibles"
            className="h-[300px]"
          />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => formatDateCompact(value)} />
              <YAxis />
              <Tooltip labelFormatter={(value) => formatDateLocalized(value as string)} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Lecturas"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
