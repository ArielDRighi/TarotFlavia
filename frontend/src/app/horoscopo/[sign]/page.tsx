import type { Metadata } from 'next';

import { HoroscopeSignPageContent } from '@/components/features/horoscope/HoroscopeSignPageContent';
import {
  INVALID_ROUTE_PARAM_METADATA,
  getHoroscopeSignMetadata,
} from '@/lib/metadata/page-metadata';
import { isZodiacSign } from '@/lib/utils/zodiac';
import { ZodiacSign } from '@/types/horoscope.types';

/**
 * Ficha de horóscopo por signo.
 *
 * Route: /horoscopo/[sign]
 *
 * La ruta es server-side solo para la metadata: los 12 signos compartían el
 * `<title>` "Auguria" del root layout y Google los agrupaba como duplicados
 * (T-PROD-020). El contenido sigue siendo client: depende del día calendario
 * local del visitante (ver `HoroscopeSignPageContent`).
 */

interface PageProps {
  params: Promise<{ sign: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sign } = await params;

  // `/horoscopo/unicornio` no debe heredar el canonical del hub: quedaría
  // declarada duplicada de `/horoscopo` en un 200.
  return isZodiacSign(sign) ? getHoroscopeSignMetadata(sign) : INVALID_ROUTE_PARAM_METADATA;
}

export function generateStaticParams(): { sign: string }[] {
  return Object.values(ZodiacSign).map((sign) => ({ sign }));
}

export default function HoroscopeSignPage() {
  return <HoroscopeSignPageContent />;
}
