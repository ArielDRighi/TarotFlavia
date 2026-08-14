'use client';

// 1. React & Next.js
import { useRouter } from 'next/navigation';
// 2. Custom hooks
import { useLocalHoroscope } from '@/hooks/api/useHoroscope';
// 3. Components (ui → features)
import { HoroscopeDetail } from './HoroscopeDetail';
import { HoroscopeSkeleton } from './HoroscopeSkeleton';
import { ZodiacSignSelector } from './ZodiacSignSelector';
// 4. Stores, utils & types
import { useAuthStore } from '@/stores/authStore';
import { getZodiacSignFromDate } from '@/lib/utils/zodiac';
import { ROUTES } from '@/lib/constants/routes';
import type { ZodiacSign } from '@/types/horoscope.types';

/**
 * Horóscopo del día de `/horoscopo/[sign]`.
 *
 * Es la parte **cliente a propósito** de la ruta: el horóscopo se resuelve
 * contra el día calendario LOCAL del visitante (`useLocalHoroscope`), así que
 * renderizarlo en el servidor mostraría el día del servidor (T-PROD-020).
 *
 * Todo lo que no depende del día —la ficha del signo, que es el contenido
 * indexable— vive en `ZodiacSignProfile` y se resuelve en el servidor
 * (T-SEO-004). Antes de ese corte, esta ruta servía 31 palabras propias.
 *
 * El signo llega ya validado desde `HoroscopeSignRoute`: la validación del
 * segmento vive en el servidor, con una sola fuente de verdad.
 */
export interface HoroscopeSignPanelProps {
  /** Signo del que se muestra el horóscopo de hoy. */
  sign: ZodiacSign;
}

export function HoroscopeSignPanel({ sign }: HoroscopeSignPanelProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, isLoading, isShowingPreviousDay } = useLocalHoroscope(sign);

  const userSign = user?.birthDate ? getZodiacSignFromDate(new Date(user.birthDate)) : null;

  return (
    <section className="space-y-6" data-testid="horoscope-sign-panel">
      <ZodiacSignSelector
        selectedSign={sign}
        userSign={userSign}
        variant="carousel"
        onSelect={(selected) => router.push(ROUTES.HOROSCOPO_SIGN(selected))}
      />

      {isLoading ? (
        <HoroscopeSkeleton variant="detail" />
      ) : /* Se guarda por `!data` y no por `error`: en React Query v5 un refetch
           fallido en background puebla `error` conservando el `data` bueno, y
           mirar `error` tiraría abajo un horóscopo ya cargado. */
      !data ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Horóscopo no disponible</p>
        </div>
      ) : (
        <>
          {isShowingPreviousDay && (
            <p
              data-testid="showing-previous-day-notice"
              className="text-muted-foreground mb-4 text-center text-sm"
            >
              El horóscopo de hoy se está preparando. Mientras tanto, este es el de ayer.
            </p>
          )}
          <HoroscopeDetail horoscope={data} />
        </>
      )}
    </section>
  );
}
