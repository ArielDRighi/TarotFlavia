/**
 * HoroscopeSignRoute Component
 *
 * Componente de ruta de `/horoscopo/[sign]` (T-SEO-004).
 *
 * Sin `'use client'`: valida el segmento y sirve la ficha estática del signo en
 * el servidor, que es el contenido que ve el crawler (antes eran 31 palabras).
 * El horóscopo del día queda en `HoroscopeSignPanel`, que es cliente **a
 * propósito**: se resuelve contra el día calendario local del visitante
 * (T-PROD-020), así que renderizarlo en el servidor mostraría el día del
 * servidor.
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { isZodiacSign } from '@/lib/utils/zodiac';

import { HoroscopeSignPanel } from './HoroscopeSignPanel';
import { ZodiacSignProfile } from './ZodiacSignProfile';

export interface HoroscopeSignRouteProps {
  /** Segmento `[sign]` de la URL, todavía sin validar. */
  sign: string;
}

export function HoroscopeSignRoute({ sign }: HoroscopeSignRouteProps) {
  // `notFound()` y no una ficha de "signo no válido": esa página respondía 200 y
  // Google la indexaba como una URL válida y vacía (soft-404, T-SEO-006).
  if (!isZodiacSign(sign)) {
    notFound();
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* Enlace real, no `router.push`: así el crawler recorre el hub desde la ficha. */}
      <Button asChild variant="ghost" size="sm">
        <Link href={ROUTES.HOROSCOPO} data-testid="back-to-horoscope-hub">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Todos los signos
        </Link>
      </Button>

      {/* El horóscopo del día va dentro de la ficha, entre la introducción y el
          resto del contenido: es lo que el visitante viene a buscar, y dejarlo
          al final del artículo lo escondería debajo de 300 palabras. */}
      <ZodiacSignProfile sign={sign}>
        <HoroscopeSignPanel sign={sign} />
      </ZodiacSignProfile>
    </div>
  );
}
