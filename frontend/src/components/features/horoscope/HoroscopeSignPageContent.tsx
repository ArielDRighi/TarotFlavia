'use client';

// 1. React & Next.js
import { useParams, useRouter } from 'next/navigation';
// 2. Icons
import { ArrowLeft } from 'lucide-react';
// 3. Custom hooks
import { useLocalHoroscope } from '@/hooks/api/useHoroscope';
// 4. Components (ui → features)
import { Button } from '@/components/ui/button';
import { HoroscopeDetail } from './HoroscopeDetail';
import { HoroscopeSkeleton } from './HoroscopeSkeleton';
import { ZodiacSignSelector } from './ZodiacSignSelector';
// 5. Stores, utils & types
import { useAuthStore } from '@/stores/authStore';
import { getZodiacSignFromDate, ZODIAC_SIGNS_INFO } from '@/lib/utils/zodiac';
import { ROUTES } from '@/lib/constants/routes';
import { ZodiacSign } from '@/types/horoscope.types';

/**
 * Contenido de `/horoscopo/[sign]`.
 *
 * Vive fuera de `app/` desde T-PROD-020: la ruta pasó a ser un server component
 * para poder declarar `title`/`description` propios por signo (los 12 compartían
 * el default "Auguria" y Google los agrupaba como duplicados).
 *
 * El contenido **sigue siendo client-side a propósito**: el horóscopo del día se
 * resuelve contra el día calendario LOCAL del visitante (`useLocalHoroscope`).
 * Renderizarlo en el servidor mostraría el día del servidor, no el del usuario.
 */
export function HoroscopeSignPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  // Validate the sign BEFORE querying: pass null to the hook for an invalid
  // route (e.g. /horoscopo/foobar) so it stays disabled instead of firing 404s.
  const rawSign = params.sign as string;
  const isValidSign = Boolean(ZODIAC_SIGNS_INFO[rawSign as ZodiacSign]);
  const sign = isValidSign ? (rawSign as ZodiacSign) : null;
  const { data, isLoading, error, isShowingPreviousDay } = useLocalHoroscope(sign);

  if (!sign) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl">Signo no válido</h1>
        <Button onClick={() => router.push(ROUTES.HOROSCOPO)}>Ver todos los signos</Button>
      </div>
    );
  }

  const userSign = user?.birthDate ? getZodiacSignFromDate(new Date(user.birthDate)) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(ROUTES.HOROSCOPO)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Todos los signos
      </Button>

      <div className="mb-8">
        <ZodiacSignSelector
          selectedSign={sign}
          userSign={userSign}
          variant="carousel"
          onSelect={(s) => router.push(ROUTES.HOROSCOPO_SIGN(s))}
        />
      </div>

      {isLoading ? (
        <HoroscopeSkeleton variant="detail" />
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Horóscopo no disponible</p>
        </div>
      ) : data ? (
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
      ) : null}
    </div>
  );
}
