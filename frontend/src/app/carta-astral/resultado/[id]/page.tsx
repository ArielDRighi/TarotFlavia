/**
 * Página de Carta Astral Guardada (Premium)
 *
 * Muestra una carta guardada del historial con acciones:
 * - Renombrar
 * - Descargar PDF
 * - Eliminar
 */

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Pencil,
  Trash2,
  MoreVertical,
  Check,
  X,
  RefreshCw,
  Crown,
  Star,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

// Hooks
import { useSavedChart, useRenameChart, useDeleteChart } from '@/hooks/api/useBirthChart';
import { useDownloadSavedChartPdf } from '@/hooks/api/useDownloadPdf';

// Componentes de carta astral
import { ChartWheel } from '@/components/features/birth-chart/ChartWheel/ChartWheel';
import { BigThree } from '@/components/features/birth-chart/BigThree/BigThree';
import { PlanetPositionsTable } from '@/components/features/birth-chart/PlanetPositionsTable/PlanetPositionsTable';
import { AspectsTable } from '@/components/features/birth-chart/AspectsTable/AspectsTable';
import { ElementDistribution } from '@/components/features/birth-chart/ElementDistribution/ElementDistribution';
import { PlanetInterpretation } from '@/components/features/birth-chart/PlanetInterpretation/PlanetInterpretation';
import { AISynthesis } from '@/components/features/birth-chart/AISynthesis/AISynthesis';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Skeleton } from '@/components/ui/skeleton';

export default function SavedChartPage() {
  const router = useRouter();
  const params = useParams();
  const chartId = Number(params.id);
  const isValidId = Number.isFinite(chartId) && chartId > 0;

  // Estados locales
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // Queries y mutations
  const { data: chart, isLoading, error } = useSavedChart(chartId, isValidId);
  const renameChart = useRenameChart();
  const deleteChart = useDeleteChart();
  const downloadPdf = useDownloadSavedChartPdf();

  // Iniciar edición de nombre
  const handleStartEdit = () => {
    if (!chart) return;
    setEditName(chart.name || '');
    setIsEditing(true);
  };

  // Guardar nombre editado
  const handleSaveEdit = () => {
    if (!editName.trim()) return;

    renameChart.mutate(
      { id: chartId, name: editName.trim() },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName('');
  };

  // Eliminar carta
  const handleDelete = () => {
    deleteChart.mutate(chartId, {
      onSuccess: () => {
        router.push('/carta-astral/historial');
      },
    });
  };

  // Descargar PDF
  const handleDownloadPdf = () => {
    if (!chart) return;
    downloadPdf.mutate({
      chartId,
      filename: `${chart.name || 'carta-astral'}.pdf`,
    });
  };

  // Validar ID antes de cargar
  if (!isValidId) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">ID de carta inválido</h1>
        <p className="text-muted-foreground mb-6">El identificador de la carta no es válido.</p>
        <Button asChild>
          <Link href="/carta-astral/historial">Ir a mi historial</Link>
        </Button>
      </div>
    );
  }

  // Estado de carga
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Estado de error
  if (error || !chart) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Carta no encontrada</h1>
        <p className="text-muted-foreground mb-6">
          La carta que buscas no existe o no tienes acceso a ella.
        </p>
        <Button asChild>
          <Link href="/carta-astral/historial">Ir a mi historial</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      {/* Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          {/* Breadcrumb - Volver al historial */}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/carta-astral/historial">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Mi historial
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            {/* Badge Premium */}
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
              <Crown className="mr-1 h-3 w-3" />
              Guardada
            </Badge>

            {/* Botón descargar PDF (solo si el backend lo permite) */}
            {chart.canDownloadPdf && (
              <Button
                size="sm"
                onClick={handleDownloadPdf}
                disabled={downloadPdf.isPending || !chart.canDownloadPdf}
              >
                {downloadPdf.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                PDF
              </Button>
            )}

            {/* Menú de acciones */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="menu-button"
                  aria-label="Abrir menú de acciones"
                  title="Abrir menú de acciones"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleStartEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Renombrar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Título editable */}
        <div className="mb-8 text-center">
          {isEditing ? (
            <div className="mx-auto flex max-w-md items-center justify-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-center text-xl font-bold"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSaveEdit}
                disabled={renameChart.isPending}
                data-testid="save-edit-button"
              >
                {renameChart.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCancelEdit}
                data-testid="cancel-edit-button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <h1 className="text-3xl font-bold tracking-tight">{chart.name || 'Carta Astral'}</h1>
          )}
          <p className="text-muted-foreground mt-1">
            Guardada el{' '}
            {new Date(chart.createdAt).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Síntesis IA (Premium) */}
        {chart.aiSynthesis && (
          <div className="mb-8">
            <AISynthesis data={chart.aiSynthesis} />
          </div>
        )}

        {/* Gráfico de la carta */}
        <div className="mb-8">
          <Card className="mx-auto max-w-2xl" data-testid="chart-wheel-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="text-primary h-5 w-5" />
                Carta Natal
              </CardTitle>
              <CardDescription>Posición de los planetas</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartWheel
                data={chart.chartSvgData}
                size={400}
                showAspects={true}
                interactive={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Big Three */}
        <div className="mb-8">
          <BigThree data={chart.bigThree} variant="hero" showInterpretations={true} />
        </div>

        {/* Tabs: Posiciones / Aspectos / Distribución */}
        <Tabs defaultValue="positions" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="positions">Posiciones</TabsTrigger>
            <TabsTrigger value="aspects">Aspectos</TabsTrigger>
            <TabsTrigger value="distribution">Distribución</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="mt-4">
            <PlanetPositionsTable planets={chart.planets} showCard={true} />
          </TabsContent>

          <TabsContent value="aspects" className="mt-4">
            <AspectsTable aspects={chart.aspects} showCard={true} />
          </TabsContent>

          <TabsContent value="distribution" className="mt-4">
            <ElementDistribution distribution={chart.distribution} showCard={true} />
          </TabsContent>
        </Tabs>

        {/* Interpretaciones */}
        {chart.interpretations && (
          <section className="mb-8">
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Sparkles className="text-primary h-6 w-6" />
                Interpretaciones
              </h2>
            </div>

            <div className="space-y-4">
              {chart.interpretations.planets.map((planetInterp) => (
                <PlanetInterpretation
                  key={planetInterp.planet}
                  interpretation={planetInterp}
                  showAspects={true}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta carta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La carta será eliminada permanentemente de tu
              historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteChart.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
