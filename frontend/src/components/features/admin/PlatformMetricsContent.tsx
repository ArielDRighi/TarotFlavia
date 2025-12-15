/**
 * Platform Metrics Content Component
 *
 * Contains all the business logic for the platform metrics page
 */

'use client';

import { useState } from 'react';
import { usePlatformMetrics } from '@/hooks/api/usePlatformMetrics';
import { MetricsPeriod } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * Formatea números grandes como 1.2K, 15K, etc.
 */
function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Formatea montos en USD
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Skeleton loader para las tarjetas de métricas
 */
function MetricsCardsSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32" data-testid="skeleton" />
      ))}
    </>
  );
}

export function PlatformMetricsContent() {
  const [period, setPeriod] = useState<MetricsPeriod>(MetricsPeriod.MONTH);
  const { data: metrics, isLoading, error } = usePlatformMetrics(period);

  return (
    <>
      {/* Header con selector de período */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Métricas de Plataforma</h1>
        </div>

        <Select value={period} onValueChange={(value) => setPeriod(value as MetricsPeriod)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={MetricsPeriod.WEEK}>7 días</SelectItem>
            <SelectItem value={MetricsPeriod.MONTH}>30 días</SelectItem>
            <SelectItem value={MetricsPeriod.YEAR}>1 año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Error al cargar métricas. Por favor, intenta de nuevo.
        </div>
      )}

      {/* Cards de Métricas Principales */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <MetricsCardsSkeleton />
        ) : metrics ? (
          <>
            {/* Revenue Total */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Revenue Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics.totalGrossRevenue)}
                </div>
                <p className="text-xs text-gray-500">Ingresos brutos</p>
              </CardContent>
            </Card>

            {/* Sesiones Completadas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Sesiones Completadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-gray-500">Próximamente</p>
              </CardContent>
            </Card>

            {/* Lecturas Totales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Lecturas Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatLargeNumber(metrics.totalReadings)}</div>
                <p className="text-xs text-gray-500">
                  Promedio:{' '}
                  {metrics.activeUsers > 0
                    ? (metrics.totalReadings / metrics.activeUsers).toFixed(1)
                    : 'N/A'}{' '}
                  por usuario
                </p>
              </CardContent>
            </Card>

            {/* Usuarios Activos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Usuarios Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatLargeNumber(metrics.activeUsers)}</div>
                <p className="text-xs text-gray-500">En el período seleccionado</p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Tabla: TOP TAROTISTAS */}
      {!isLoading && metrics && metrics.topTarotistas.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Tarotistas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Posición</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Lecturas</TableHead>
                  <TableHead className="text-right">Sesiones</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.topTarotistas.map((tarotista, index) => (
                  <TableRow key={tarotista.tarotistaId}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>{tarotista.nombrePublico}</TableCell>
                    <TableCell className="text-right">
                      {formatLargeNumber(tarotista.totalReadings)}
                    </TableCell>
                    <TableCell className="text-right text-gray-500">-</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(tarotista.totalGrossRevenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{tarotista.averageRating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
