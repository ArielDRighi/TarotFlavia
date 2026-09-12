import { HoroscopeHub } from '@/components/features/horoscope/HoroscopeHub';
import { getCanonicalDailyHoroscopes } from '@/lib/api/horoscope-server';

/**
 * Hub del horóscopo (`/horoscopo`).
 *
 * Server Component desde T-SEO-015: los 12 extractos del día viajan en el HTML.
 * Mismo ISR que la portada y que `/horoscopo/[sign]`: el horóscopo cambia a
 * diario y la ventana de generación es de una hora.
 */
export const revalidate = 3600;

export default async function HoroscopoPage() {
  const daily = await getCanonicalDailyHoroscopes();

  return <HoroscopeHub daily={daily} />;
}
