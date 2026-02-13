/**
 * Placeholder: Página de Resultado de Carta Astral por ID (Premium)
 *
 * Página temporal para mostrar carta astral guardada (usuarios Premium).
 * TODO (T-CA-031): Implementar visualización completa con SVG e interpretaciones.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { Loader2, Star, AlertCircle } from 'lucide-react';

import { useSavedChart } from '@/hooks/api/useBirthChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function SavedBirthChartResultPage() {
  const router = useRouter();
  const params = useParams();
  const chartId = typeof params.id === 'string' ? parseInt(params.id, 10) : 0;

  const { data: chart, isLoading, error } = useSavedChart(chartId, chartId > 0);

  if (isLoading) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudo cargar la carta astral. Es posible que no exista o no tengas permisos para
            verla.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push('/carta-astral')} variant="outline">
            Volver al formulario
          </Button>
        </div>
      </div>
    );
  }

  if (!chart) {
    return null;
  }

  return (
    <div className="container max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
          <Star className="text-primary h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Tu Carta Astral</h1>
        <p className="text-muted-foreground mt-2">Carta guardada #{chartId}</p>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Página en Construcción</CardTitle>
          <CardDescription>
            Esta es una página placeholder. La visualización completa de la carta astral guardada
            con todas las interpretaciones se implementará en la tarea T-CA-031.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm font-medium">Carta cargada correctamente:</p>
            <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
              <li>✓ ID de carta: {chartId}</li>
              <li>✓ Planetas: {chart.planets?.length || 0}</li>
              <li>✓ Casas: {chart.houses?.length || 0}</li>
              <li>✓ Aspectos: {chart.aspects?.length || 0}</li>
              {chart.aiSynthesis && <li>✓ Síntesis con IA disponible</li>}
            </ul>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push('/carta-astral')} variant="outline">
              Nueva carta
            </Button>
            <Button onClick={() => router.push('/historial')}>Ver historial</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
