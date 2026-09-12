// 1. React & Next.js
import Link from 'next/link';
// 5. Components
import { HomeSectionHeader } from './HomeSectionHeader';
// 6. Utils & types
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';
import { ROUTES } from '@/lib/constants/routes';
import { formatDateFullWithYear } from '@/lib/utils/date';
import { ZODIAC_SIGNS_INFO } from '@/lib/utils/zodiac';
import { ZodiacSign } from '@/types/horoscope.types';
import type { CanonicalDailyHoroscopes, DailyHoroscope } from '@/types/horoscope.types';

/**
 * Horóscopo de hoy en la portada: los 12 signos con su extracto (T-SEO-014).
 *
 * Es la diferencia con `/horoscopo/[signo]`, que sigue siendo la consulta
 * puntual de un signo. Acá va la **fecha visible** y el `generalContent` de
 * cada signo —que el backend genera como resumen de 2–3 oraciones—, con el
 * enlace a la predicción completa. Todo en el HTML: viene resuelto del servidor
 * por `getCanonicalDailyHoroscopes` (T-SEO-016).
 *
 * Sin query en el cliente a propósito: la portada muestra el día canónico del
 * sitio con su fecha, así que no hay promesa de "tu día local" que cumplir, y
 * el visitante argentino no dispara ninguna request. La ficha del signo sí
 * hace el swap por día local.
 */
export interface DailyHoroscopeDigestProps {
  daily: CanonicalDailyHoroscopes | undefined;
}

/** Orden de la rueda zodiacal, que es como se leen las carteleras de horóscopo. */
const WHEEL_ORDER = Object.values(ZodiacSign);

function sortByWheel(horoscopes: DailyHoroscope[]): DailyHoroscope[] {
  return [...horoscopes].sort(
    (a, b) => WHEEL_ORDER.indexOf(a.zodiacSign) - WHEEL_ORDER.indexOf(b.zodiacSign)
  );
}

function SignExcerpt({ horoscope }: { horoscope: DailyHoroscope }) {
  const info = ZODIAC_SIGNS_INFO[horoscope.zodiacSign];

  return (
    <li
      data-testid={`home-horoscope-sign-${horoscope.zodiacSign}`}
      className="border-border bg-card flex flex-col gap-2 rounded-xl border p-4"
    >
      <h3 className="text-text-primary flex items-center gap-2 font-serif text-lg font-semibold">
        <span className="text-secondary text-xl" aria-hidden="true">
          {info.symbol}
        </span>
        <Link
          href={ROUTES.HOROSCOPO_SIGN(horoscope.zodiacSign)}
          className="underline-offset-4 hover:underline"
        >
          {info.nameEs}
        </Link>
      </h3>
      <p className="text-text-muted font-sans text-sm leading-relaxed">
        {horoscope.generalContent}
      </p>
    </li>
  );
}

export function DailyHoroscopeDigest({ daily }: DailyHoroscopeDigestProps) {
  const copy = HOME_EDITORIAL.horoscope;
  const horoscopes = daily ? sortByWheel(daily.horoscopes) : [];
  const hasContent = horoscopes.length > 0;
  // La fecha visible es la del horóscopo servido: si se cayó a ayer, se dice.
  const servedDate = hasContent ? horoscopes[0].horoscopeDate : undefined;

  return (
    <section data-testid="home-horoscope" className="bg-bg-main px-4 py-14 md:py-20">
      <div className="container mx-auto max-w-6xl">
        <HomeSectionHeader copy={copy} />

        {hasContent && servedDate ? (
          <>
            <p className="text-text-primary mb-6 font-sans text-sm font-medium">
              <time data-testid="home-horoscope-date" dateTime={servedDate}>
                {formatDateFullWithYear(servedDate)}
              </time>
              {daily?.isShowingPreviousDay && (
                <span
                  data-testid="home-horoscope-previous-day"
                  className="text-text-muted ml-2 font-normal"
                >
                  · El de hoy se está preparando; mientras tanto, este es el de ayer.
                </span>
              )}
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {horoscopes.map((horoscope) => (
                <SignExcerpt key={horoscope.zodiacSign} horoscope={horoscope} />
              ))}
            </ul>
          </>
        ) : (
          <p
            data-testid="home-horoscope-empty"
            className="text-text-muted border-border rounded-xl border border-dashed p-6 font-sans leading-relaxed"
          >
            {copy.emptyState}
          </p>
        )}
      </div>
    </section>
  );
}
