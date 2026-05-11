/**
 * PlanDistributionChart - Gráfico de dona para distribución de planes
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import type { PlanDistributionDto } from '@/types/admin.types';

interface PlanDistributionChartProps {
  data: PlanDistributionDto[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

export function PlanDistributionChart({ data }: PlanDistributionChartProps) {
  // Validación defensiva: asegurar que data sea un array
  const planData = Array.isArray(data) ? data : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Plan</CardTitle>
      </CardHeader>
      <CardContent>
        {planData.length === 0 ? (
          <EmptyState
            icon={<BarChart3 />}
            title="Sin datos de planes"
            message="No hay datos de distribución disponibles"
            className="h-[300px]"
          />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="count"
                label
              >
                {planData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} usuarios`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
