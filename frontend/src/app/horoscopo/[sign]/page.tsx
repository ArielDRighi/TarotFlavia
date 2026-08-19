import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { HoroscopeSignRoute } from '@/components/features/horoscope/HoroscopeSignRoute';
import { getHoroscopeSignMetadata } from '@/lib/metadata/page-metadata';
import { isZodiacSign } from '@/lib/utils/zodiac';
import { ZodiacSign } from '@/types/horoscope.types';

/**
 * Ficha de horóscopo por signo.
 *
 * Route: /horoscopo/[sign]
 *
 * Server component. La metadata es propia por signo desde T-PROD-020 (los 12
 * compartían el `<title>` "Auguria" y Google los agrupaba como duplicados) y el
 * contenido de la ficha se resuelve en el servidor desde T-SEO-004: sale de
 * constantes del repo, sin API y sin día local.
 *
 * El horóscopo del día sigue siendo cliente **a propósito**: se resuelve contra
 * el día calendario local del visitante (ver `HoroscopeSignPanel`).
 */

interface PageProps {
  params: Promise<{ sign: string }>;
}

// Sin `revalidate`: el HTML estático sale entero de constantes del repo, así que
// solo cambia con un deploy —que ya regenera las páginas—. El horóscopo del día
// lo trae el cliente, no el prerender.

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sign } = await params;

  // `/horoscopo/unicornio` no existe: 404 real desde la metadata, que es lo
  // primero que corre. Antes devolvía una metadata `noindex` sobre un 200, y un
  // 200 con página de "no encontrado" es justamente el soft-404 que Google
  // penaliza (T-SEO-006).
  if (!isZodiacSign(sign)) {
    notFound();
  }

  return getHoroscopeSignMetadata(sign);
}

export function generateStaticParams(): { sign: string }[] {
  return Object.values(ZodiacSign).map((sign) => ({ sign }));
}

export default async function HoroscopeSignPage({ params }: PageProps) {
  const { sign } = await params;

  return <HoroscopeSignRoute sign={sign} />;
}
