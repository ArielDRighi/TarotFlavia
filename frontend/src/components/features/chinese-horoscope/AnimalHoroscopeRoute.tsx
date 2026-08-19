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
import { notFound } from 'next/navigation';
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

export function AnimalHoroscopeRoute({ animal }: AnimalHoroscopeRouteProps) {
  // Ídem `/horoscopo/[sign]`: la ficha de "animal no válido" respondía 200 y
  // sumaba una URL vacía al índice (soft-404, T-SEO-006).
  if (!isChineseZodiacAnimal(animal)) {
    notFound();
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
