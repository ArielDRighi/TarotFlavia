/**
 * Placeholder: Página de Resultado de Carta Astral (Temporal)
 *
 * Página temporal para mostrar resultado de carta astral.
 * TODO (T-CA-031): Implementar visualización completa con SVG e interpretaciones.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Star } from 'lucide-react';

import { useBirthChartStore } from '@/stores/birthChartStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BirthChartResultPage() {
  const router = useRouter();
  const { chartResult, formData } = useBirthChartStore();

  useEffect(() => {
    // Si no hay resultado en store, redirigir a la página principal
    if (!chartResult) {
      router.push('/carta-astral');
    }
  }, [chartResult, router]);

  if (!chartResult) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
          <Star className="text-primary h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Tu Carta Astral</h1>
        {formData?.name && (
          <p className="text-muted-foreground mt-2">Carta natal de {formData.name}</p>
        )}
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Página en Construcción</CardTitle>
          <CardDescription>
            Esta es una página placeholder. La visualización completa de la carta astral con
            interpretaciones se implementará en la tarea T-CA-031.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm font-medium">Datos recibidos:</p>
            <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
              <li>✓ Fecha de nacimiento: {formData?.birthDate}</li>
              <li>✓ Hora de nacimiento: {formData?.birthTime}</li>
              <li>✓ Lugar de nacimiento: {formData?.birthPlace}</li>
              <li>✓ Planetas calculados: {chartResult.planets?.length || 0}</li>
              <li>✓ Casas calculadas: {chartResult.houses?.length || 0}</li>
              <li>✓ Aspectos calculados: {chartResult.aspects?.length || 0}</li>
            </ul>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push('/carta-astral')} variant="outline">
              Volver al formulario
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
