/**
 * AnimalHoroscopeRoute Component
 *
 * Componente de ruta de `/horoscopo-chino/[animal]` (T-SEO-002).
 *
 * Sin `'use client'`: valida el segmento y sirve la ficha estática del animal en
 * el servidor. Lo interactivo (`AnimalHoroscopePanel`, que usa `useSearchParams`)
 * queda dentro de un `<Suspense>`, que es el límite que necesita Next para poder
 * prerenderizar el resto. Antes de este corte, las 12 URLs servían 3 palabras.
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { isChineseZodiacAnimal } from '@/lib/utils/chinese-zodiac';

import { AnimalHoroscopePanel } from './AnimalHoroscopePanel';
import { AnimalProfile } from './AnimalProfile';
import { ChineseHoroscopeSkeleton } from './ChineseHoroscopeSkeleton';

export interface AnimalHoroscopeRouteProps {
  /** Segmento `[animal]` de la URL, todavía sin validar. */
  animal: string;
}

/** Mensaje para un segmento que no es uno de los 12 animales. */
function AnimalNotFound() {
  return (
    <div className="container mx-auto px-4 py-8 text-center" data-testid="animal-not-found">
      <h1 className="mb-4 text-2xl">Animal no válido</h1>
      <p className="text-muted-foreground mb-6">
        El zodiaco chino tiene 12 animales y este no es uno de ellos.
      </p>
      <Button asChild>
        <Link href={ROUTES.HOROSCOPO_CHINO}>Ver todos los animales</Link>
      </Button>
    </div>
  );
}

export function AnimalHoroscopeRoute({ animal }: AnimalHoroscopeRouteProps) {
  if (!isChineseZodiacAnimal(animal)) {
    return <AnimalNotFound />;
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* Enlace real, no `router.push`: así el crawler recorre el hub desde la ficha. */}
      <Button asChild variant="ghost" size="sm">
        <Link href={ROUTES.HOROSCOPO_CHINO}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Todos los animales
        </Link>
      </Button>

      <AnimalProfile animal={animal} />

      <Suspense fallback={<ChineseHoroscopeSkeleton />}>
        <AnimalHoroscopePanel />
      </Suspense>
    </div>
  );
}
