// 1. React & Next.js
import Link from 'next/link';

// 6. Utils & types
import {
  DAILY_HOROSCOPE_BASIS,
  DAILY_HOROSCOPE_METHOD,
} from '@/lib/constants/editorial-policy.data';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { formatDateFullWithYearInline } from '@/lib/utils/date';

/**
 * HoroscopeEditorialNote
 *
 * Pie del horóscopo diario (T-SEO-017): cómo se produjo la predicción que se
 * está leyendo, con la fecha a la que corresponde. Es la misma fórmula que
 * declara `/politica-editorial` —las dos piezas salen de la misma constante—,
 * así que reencuadra el proceso sin poner un badge de "generado por".
 *
 * La fecha es la del horóscopo **mostrado**, no la de hoy: si se está sirviendo
 * el de ayer, la nota lo dice con la fecha de ayer.
 *
 * Sin `'use client'` propio: no tiene estado ni handlers. La usan un server
 * component (`DailyHoroscopeList`: portada y hub) y un client component
 * (`HoroscopeSignPanel`), y en los dos llega al HTML inicial.
 *
 * @example
 * ```tsx
 * <HoroscopeEditorialNote horoscopeDate={horoscope.horoscopeDate} />
 * ```
 */
export interface HoroscopeEditorialNoteProps {
  /** Fecha del horóscopo mostrado, `YYYY-MM-DD`. */
  horoscopeDate: string;
  /** Prefijo del `data-testid`, para que cada consumidor tenga el suyo. */
  testIdPrefix?: string;
  /** Clases CSS adicionales. */
  className?: string;
}

export function HoroscopeEditorialNote({
  horoscopeDate,
  testIdPrefix = 'horoscope',
  className,
}: HoroscopeEditorialNoteProps) {
  return (
    <aside
      aria-label="Nota editorial"
      data-testid={`${testIdPrefix}-editorial-note`}
      className={cn('border-border text-muted-foreground border-t pt-4 text-xs', className)}
    >
      <p className="leading-relaxed">
        Redactado {DAILY_HOROSCOPE_BASIS} para el{' '}
        <time dateTime={horoscopeDate}>{formatDateFullWithYearInline(horoscopeDate)}</time>,{' '}
        {DAILY_HOROSCOPE_METHOD}.{' '}
        <Link
          href={ROUTES.POLITICA_EDITORIAL}
          className="text-secondary focus-visible:ring-secondary rounded-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          Política editorial
        </Link>
      </p>
    </aside>
  );
}
