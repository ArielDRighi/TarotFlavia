/**
 * CacheManagementContent - Main component for cache management page
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
  useInvalidateAllCache,
  useInvalidateTarotistaCache,
  useInvalidateSpreadCache,
  useTriggerCacheWarming,
} from '@/hooks/api/useCacheAnalytics';
import { useTarotistas } from '@/hooks/api/useTarotistas';
import { useSpreads } from '@/hooks/api/useReadings';

export function CacheManagementContent() {
  const [selectedTarotista, setSelectedTarotista] = useState<string>('');
  const [selectedSpread, setSelectedSpread] = useState<string>('');

  // Queries
  const { data: analytics, isLoading, error, refetch } = useCacheAnalytics();
  const { data: tarotistasResponse } = useTarotistas();
  const { data: spreadsResponse } = useSpreads();

  // Mutations
  const invalidateAll = useInvalidateAllCache();
  const invalidateTarotista = useInvalidateTarotistaCache();
  const invalidateSpread = useInvalidateSpreadCache();
  const triggerWarming = useTriggerCacheWarming();

  const handleInvalidateAll = () => {
    invalidateAll.mutate(undefined, {
      onSuccess: (response) => {
        toast.success(`Caché invalidado: ${response.entriesDeleted} entradas eliminadas`);
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
        toast.success(`Caché de tarotista invalidado: ${response.entriesDeleted} entradas`);
        setSelectedTarotista('');
        refetch();
      },
      onError: (error: Error) => {
        toast.error(`Error: ${error.message}`);
      },
    });
  };

  const handleInvalidateSpread = () => {
    if (!selectedSpread) {
      toast.error('Selecciona un spread');
      return;
    }

    invalidateSpread.mutate(Number(selectedSpread), {
      onSuccess: (response) => {
        toast.success(`Caché de spread invalidado: ${response.entriesDeleted} entradas`);
        setSelectedSpread('');
        refetch();
      },
      onError: (error: Error) => {
        toast.error(`Error: ${error.message}`);
      },
    });
  };

  const handleTriggerWarming = () => {
    triggerWarming.mutate(undefined, {
      onSuccess: (response) => {
        toast.success(`Cache warming iniciado: ${response.entriesWarmed} entradas`);
        refetch();
      },
      onError: (error: Error) => {
        toast.error(`Error: ${error.message}`);
      },
    });
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
  const spreads = spreadsResponse || [];

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

      {/* Stats Cards */}
      <CacheStatsCards stats={analytics.stats} />

      {/* Top Combinations */}
      <Card>
        <CardHeader>
          <CardTitle>Combinaciones Más Cacheadas (Top 10)</CardTitle>
          <CardDescription>Combinaciones tarotista-spread-categoría más frecuentes</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topCombinations.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No hay combinaciones cacheadas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarotista</TableHead>
                  <TableHead>Spread</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Hit Count</TableHead>
                  <TableHead className="text-right">Última Actualización</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topCombinations.map((combo, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{combo.tarotistaName}</TableCell>
                    <TableCell>{combo.spreadName}</TableCell>
                    <TableCell>{combo.categoryName}</TableCell>
                    <TableCell className="text-right">{combo.hitCount}</TableCell>
                    <TableCell className="text-right">
                      {new Date(combo.lastUpdated).toLocaleString('es-ES')}
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
                    Esta acción eliminará {analytics.stats.totalEntries} entradas del caché. Los
                    usuarios experimentarán tiempos de respuesta más lentos hasta que el caché se
                    regenere.
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

          {/* Invalidate by Spread */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="mb-2 font-medium">Invalidar por Spread</p>
              <Select value={selectedSpread} onValueChange={setSelectedSpread}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar spread" />
                </SelectTrigger>
                <SelectContent>
                  {spreads.map((spread) => (
                    <SelectItem key={spread.id} value={spread.id.toString()}>
                      {spread.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleInvalidateSpread}
              disabled={!selectedSpread || invalidateSpread.isPending}
              className="mt-8"
            >
              Invalidar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warming Status */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Warming</CardTitle>
          <CardDescription>Estado y control del precalentamiento de caché</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Estado Actual</p>
              <p className="text-lg font-bold">
                {analytics.warmingStatus.isRunning ? (
                  <span className="text-yellow-600">En ejecución...</span>
                ) : (
                  <span className="text-green-600">Inactivo</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Última Ejecución</p>
              <p className="text-lg font-bold">
                {analytics.warmingStatus.lastExecutionAt
                  ? new Date(analytics.warmingStatus.lastExecutionAt).toLocaleString('es-ES')
                  : 'Nunca'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Próxima Ejecución</p>
              <p className="text-lg font-bold">
                {analytics.warmingStatus.nextScheduledAt
                  ? new Date(analytics.warmingStatus.nextScheduledAt).toLocaleString('es-ES')
                  : 'No programada'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <p className="font-medium">Ejecutar Warming Ahora</p>
              <p className="text-muted-foreground text-sm">
                Precalentar el caché con las combinaciones más comunes
              </p>
            </div>
            <Button
              onClick={handleTriggerWarming}
              disabled={analytics.warmingStatus.isRunning || triggerWarming.isPending}
            >
              <Play className="mr-2 h-4 w-4" />
              Ejecutar Warming
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
