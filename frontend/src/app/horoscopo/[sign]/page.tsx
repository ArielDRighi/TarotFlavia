import type { Metadata } from 'next';

import { HoroscopeSignPageContent } from '@/components/features/horoscope/HoroscopeSignPageContent';
import { getHoroscopeSignMetadata } from '@/lib/metadata/page-metadata';
import { ZODIAC_SIGNS_INFO } from '@/lib/utils/zodiac';
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

function parseSign(value: string): ZodiacSign | null {
  return ZODIAC_SIGNS_INFO[value as ZodiacSign] ? (value as ZodiacSign) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sign } = await params;
  const parsed = parseSign(sign);

  // `/horoscopo/foobar` no debe inventar un título: cae a la del layout padre.
  return parsed ? getHoroscopeSignMetadata(parsed) : {};
}

export function generateStaticParams(): { sign: string }[] {
  return Object.values(ZodiacSign).map((sign) => ({ sign }));
}

export default function HoroscopeSignPage() {
  return <HoroscopeSignPageContent />;
}
