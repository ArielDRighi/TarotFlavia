import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { HoroscopeSignRoute } from '@/components/features/horoscope/HoroscopeSignRoute';
import { getCanonicalHoroscopeForSign } from '@/lib/api/horoscope-server';
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
 * Desde T-SEO-016 el horóscopo del día también viaja en el HTML: el `<title>`
 * promete "Hoy" y el crawler no ejecuta el JS que antes lo traía. Se resuelve
 * contra el día canónico del sitio (Buenos Aires) en `horoscope-server`; el día
 * local del visitante sigue mandando en el cliente, pero sólo para reemplazar
 * el bloque servido (ver `HoroscopeSignPanel`).
 */

interface PageProps {
  params: Promise<{ sign: string }>;
}

/**
 * Una hora de ISR: el horóscopo cambia una vez por día (03:00 UTC, medianoche
 * argentina) y el cron puede atrasarse, así que la página no puede quedar
 * estática hasta el próximo deploy como antes. El primer visitante después de
 * cada hora dispara la regeneración; el resto recibe el HTML cacheado.
 */
export const revalidate = 3600;

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

  // El signo inválido lo corta `HoroscopeSignRoute` con `notFound()`; acá sólo
  // se resuelve el horóscopo si el segmento es un signo, para no pedirle a la
  // API `/horoscope/2026-09-12` por `/horoscopo/unicornio`.
  const initialHoroscope = isZodiacSign(sign)
    ? await getCanonicalHoroscopeForSign(sign)
    : undefined;

  return <HoroscopeSignRoute sign={sign} initialHoroscope={initialHoroscope} />;
}
