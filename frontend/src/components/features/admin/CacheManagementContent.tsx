/**
 * CacheManagementContent - Main component for cache management page
 *
 * NOTA IMPORTANTE:
 * - Analytics y Warming Status son endpoints separados
 * - TopCombinations usa cardIds (no nombres legibles)
 * - No existe endpoint para invalidar por spread
 */

'use client';

import { useState } from 'react';
import { RefreshCw, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { CacheStatsCards } from './CacheStatsCards';
import {
  useCacheAnalytics,
  useCacheWarmingStatus,
  useInvalidateAllCache,
  useInvalidateTarotistaCache,
  useTriggerCacheWarming,
} from '@/hooks/api/useCacheAnalytics';
import { useTarotistas } from '@/hooks/api/useTarotistas';

export function CacheManagementContent() {
  const [selectedTarotista, setSelectedTarotista] = useState<string>('');

  // Queries separadas (endpoints diferentes)
  const { data: analytics, isLoading, error, refetch } = useCacheAnalytics();
  const {
    data: warmingStatus,
    isLoading: warmingLoading,
    error: warmingError,
    refetch: refetchWarming,
  } = useCacheWarmingStatus();
  const { data: tarotistasResponse } = useTarotistas();

  // Mutations
  const invalidateAll = useInvalidateAllCache();
  const invalidateTarotista = useInvalidateTarotistaCache();
  const triggerWarming = useTriggerCacheWarming();

  const handleInvalidateAll = () => {
    invalidateAll.mutate(undefined, {
      onSuccess: (response) => {
        toast.success(`Caché invalidado: ${response.deletedCount} entradas eliminadas`);
        refetch();
      },
      onError: (error: Error) => {
        toast.error(`Error al invalidar caché: ${error.message}`);
      },
    });
  };

  const handleInvalidateTarotista = () => {
    if (!selectedTarotista) {
      toast.error('Selecciona un tarotista');
      return;
    }

    invalidateTarotista.mutate(Number(selectedTarotista), {
      onSuccess: (response) => {
        toast.success(`Caché de tarotista invalidado: ${response.deletedCount} entradas`);
        setSelectedTarotista('');
        refetch();
      },
      onError: (error: Error) => {
        toast.error(`Error: ${error.message}`);
      },
    });
  };

  const handleTriggerWarming = () => {
    triggerWarming.mutate(
      { topN: 100 },
      {
        onSuccess: (response) => {
          if (response.started) {
            toast.success(
              `Cache warming iniciado: ${response.totalCombinations || 100} combinaciones`
            );
            refetchWarming();
          } else {
            toast.warning(response.message || 'Warming ya en ejecución');
          }
        },
        onError: (error: Error) => {
          toast.error(`Error: ${error.message}`);
        },
      }
    );
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">Error al cargar datos de caché</p>
        <Button onClick={() => refetch()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  if (isLoading || !analytics) {
    return <div className="py-12 text-center">Cargando...</div>;
  }

  const tarotistas = tarotistasResponse?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Caché</h2>
          <p className="text-muted-foreground">
            Monitoreo y control del sistema de caché de interpretaciones
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refrescar Stats
        </Button>
      </div>

      {/* Stats Cards - usa estructura correcta del backend */}
      <CacheStatsCards
        hitRate={analytics.hitRate}
        savings={analytics.savings}
        responseTime={analytics.responseTime}
      />

      {/* Top Combinations */}
      <Card>
        <CardHeader>
          <CardTitle>Combinaciones Más Cacheadas (Top 10)</CardTitle>
          <CardDescription>
            Combinaciones de cartas más frecuentemente servidas desde caché
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topCombinations.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No hay combinaciones cacheadas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cache Key</TableHead>
                  <TableHead>Card IDs</TableHead>
                  <TableHead>Spread ID</TableHead>
                  <TableHead className="text-right">Hit Count</TableHead>
                  <TableHead className="text-right">Última Uso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topCombinations.map((combo) => (
                  <TableRow key={combo.cacheKey}>
                    <TableCell className="font-mono text-xs">
                      {combo.cacheKey.substring(0, 12)}...
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      [{combo.cardIds.join(', ')}]
                    </TableCell>
                    <TableCell>{combo.spreadId ?? 'N/A'}</TableCell>
                    <TableCell className="text-right">{combo.hitCount}</TableCell>
                    <TableCell className="text-right">
                      {new Date(combo.lastUsedAt).toLocaleString('es-ES')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invalidation Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones de Invalidación</CardTitle>
          <CardDescription>Eliminar entradas del caché manualmente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Invalidate All */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Invalidar Todo el Caché</p>
              <p className="text-muted-foreground text-sm">
                Elimina todas las entradas del caché (requiere confirmación)
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={invalidateAll.isPending}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Invalidar Todo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará todas las entradas del caché. Los usuarios experimentarán
                    tiempos de respuesta más lentos hasta que el caché se regenere.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleInvalidateAll}>
                    Confirmar Invalidación
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Invalidate by Tarotista */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="mb-2 font-medium">Invalidar por Tarotista</p>
              <Select value={selectedTarotista} onValueChange={setSelectedTarotista}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tarotista" />
                </SelectTrigger>
                <SelectContent>
                  {tarotistas.map((tarotista) => (
                    <SelectItem key={tarotista.id} value={tarotista.id.toString()}>
                      {tarotista.nombrePublico}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleInvalidateTarotista}
              disabled={!selectedTarotista || invalidateTarotista.isPending}
              className="mt-8"
            >
              Invalidar
            </Button>
          </div>

          {/* NOTA: No existe endpoint para invalidar por spread en el backend */}
        </CardContent>
      </Card>

      {/* Warming Status */}
      {warmingStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Cache Warming</CardTitle>
            <CardDescription>Estado y control del precalentamiento de caché</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Estado Actual</p>
                <p className="text-lg font-bold">
                  {warmingStatus.isRunning ? (
                    <span className="text-yellow-600">En ejecución...</span>
                  ) : (
                    <span className="text-green-600">Inactivo</span>
                  )}
                </p>
              </div>
              {warmingStatus.isRunning && (
                <>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Progreso</p>
                    <p className="text-lg font-bold">{warmingStatus.progress.toFixed(1)}%</p>
                    <p className="text-muted-foreground text-xs">
                      {warmingStatus.processedCombinations} / {warmingStatus.totalCombinations}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Éxitos / Errores</p>
                    <p className="text-lg font-bold">
                      {warmingStatus.successCount} / {warmingStatus.errorCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Tiempo Restante</p>
                    <p className="text-lg font-bold">
                      ~{warmingStatus.estimatedTimeRemainingMinutes} min
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-medium">Ejecutar Warming Ahora</p>
                <p className="text-muted-foreground text-sm">
                  Precalentar el caché con las top 100 combinaciones más comunes
                </p>
              </div>
              <Button
                onClick={handleTriggerWarming}
                disabled={warmingStatus.isRunning || triggerWarming.isPending}
              >
                <Play className="mr-2 h-4 w-4" />
                Ejecutar Warming
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {warmingLoading && (
        <p className="text-muted-foreground text-center">Cargando warming status...</p>
      )}
      {warmingError && (
        <p className="text-destructive text-center">Error al cargar warming status</p>
      )}
    </div>
  );
}
