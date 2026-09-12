// 5. Components
import { DailyHoroscopeList } from '@/components/features/horoscope/DailyHoroscopeList';
import { HomeSectionHeader } from './HomeSectionHeader';
// 6. Utils & types
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';
import type { CanonicalDailyHoroscopes } from '@/types/horoscope.types';

/**
 * Horóscopo de hoy en la portada: los 12 signos con su extracto (T-SEO-014).
 *
 * Es la diferencia con `/horoscopo/[signo]`, que sigue siendo la consulta
 * puntual de un signo. Acá va la **fecha visible** y el `generalContent` de
 * cada signo, con el enlace a la predicción completa. Todo en el HTML: viene
 * resuelto del servidor por `getCanonicalDailyHoroscopes` (T-SEO-016).
 *
 * La lista en sí es `DailyHoroscopeList`, compartida con el hub `/horoscopo`
 * (T-SEO-015): las dos rutas no pueden mostrar días ni extractos distintos.
 *
 * Sin query en el cliente a propósito: la portada muestra el día canónico del
 * sitio con su fecha, así que no hay promesa de "tu día local" que cumplir, y
 * el visitante argentino no dispara ninguna request. La ficha del signo sí
 * hace el swap por día local.
 */
export interface DailyHoroscopeDigestProps {
  daily: CanonicalDailyHoroscopes | undefined;
}

export function DailyHoroscopeDigest({ daily }: DailyHoroscopeDigestProps) {
  const copy = HOME_EDITORIAL.horoscope;

  return (
    <section data-testid="home-horoscope" className="bg-bg-main px-4 py-14 md:py-20">
      <div className="container mx-auto max-w-6xl">
        <HomeSectionHeader copy={copy} />
        <DailyHoroscopeList
          daily={daily}
          testIdPrefix="home-horoscope"
          emptyState={copy.emptyState}
        />
      </div>
    </section>
  );
}
