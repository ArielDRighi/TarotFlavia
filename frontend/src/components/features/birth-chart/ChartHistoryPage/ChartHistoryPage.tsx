'use client';

/**
 * Componente de Historial de Cartas Astrales
 * T-CA-042: Permite a usuarios Premium ver, buscar, ordenar y gestionar sus cartas guardadas
 */

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Grid3x3, List, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useChartHistory, useDeleteChart, useRenameChart } from '@/hooks/api/useBirthChart';
import { useDownloadSavedChartPdf } from '@/hooks/api/useDownloadPdf';
import { useAuth } from '@/hooks/useAuth';
import {
  SavedChartCard,
  SavedChartCardSkeleton,
} from '@/components/features/birth-chart/SavedChartCard/SavedChartCard';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/utils/useToast';
import type { SavedChart } from '@/types/birth-chart.types';

type SortOption = 'newest' | 'oldest' | 'name';
type ViewMode = 'grid' | 'list';

const ITEMS_PER_PAGE = 6;
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 50;

export function ChartHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // Estado local
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState<SavedChart | null>(null);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');

  // Hooks API
  const { data: historyData, isLoading, error } = useChartHistory(page, ITEMS_PER_PAGE);
  const { mutate: deleteChart, isPending: isDeleting } = useDeleteChart();
  const { mutate: renameChart, isPending: isRenaming } = useRenameChart();
  const { mutate: downloadPdf } = useDownloadSavedChartPdf();

  // Verificar si el usuario es Premium
  const isPremium = user?.plan === 'premium';

  // Filtrar y ordenar cartas
  const filteredAndSortedCharts = useMemo(() => {
    if (!historyData?.data) return [];

    let charts = [...historyData.data];

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      charts = charts.filter((chart) => chart.name.toLowerCase().includes(query));
    }

    // Ordenar
    charts.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return charts;
  }, [historyData, searchQuery, sortBy]);

  // Handlers
  const handleView = useCallback(
    (chart: SavedChart) => {
      router.push(`/carta-astral/resultado/${chart.id}`);
    },
    [router]
  );

  const handleDownload = useCallback(
    (chart: SavedChart) => {
      downloadPdf(
        {
          chartId: chart.id,
          filename: `carta-astral-${chart.name.replace(/\s+/g, '-')}.pdf`,
        },
        {
          onSuccess: () => {
            toast.success('PDF descargado', {
              description: 'La carta astral se descargó correctamente.',
            });
          },
          onError: () => {
            toast.error('Error al descargar', {
              description: 'No se pudo descargar el PDF. Intenta de nuevo.',
            });
          },
        }
      );
    },
    [downloadPdf, toast]
  );

  const handleOpenRenameDialog = useCallback((chart: SavedChart) => {
    setSelectedChart(chart);
    setNewName(chart.name);
    setNameError('');
    setRenameDialogOpen(true);
  }, []);

  const validateName = useCallback((name: string): boolean => {
    const trimmedName = name.trim();

    if (trimmedName.length < MIN_NAME_LENGTH) {
      setNameError(`El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`);
      return false;
    }

    if (trimmedName.length > MAX_NAME_LENGTH) {
      setNameError(`El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres`);
      return false;
    }

    setNameError('');
    return true;
  }, []);

  const handleRename = useCallback(() => {
    if (!selectedChart || !newName.trim()) return;

    if (!validateName(newName)) {
      return;
    }

    renameChart(
      {
        id: selectedChart.id,
        name: newName.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Carta renombrada', {
            description: 'El nombre se actualizó correctamente.',
          });
          setRenameDialogOpen(false);
          setSelectedChart(null);
          setNewName('');
          setNameError('');
        },
        onError: () => {
          toast.error('Error al renombrar', {
            description: 'No se pudo actualizar el nombre. Intenta de nuevo.',
          });
        },
      }
    );
  }, [selectedChart, newName, renameChart, toast, validateName]);

  const handleOpenDeleteDialog = useCallback((chart: SavedChart) => {
    setSelectedChart(chart);
    setDeleteDialogOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedChart) return;

    deleteChart(selectedChart.id, {
      onSuccess: () => {
        toast.success('Carta eliminada', {
          description: 'La carta se eliminó correctamente.',
        });
        setDeleteDialogOpen(false);
        setSelectedChart(null);
      },
      onError: () => {
        toast.error('Error al eliminar', {
          description: 'No se pudo eliminar la carta. Intenta de nuevo.',
        });
      },
    });
  }, [selectedChart, deleteChart, toast]);

  const handleNextPage = useCallback(() => {
    if (historyData?.meta.hasNextPage) {
      setPage((p) => p + 1);
    }
  }, [historyData?.meta.hasNextPage]);

  const handlePrevPage = useCallback(() => {
    if (historyData?.meta.hasPreviousPage) {
      setPage((p) => p - 1);
    }
  }, [historyData?.meta.hasPreviousPage]);

  // Renderizado condicional: usuario no Premium
  if (!isPremium) {
    return (
      <div data-testid="chart-history-page" className="container mx-auto max-w-7xl p-6">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
          <Sparkles className="text-primary h-16 w-16" />
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold">Función Premium</h2>
            <p className="text-muted-foreground">
              Esta función es exclusiva para usuarios Premium.
            </p>
            <p className="text-muted-foreground text-sm">
              Actualiza tu plan para acceder al historial de cartas guardadas.
            </p>
          </div>
          <Button onClick={() => router.push('/perfil')}>Actualizar Plan</Button>
        </div>
      </div>
    );
  }

  // Renderizado condicional: error
  if (error) {
    return (
      <div data-testid="chart-history-page" className="container mx-auto max-w-7xl p-6">
        <EmptyState
          title="Error al cargar historial"
          message="No se pudo cargar el historial de cartas. Por favor, intenta de nuevo."
          action={{
            label: 'Reintentar',
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  // Renderizado condicional: cargando
  if (isLoading) {
    return (
      <div data-testid="chart-history-page" className="container mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="bg-muted h-8 w-48 animate-pulse rounded" />
          <div className="bg-muted h-10 w-32 animate-pulse rounded" />
        </div>

        <div className="mb-6 flex gap-4">
          <div className="bg-muted h-10 w-full max-w-sm animate-pulse rounded" />
          <div className="bg-muted h-10 w-40 animate-pulse rounded" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <SavedChartCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Renderizado condicional: sin cartas
  if (!historyData?.data || historyData.data.length === 0) {
    return (
      <div data-testid="chart-history-page" className="container mx-auto max-w-7xl p-6">
        <h1 className="mb-6 font-serif text-3xl font-bold">Historial de Cartas</h1>
        <EmptyState
          title="No tienes cartas guardadas"
          message="Las cartas que generes se guardarán automáticamente aquí."
          action={{
            label: 'Generar Carta Astral',
            onClick: () => router.push('/carta-astral'),
          }}
        />
      </div>
    );
  }

  // Renderizado principal
  return (
    <div data-testid="chart-history-page" className="container mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Historial de Cartas</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            aria-label="Vista en cuadrícula"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            aria-label="Vista en lista"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Controles: Búsqueda y Ordenamiento */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(value) => {
            setSortBy(value as SortOption);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más recientes</SelectItem>
            <SelectItem value="oldest">Más antiguas</SelectItem>
            <SelectItem value="name">Nombre (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid/Lista de cartas */}
      {filteredAndSortedCharts.length === 0 ? (
        <EmptyState
          title="No se encontraron cartas"
          message="Intenta con otro término de búsqueda."
        />
      ) : (
        <>
          <div
            data-testid="charts-container"
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                : 'flex flex-col gap-4'
            }
          >
            {filteredAndSortedCharts.map((chart) => (
              <SavedChartCard
                key={chart.id}
                chart={chart}
                onView={() => handleView(chart)}
                onDownload={() => handleDownload(chart)}
                onRename={() => handleOpenRenameDialog(chart)}
                onDelete={() => handleOpenDeleteDialog(chart)}
              />
            ))}
          </div>

          {/* Paginación */}
          {historyData.meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={!historyData.meta.hasPreviousPage}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <span className="text-muted-foreground text-sm">
                Página {historyData.meta.page} de {historyData.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!historyData.meta.hasNextPage}
              >
                Siguiente
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Diálogo de renombrar */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar carta</DialogTitle>
            <DialogDescription>Ingresa un nuevo nombre para la carta astral.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nuevo nombre</Label>
              <Input
                id="new-name"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  // Validar en tiempo real mientras escribe
                  if (e.target.value.trim()) {
                    validateName(e.target.value);
                  } else {
                    setNameError('');
                  }
                }}
                placeholder="Ej: Mi Carta Personal"
                className={nameError ? 'border-destructive' : ''}
              />
              {nameError && (
                <p className="text-destructive text-sm" role="alert">
                  {nameError}
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                El nombre debe tener entre {MIN_NAME_LENGTH} y {MAX_NAME_LENGTH} caracteres.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRenameDialogOpen(false);
                setNameError('');
              }}
              disabled={isRenaming}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRename}
              disabled={isRenaming || !newName.trim() || !!nameError}
            >
              {isRenaming ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La carta &ldquo;{selectedChart?.name}&rdquo; será
              eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
