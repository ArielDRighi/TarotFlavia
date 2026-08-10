/**
 * AnimalHoroscopePanel Component
 *
 * Parte **interactiva** de `/horoscopo-chino/[animal]`: selector de animal,
 * selector de elemento Wu Xing y predicción del año.
 *
 * Depende de `useSearchParams` (el elemento viaja en la query string), así que
 * `AnimalHoroscopeRoute` lo monta dentro de un `<Suspense>`: sin ese límite, Next
 * deopta el prerender de **toda** la ruta y las 12 URLs sirven un cascarón vacío
 * al crawler (T-SEO-002).
 *
 * La ficha estática del animal —el contenido indexable— vive en `AnimalProfile`.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import {
  ChineseHoroscopeDetail,
  ChineseAnimalSelector,
  ElementSelectorModal,
} from '@/components/features/chinese-horoscope';
import { useAnimalHoroscopePage } from '@/hooks/utils/useAnimalHoroscopePage';
import { ROUTES } from '@/lib/constants/routes';

interface ErrorWithResponse {
  response?: { status: number };
}

function getErrorStatus(error: Error): number | null {
  const err = error as ErrorWithResponse;
  return err.response?.status ?? null;
}

export function AnimalHoroscopePanel() {
  const router = useRouter();
  const {
    animal,
    animalInfo,
    userAnimal,
    element,
    horoscopeData,
    isLoading,
    error,
    currentYear,
    showElementModal,
    handleElementSelect,
  } = useAnimalHoroscopePage();

  // El modal arranca cerrado y se abre a pedido (T-SEO-002).
  //
  // Antes se auto-abría cuando faltaba el elemento, y eso tapaba la ficha del
  // animal: además del overlay visual, Radix marca `aria-hidden` en el resto del
  // documento mientras el diálogo está abierto, así que el contenido recién
  // agregado quedaba invisible para lectores de pantalla. Ahora la ficha se lee
  // primero y el selector es un paso explícito.
  const [isElementModalOpen, setIsElementModalOpen] = useState(false);

  // `showElementModal` del hook significa "falta elegir elemento": no es el
  // animal del usuario y no vino ninguno en la query string.
  const needsElementSelection = showElementModal;

  // La validez del segmento la resuelve `AnimalHoroscopeRoute` en el servidor
  // (una sola fuente de verdad, y así el mensaje de error también es indexable).
  if (!animalInfo) {
    return null;
  }

  return (
    <div className="space-y-6" data-testid="animal-horoscope-panel">
      <ChineseAnimalSelector
        selectedAnimal={animal}
        userAnimal={userAnimal}
        variant="carousel"
        onSelect={(a) => {
          router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL(a));
        }}
      />

      {/* El selector se abre a pedido, sin tapar la ficha */}
      <ElementSelectorModal
        open={isElementModalOpen}
        animal={animal}
        animalNameEs={animalInfo.nameEs}
        onSelectElement={handleElementSelect}
        onOpenChange={setIsElementModalOpen}
      />

      {needsElementSelection && (
        <Alert data-testid="element-selection-prompt">
          <Calculator className="h-4 w-4" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Selecciona tu elemento Wu Xing para ver la predicción de {animalInfo.nameEs} para{' '}
              {currentYear}
            </span>
            <span className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={() => setIsElementModalOpen(true)}>
                Elegir mi elemento
              </Button>
              <Button variant="link" size="sm" onClick={() => router.push(ROUTES.HOROSCOPO_CHINO)}>
                ¿No sabes tu elemento? Usa el calculador
              </Button>
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Show horoscope when element is available */}
      {element && (
        <>
          {isLoading ? (
            <div className="py-8">
              <Spinner size="md" text="Cargando horóscopo..." />
            </div>
          ) : error ? (
            getErrorStatus(error) === 404 ? (
              <div className="space-y-4 py-8 text-center" data-testid="error-not-found">
                <Clock className="text-muted-foreground mx-auto h-10 w-10" />
                <div>
                  <p className="text-lg font-medium">Horóscopo en preparación</p>
                  <p className="text-muted-foreground mt-1">
                    El horóscopo para {currentYear} todavía no está disponible. No es un error tuyo
                    — estamos trabajando en ello.
                  </p>
                </div>
                <Button variant="outline" onClick={() => router.push(ROUTES.HOROSCOPO_CHINO)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al listado
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-8 text-center" data-testid="error-server">
                <p className="text-lg font-medium">Ocurrió un error al cargar el horóscopo</p>
                <p className="text-muted-foreground">
                  Por favor, intenta de nuevo en unos momentos.
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reintentar
                </Button>
              </div>
            )
          ) : horoscopeData ? (
            <ChineseHoroscopeDetail horoscope={horoscopeData} element={element} />
          ) : null}
        </>
      )}
    </div>
  );
}
