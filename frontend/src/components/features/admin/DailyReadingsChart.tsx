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
import type { ReadingsPerDayDto } from '@/types/admin.types';

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
          <div className="text-muted-foreground flex h-[300px] items-center justify-center">
            No hay datos disponibles
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  // Append noon time to avoid timezone date shift issues with YYYY-MM-DD format
                  const date = new Date(`${value}T12:00:00`);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => {
                  // Append noon time to avoid timezone date shift issues with YYYY-MM-DD format
                  const date = new Date(`${value}T12:00:00`);
                  return date.toLocaleDateString('es-ES');
                }}
              />
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
