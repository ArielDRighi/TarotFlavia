// 1. React & Next.js
import Link from 'next/link';
// 5. Components
import { HoroscopeEditorialNote } from './HoroscopeEditorialNote';
// 6. Utils & types
import { ROUTES } from '@/lib/constants/routes';
import { formatDateFullWithYear } from '@/lib/utils/date';
import { ZODIAC_SIGNS_INFO } from '@/lib/utils/zodiac';
import { ZodiacSign } from '@/types/horoscope.types';
import type { CanonicalDailyHoroscopes, DailyHoroscope } from '@/types/horoscope.types';
import { ContentDisclaimer } from '@/components/common/ContentDisclaimer';

/**
 * Los 12 signos del día con su extracto, fecha visible y enlace a la
 * predicción completa (T-SEO-014 / T-SEO-015).
 *
 * Es el bloque que comparten la portada (`DailyHoroscopeDigest`) y el hub
 * `/horoscopo` (`HoroscopeHub`): la misma lista, el mismo criterio de fecha
 * ("la del horóscopo servido; si es el de ayer, se dice") y el mismo orden de
 * la rueda zodiacal. Sin `'use client'`: es el contenido que tiene que llegar
 * al crawler. Cada consumidor pone su `testIdPrefix` para que sus tests no se
 * pisen.
 *
 * El extracto es `generalContent`, que el backend genera como resumen de 2–3
 * oraciones: no se trunca. La consulta puntual del signo —con swap por día
 * local— sigue en `/horoscopo/[signo]`.
 */
export interface DailyHoroscopeListProps {
  daily: CanonicalDailyHoroscopes | undefined;
  /** Prefijo de los `data-testid` (`${prefix}-date`, `${prefix}-sign-aries`, `${prefix}-empty`). */
  testIdPrefix: string;
  /** Texto cuando no hay horóscopo disponible (API caída). */
  emptyState: string;
  /** Nivel del encabezado de cada signo: `h3` bajo un `h2` de sección, `h2` bajo el `h1` del hub. */
  headingLevel?: 2 | 3;
}

/** Orden de la rueda zodiacal, que es como se leen las carteleras de horóscopo. */
const WHEEL_ORDER = Object.values(ZodiacSign);

export function sortByWheel(horoscopes: DailyHoroscope[]): DailyHoroscope[] {
  return [...horoscopes].sort(
    (a, b) => WHEEL_ORDER.indexOf(a.zodiacSign) - WHEEL_ORDER.indexOf(b.zodiacSign)
  );
}

function SignExcerpt({
  horoscope,
  testIdPrefix,
  headingLevel,
}: {
  horoscope: DailyHoroscope;
  testIdPrefix: string;
  headingLevel: 2 | 3;
}) {
  const info = ZODIAC_SIGNS_INFO[horoscope.zodiacSign];
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <li
      data-testid={`${testIdPrefix}-sign-${horoscope.zodiacSign}`}
      className="border-border bg-card flex flex-col gap-2 rounded-xl border p-4"
    >
      <Heading className="text-text-primary flex items-center gap-2 font-serif text-lg font-semibold">
        <span className="text-secondary text-xl" aria-hidden="true">
          {info.symbol}
        </span>
        <Link
          href={ROUTES.HOROSCOPO_SIGN(horoscope.zodiacSign)}
          className="underline-offset-4 hover:underline"
        >
          {info.nameEs}
        </Link>
      </Heading>
      <p className="text-text-muted font-sans text-sm leading-relaxed">
        {horoscope.generalContent}
      </p>
    </li>
  );
}

export function DailyHoroscopeList({
  daily,
  testIdPrefix,
  emptyState,
  headingLevel = 3,
}: DailyHoroscopeListProps) {
  const horoscopes = daily ? sortByWheel(daily.horoscopes) : [];
  const hasContent = horoscopes.length > 0;
  // La fecha visible es la del horóscopo servido: si se cayó a ayer, se dice.
  const servedDate = hasContent ? horoscopes[0].horoscopeDate : undefined;

  if (!hasContent || !servedDate) {
    return (
      <p
        data-testid={`${testIdPrefix}-empty`}
        className="text-text-muted border-border rounded-xl border border-dashed p-6 font-sans leading-relaxed"
      >
        {emptyState}
      </p>
    );
  }

  return (
    <>
      <p className="text-text-primary mb-6 font-sans text-sm font-medium">
        <time data-testid={`${testIdPrefix}-date`} dateTime={servedDate}>
          {formatDateFullWithYear(servedDate)}
        </time>
        {daily?.isShowingPreviousDay && (
          <span
            data-testid={`${testIdPrefix}-previous-day`}
            className="text-text-muted ml-2 font-normal"
          >
            · El de hoy se está preparando; mientras tanto, este es el de ayer.
          </span>
        )}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {horoscopes.map((horoscope) => (
          <SignExcerpt
            key={horoscope.zodiacSign}
            horoscope={horoscope}
            testIdPrefix={testIdPrefix}
            headingLevel={headingLevel}
          />
        ))}
      </ul>
      {/* Cómo se produjeron los doce, con la fecha servida (T-SEO-017). */}
      <HoroscopeEditorialNote
        horoscopeDate={servedDate}
        testIdPrefix={testIdPrefix}
        className="mt-6"
      />
      {/* Aviso legal al pie de los doce (T-SEO-018) */}
      <ContentDisclaimer className="mt-4" />
    </>
  );
}
