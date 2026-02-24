'use client';

/**
 * BirthChartPageContent
 *
 * Feature component containing all logic for the Carta Astral main page.
 * Extracted from app/carta-astral/page.tsx to comply with the architecture rule
 * that app/ pages must not contain business logic (useState, useEffect, hooks).
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Sparkles, Crown, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

import { RateLimitError } from '@/lib/api/axios-config';

import { BirthDataForm } from '@/components/features/birth-chart/BirthDataForm/BirthDataForm';
import type { BirthDataFormValues } from '@/components/features/birth-chart/BirthDataForm/BirthDataForm.schema';
import {
  useGenerateChart,
  useGenerateChartAnonymous,
  useCanGenerateChart,
} from '@/hooks/api/useBirthChart';
import { useAuth } from '@/hooks/useAuth';
import { useBirthChartStore } from '@/stores/birthChartStore';
import type { ChartResponse, GenerateChartRequest } from '@/types/birth-chart-api.types';
import { isPremiumChartResponse } from '@/types/birth-chart-api.types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function BirthChartPageContent() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const {
    canGenerate,
    remaining,
    isLoading: usageLoading,
    message: usageMessage,
  } = useCanGenerateChart();
  const { setChartResult, setFormData } = useBirthChartStore();

  const [error, setError] = useState<string | null>(null);

  function handleSuccess(data: ChartResponse) {
    // Guardar resultado en store
    setChartResult(data);

    // Si es Premium y se guardó, redirigir al ID
    if (isPremiumChartResponse(data) && data.savedChartId) {
      router.push(`/carta-astral/resultado/${data.savedChartId}`);
    } else {
      // Para otros planes, ir a resultado temporal
      router.push('/carta-astral/resultado');
    }
  }

  function handleError(err: unknown) {
    // Detectar RateLimitError
    if (err instanceof RateLimitError) {
      setError(err.message || 'Has alcanzado el límite de uso.');
      return;
    }

    // Detectar AxiosError
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 429) {
        setError(message || 'Has alcanzado el límite de uso.');
      } else if (message) {
        setError(message);
      } else {
        setError('Error al generar la carta astral. Por favor intenta de nuevo.');
      }
      return;
    }

    // Error genérico
    setError('Error al generar la carta astral. Por favor intenta de nuevo.');
  }

  // Usar el hook apropiado según autenticación
  const generateChart = useGenerateChart({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const generateChartAnonymous = useGenerateChartAnonymous({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  function handleSubmit(data: BirthDataFormValues) {
    setError(null);
    setFormData(data);

    const request: GenerateChartRequest = {
      name: data.name,
      birthDate: data.birthDate,
      birthTime: data.birthTime,
      birthPlace: data.birthPlace,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      orbSystem: data.orbSystem,
    };

    if (isAuthenticated) {
      generateChart.mutate(request);
    } else {
      generateChartAnonymous.mutate(request);
    }
  }

  const isSubmitting = generateChart.isPending || generateChartAnonymous.isPending;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
          <Star className="text-primary h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Carta Astral</h1>
        <p className="text-muted-foreground mt-2">
          Descubre el mapa del cielo en el momento de tu nacimiento
        </p>
      </div>

      {/* Badges de plan */}
      <div className="mb-6 flex justify-center gap-2">
        {!isAuthenticated && (
          <Badge variant="secondary">
            <Sparkles className="mr-1 h-3 w-3" />1 carta gratis
          </Badge>
        )}
        {isAuthenticated && user?.plan === 'free' && (
          <Badge variant="secondary">Quedan {remaining} cartas este mes</Badge>
        )}
        {isAuthenticated && user?.plan === 'premium' && (
          <Badge variant="default" className="bg-amber-500">
            <Crown className="mr-1 h-3 w-3" />
            Premium • Cartas ilimitadas
          </Badge>
        )}
      </div>

      {/* Error global */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Card principal con formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Datos de nacimiento</CardTitle>
          <CardDescription>
            Ingresa tu información para calcular tu carta astral natal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canGenerate || usageLoading ? (
            <BirthDataForm
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
              disabled={!canGenerate || usageLoading}
              showUsageWarning={remaining === 1 && user?.plan !== 'premium'}
              usageMessage={
                remaining === 1 && user?.plan !== 'premium'
                  ? 'Esta es tu última carta disponible del período.'
                  : undefined
              }
            />
          ) : (
            <div className="space-y-4 py-8 text-center">
              <AlertCircle className="text-muted-foreground mx-auto h-12 w-12" />
              <p className="text-muted-foreground">{usageMessage}</p>

              {!isAuthenticated && (
                <div className="space-y-2">
                  <p className="text-sm">Crea una cuenta gratuita para generar más cartas.</p>
                  <Button asChild>
                    <Link href="/registro">Crear cuenta gratis</Link>
                  </Button>
                </div>
              )}

              {isAuthenticated && user?.plan === 'free' && (
                <div className="space-y-2">
                  <p className="text-sm">
                    Actualiza a Premium para obtener cartas ilimitadas y síntesis personalizada con
                    IA.
                  </p>
                  <Button asChild>
                    <Link href="/premium">Ver planes Premium</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info adicional según plan */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">¿Qué incluye?</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            <ul className="space-y-1">
              <li>✓ Gráfico de tu carta natal</li>
              <li>✓ Posiciones planetarias</li>
              <li>✓ Tu &quot;Big Three&quot; (Sol, Luna, Ascendente)</li>
              {isAuthenticated && user?.plan !== 'anonymous' && (
                <>
                  <li>✓ Interpretaciones completas</li>
                  <li>✓ Descarga en PDF</li>
                </>
              )}
              {user?.plan === 'premium' && (
                <>
                  <li>✓ Síntesis personalizada con IA</li>
                  <li>✓ Historial de cartas</li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Importante</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            <p>
              Para obtener resultados precisos, es fundamental conocer la hora exacta de nacimiento.
              Esta información suele encontrarse en el certificado de nacimiento.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
