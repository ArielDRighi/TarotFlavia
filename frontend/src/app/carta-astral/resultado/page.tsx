/**
 * Página de Resultado de Carta Astral
 *
 * Muestra la carta astral completa con gráfico, interpretaciones y síntesis IA.
 * Incluye upsells contextuales según el plan del usuario.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download,
  Share2,
  ArrowLeft,
  Star,
  Sparkles,
  Crown,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

// Store y hooks
import { useBirthChartStore } from '@/stores/birthChartStore';
import { useDownloadPdf } from '@/hooks/api/useDownloadPdf';

// Tipos
import { isFullChartResponse, isPremiumChartResponse } from '@/types/birth-chart-api.types';

// Componentes de carta astral
import { ChartWheel } from '@/components/features/birth-chart/ChartWheel/ChartWheel';
import { BigThree } from '@/components/features/birth-chart/BigThree/BigThree';
import { PlanetPositionsTable } from '@/components/features/birth-chart/PlanetPositionsTable/PlanetPositionsTable';
import { AspectsTable } from '@/components/features/birth-chart/AspectsTable/AspectsTable';
import { ElementDistribution } from '@/components/features/birth-chart/ElementDistribution/ElementDistribution';
import { PlanetInterpretation } from '@/components/features/birth-chart/PlanetInterpretation/PlanetInterpretation';
import {
  AISynthesis,
  AISynthesisPlaceholder,
} from '@/components/features/birth-chart/AISynthesis/AISynthesis';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function ChartResultPage() {
  const router = useRouter();
  const { chartResult, formData, reset } = useBirthChartStore();
  const downloadPdf = useDownloadPdf();

  const [showAllPlanets, setShowAllPlanets] = useState(false);

  // Redirigir si no hay resultado
  useEffect(() => {
    if (!chartResult) {
      router.replace('/carta-astral');
    }
  }, [chartResult, router]);

  // Verificar si Web Share API está disponible (estado derivado - SSR safe)
  const canShare = typeof window !== 'undefined' && typeof window.navigator?.share === 'function';

  if (!chartResult || !formData) {
    return null;
  }

  // Determinar tipo de respuesta
  const isFull = isFullChartResponse(chartResult);
  const isPremium = isPremiumChartResponse(chartResult);

  // Manejar descarga de PDF
  const handleDownloadPdf = () => {
    if (!formData) return;
    downloadPdf.mutate({
      chartData: {
        name: formData.name,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        birthPlace: formData.birthPlace,
        latitude: formData.latitude,
        longitude: formData.longitude,
        timezone: formData.timezone,
      },
    });
  };

  // Manejar compartir (Web Share API)
  const handleShare = async () => {
    if (typeof window === 'undefined' || typeof window.navigator?.share !== 'function') return;

    try {
      await window.navigator.share({
        title: `Carta Astral de ${formData.name}`,
        text: `Mi Big Three: Sol en ${chartResult.bigThree.sun.signName}, Luna en ${chartResult.bigThree.moon.signName}, Ascendente en ${chartResult.bigThree.ascendant.signName}`,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Nueva carta
  const handleNewChart = () => {
    reset();
    router.push('/carta-astral');
  };

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      {/* Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleNewChart}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nueva carta
          </Button>

          <div className="flex items-center gap-2">
            {/* Badge de plan */}
            {isPremium && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                <Crown className="mr-1 h-3 w-3" />
                Premium
              </Badge>
            )}

            {/* Botón compartir */}
            {canShare && (
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
            )}

            {/* Botón descargar PDF */}
            {(isFull || isPremium) && (
              <Button size="sm" onClick={handleDownloadPdf} disabled={downloadPdf.isPending}>
                {downloadPdf.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Descargar PDF
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-6xl px-4 py-8">
        {/* Título */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Carta Astral de {formData.name}</h1>
          <p className="text-muted-foreground mt-1">
            {(() => {
              const [year, month, day] = formData.birthDate.split('-').map(Number);
              const localBirthDate = new Date(year, month - 1, day);
              return localBirthDate.toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });
            })()}{' '}
            • {formData.birthTime} • {formData.birthPlace}
          </p>
        </div>

        {/* Síntesis IA (Premium - arriba de todo) */}
        {isPremium && chartResult.aiSynthesis && (
          <div className="mb-8">
            <AISynthesis data={chartResult.aiSynthesis} />
          </div>
        )}

        {/* Grid principal: Gráfico + Big Three */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Gráfico de la carta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="text-primary h-5 w-5" />
                Tu Carta Natal
              </CardTitle>
              <CardDescription>
                Posición de los planetas el {formData.birthDate} a las {formData.birthTime}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartWheel
                data={chartResult.chartSvgData}
                size={400}
                showAspects={true}
                showControls={true}
                interactive={true}
              />
            </CardContent>
          </Card>

          {/* Big Three */}
          <BigThree data={chartResult.bigThree} variant="hero" showInterpretations={true} />
        </div>

        {/* Tabs: Posiciones / Aspectos / Distribución */}
        <Tabs defaultValue="positions" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="positions">Posiciones</TabsTrigger>
            <TabsTrigger value="aspects">Aspectos</TabsTrigger>
            <TabsTrigger value="distribution">Distribución</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="mt-4">
            <PlanetPositionsTable planets={chartResult.planets} showCard={true} />
          </TabsContent>

          <TabsContent value="aspects" className="mt-4">
            <AspectsTable aspects={chartResult.aspects} showCard={true} showFilters={true} />
          </TabsContent>

          <TabsContent value="distribution" className="mt-4">
            {isFull ? (
              <ElementDistribution
                distribution={chartResult.distribution}
                showCard={true}
                showModalities={true}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    La distribución de elementos está disponible para usuarios registrados.
                  </p>
                  <Button asChild>
                    <Link href="/registro">Crear cuenta gratis</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Interpretaciones completas (Free y Premium) */}
        {isFull && chartResult.interpretations && (
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Sparkles className="text-primary h-6 w-6" />
                Interpretaciones
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllPlanets(!showAllPlanets)}
              >
                {showAllPlanets ? 'Mostrar menos' : 'Mostrar todos'}
                {showAllPlanets ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-1 h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {chartResult.interpretations.planets
                .slice(0, showAllPlanets ? undefined : 3)
                .map((planetInterp) => {
                  return (
                    <PlanetInterpretation
                      key={planetInterp.planet}
                      interpretation={planetInterp}
                      showAspects={true}
                    />
                  );
                })}
            </div>

            {!showAllPlanets && chartResult.interpretations.planets.length > 3 && (
              <p className="text-muted-foreground mt-4 text-center text-sm">
                Mostrando 3 de {chartResult.interpretations.planets.length} planetas
              </p>
            )}
          </section>
        )}

        {/* Upsell para Free (sin interpretaciones completas) */}
        {!isFull && (
          <Card className="mb-8">
            <CardContent className="py-12 text-center">
              <Sparkles className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-xl font-semibold">
                Desbloquea las interpretaciones completas
              </h3>
              <p className="text-muted-foreground mx-auto mb-6 max-w-md">
                Crea una cuenta gratuita para acceder a las interpretaciones detalladas de cada
                planeta en tu carta.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/registro">Crear cuenta gratis</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login">Ya tengo cuenta</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upsell para Free → Premium (síntesis IA) */}
        {isFull && !isPremium && <AISynthesisPlaceholder className="mb-8" />}

        {/* Footer de acciones */}
        <div className="flex flex-col justify-center gap-4 border-t pt-8 sm:flex-row">
          <Button variant="outline" onClick={handleNewChart}>
            <Star className="mr-2 h-4 w-4" />
            Generar otra carta
          </Button>

          {isPremium && (
            <Button variant="outline" asChild>
              <Link href="/historial">Ver mi historial</Link>
            </Button>
          )}

          {(isFull || isPremium) && (
            <Button onClick={handleDownloadPdf} disabled={downloadPdf.isPending}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
