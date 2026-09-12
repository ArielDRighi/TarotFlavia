'use client';

// 1. React & Next.js
import { useRouter } from 'next/navigation';
// 2. Custom hooks
import { useLocalHoroscope } from '@/hooks/api/useHoroscope';
import { useLocalToday } from '@/hooks/utils/useLocalToday';
// 3. Components (ui → features)
import { HoroscopeDetail } from './HoroscopeDetail';
import { HoroscopeEditorialNote } from './HoroscopeEditorialNote';
import { HoroscopeSkeleton } from './HoroscopeSkeleton';
import { ZodiacSignSelector } from './ZodiacSignSelector';
// 4. Stores, utils & types
import { useAuthStore } from '@/stores/authStore';
import { getZodiacSignFromDate } from '@/lib/utils/zodiac';
import { ROUTES } from '@/lib/constants/routes';
import type { ServedDailyHoroscope, ZodiacSign } from '@/types/horoscope.types';

export interface HoroscopeSignPanelProps {
  /** Signo del que se muestra el horóscopo de hoy. */
  sign: ZodiacSign;
  /**
   * Horóscopo resuelto en el servidor contra el día canónico (T-SEO-016). Es el
   * primer render siempre; el cliente sólo lo reemplaza si el día local del
   * visitante difiere. Ausente si la API falló en el render del servidor.
   */
  initialHoroscope?: ServedDailyHoroscope;
}

/**
 * Horóscopo del día de `/horoscopo/[sign]`.
 *
 * Desde T-SEO-016 la predicción viaja en el HTML: `initialHoroscope` la resuelve
 * el servidor contra el día canónico del sitio (Buenos Aires) y es lo que se
 * pinta tanto en el servidor como en la hidratación —así no hay mismatch—. El
 * día calendario LOCAL del visitante (T-PROD-020) sigue mandando, pero **sólo
 * para reemplazar** ese bloque cuando difiere del canónico: la query se
 * habilita recién entonces, y hasta que trae datos se sigue mostrando lo
 * servido (nunca un skeleton sobre contenido que ya está).
 *
 * Sin `initialHoroscope` (API caída durante el render) se comporta como antes:
 * consulta el día local y muestra el skeleton mientras carga.
 *
 * Todo lo que no depende del día —la ficha del signo— vive en
 * `ZodiacSignProfile` y se resuelve en el servidor (T-SEO-004).
 *
 * El signo llega ya validado desde `HoroscopeSignRoute`: la validación del
 * segmento vive en el servidor, con una sola fuente de verdad.
 *
 * @example
 * ```tsx
 * <HoroscopeSignPanel sign={ZodiacSign.ARIES} initialHoroscope={served} />
 * ```
 */
export function HoroscopeSignPanel({ sign, initialHoroscope }: HoroscopeSignPanelProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const localToday = useLocalToday();

  // En el servidor `useLocalToday` lee la zona del proceso, así que este flag
  // puede diferir entre servidor y cliente. No importa: sólo habilita la query,
  // y lo que se renderiza depende de `localQuery.data`, que en ambos lados es
  // `undefined` hasta después de hidratar.
  //
  // También se consulta si el servidor sirvió el de ayer: ese HTML queda
  // cacheado hasta 1 h por el ISR y, si el cron terminó en el medio, el
  // visitante argentino (día local = canónico) se quedaría sin request y sin
  // el de hoy hasta la próxima regeneración. Si aún no existe, el hook cae a
  // ayer —el mismo horóscopo que ya se muestra— sin parpadeo.
  const shouldQueryLocal =
    !initialHoroscope ||
    initialHoroscope.isShowingPreviousDay ||
    localToday !== initialHoroscope.canonicalDate;
  const localQuery = useLocalHoroscope(shouldQueryLocal ? sign : null);

  // El día local reemplaza al servido sólo cuando ya trajo datos; mientras
  // carga o si falla, se conserva lo que vino en el HTML.
  const showingLocal = localQuery.data !== undefined;
  const data = showingLocal ? localQuery.data : initialHoroscope?.horoscope;
  const isShowingPreviousDay = showingLocal
    ? localQuery.isShowingPreviousDay
    : (initialHoroscope?.isShowingPreviousDay ?? false);
  const isLoading = !initialHoroscope && localQuery.isLoading;

  const userSign = user?.birthDate ? getZodiacSignFromDate(new Date(user.birthDate)) : null;

  return (
    <section
      className="space-y-6"
      aria-labelledby="horoscopo-de-hoy"
      data-testid="horoscope-sign-panel"
    >
      {/* El único encabezado del bloque lo aporta `HoroscopeDetail`, y solo
          cuando hay datos: sin esto, el bloque queda sin nombre accesible
          mientras carga o cuando el horóscopo no está disponible. */}
      <h2 id="horoscopo-de-hoy" className="sr-only">
        Horóscopo de hoy
      </h2>

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
          {/* Cómo se produjo lo que se muestra, con SU fecha (T-SEO-017). */}
          <HoroscopeEditorialNote horoscopeDate={data.horoscopeDate} />
        </>
      )}
    </section>
  );
}
