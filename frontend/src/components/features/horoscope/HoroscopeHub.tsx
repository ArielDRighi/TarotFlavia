// 5. Components
import { SectionHero } from '@/components/ui/section-hero';
import { ServiceIntro } from '@/components/features/encyclopedia/ServiceIntro';
import { DailyHoroscopeList } from './DailyHoroscopeList';
import { HoroscopeHubSelector } from './HoroscopeHubSelector';
// 6. Utils & types
import { HOROSCOPE_HUB_GUIDE } from '@/lib/constants/horoscope-hub.data';
import { SERVICE_INTROS } from '@/lib/constants/service-intros.data';
import type { CanonicalDailyHoroscopes } from '@/types/horoscope.types';

/**
 * Hub `/horoscopo` (T-SEO-015).
 *
 * Servía 217 palabras: un selector de signos y la tarjeta informativa. Ahora es
 * un hub de verdad: los 12 signos con la fecha de hoy y el extracto de 2–3
 * líneas de cada predicción **en el HTML** (reutiliza `getCanonicalDailyHoroscopes`
 * de T-SEO-016), después la consulta puntual (elegís tu signo → predicción
 * completa en `/horoscopo/[signo]`), y debajo el texto explicativo de siempre.
 *
 * Server Component: la ruta le pasa los datos resueltos y sólo el selector es
 * cliente. Sin swap por día local a propósito, igual que la portada: el hub
 * muestra el día canónico con su fecha visible, así que no hay promesa de "tu
 * día local" que cumplir y el visitante argentino no dispara requests. La
 * ficha del signo sí hace el swap.
 */
export interface HoroscopeHubProps {
  daily: CanonicalDailyHoroscopes | undefined;
}

const EMPTY_STATE =
  'El horóscopo de hoy todavía no está disponible. Elegí tu signo más abajo para ver la última predicción publicada, o volvé en un rato.';

export function HoroscopeHub({ daily }: HoroscopeHubProps) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <SectionHero
        className="mb-8"
        title="Horóscopo de hoy para los 12 signos"
        lead="La predicción del día, signo por signo. Cada extracto resume la energía general de la jornada; el enlace lleva a la lectura completa, con amor, prosperidad y abundancia, bienestar y los números del día. Se renueva cada madrugada."
        icon={{ family: 'hubs', name: 'horoscope' }}
      />

      <section data-testid="horoscope-hub-digest" aria-label="Horóscopo de hoy por signo">
        <DailyHoroscopeList
          daily={daily}
          testIdPrefix="horoscope-hub"
          emptyState={EMPTY_STATE}
          headingLevel={2}
        />
      </section>

      <HoroscopeHubSelector />

      {/* Piso propio del hub: se sirve aunque la API no responda durante el ISR. */}
      <section data-testid="horoscope-hub-guide" className="mt-14 max-w-3xl">
        <h2 className="text-text-primary mb-6 font-serif text-2xl font-semibold">
          {HOROSCOPE_HUB_GUIDE.title}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {HOROSCOPE_HUB_GUIDE.sections.map((section) => (
            <div key={section.heading}>
              <h3 className="text-text-primary mb-1 font-sans font-semibold">{section.heading}</h3>
              <p className="text-text-muted font-sans text-sm leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
      </section>

      <ServiceIntro data={SERVICE_INTROS['western-horoscope']} className="mt-14" />
    </div>
  );
}
