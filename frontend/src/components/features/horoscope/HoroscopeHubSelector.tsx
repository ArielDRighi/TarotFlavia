'use client';

// 1. React & Next.js
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// 5. Components
import { ZodiacSignSelector } from './ZodiacSignSelector';
// 4. Custom hooks
import { useAuthStore } from '@/stores/authStore';
// 6. Utils & types
import { ROUTES } from '@/lib/constants/routes';
import { getZodiacSignFromDate } from '@/lib/utils/zodiac';
import type { ZodiacSign } from '@/types/horoscope.types';

/**
 * La consulta puntual del hub `/horoscopo` (T-SEO-015): elegís tu signo y vas
 * a su predicción completa. Es la única parte cliente de la página: necesita
 * la sesión para resaltar el signo del usuario y el router para navegar.
 *
 * Antes la página entera era cliente y además pedía los 12 horóscopos a la API
 * sólo para mostrar un esqueleto mientras cargaban: los 12 ahora viajan en el
 * HTML (`DailyHoroscopeList`) y el selector no necesita ningún dato.
 */
export function HoroscopeHubSelector() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const userSign = user?.birthDate ? getZodiacSignFromDate(new Date(user.birthDate)) : null;

  const handleSignSelect = (sign: ZodiacSign) => {
    router.push(ROUTES.HOROSCOPO_SIGN(sign));
  };

  return (
    <section data-testid="horoscope-hub-selector" className="mt-14">
      <h2 className="text-text-primary mb-2 font-serif text-2xl font-semibold">
        Consultá tu signo
      </h2>
      <p className="text-text-muted mb-6 font-sans">
        Elegí tu signo para leer la predicción completa de hoy: amor, dinero, bienestar y tus
        números del día.
      </p>

      {!isAuthenticated && (
        <div className="bg-muted/50 mb-6 rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">
            <Link href={ROUTES.REGISTER} className="text-primary hover:underline">
              Registrate
            </Link>{' '}
            para ver tu horóscopo automáticamente
          </p>
        </div>
      )}

      {isAuthenticated && !userSign && (
        <div className="bg-accent/20 mb-6 rounded-lg p-4 text-center">
          <p className="text-sm">
            <Link href={ROUTES.PERFIL} className="text-primary hover:underline">
              Configurá tu fecha de nacimiento
            </Link>
          </p>
        </div>
      )}

      <ZodiacSignSelector userSign={userSign} onSelect={handleSignSelect} />
    </section>
  );
}
