'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ZodiacSignSelector, HoroscopeSkeleton } from '@/components/features/horoscope';
import { useTodayAllHoroscopes } from '@/hooks/api/useHoroscope';
import { useAuthStore } from '@/stores/authStore';
import { getZodiacSignFromDate } from '@/lib/utils/zodiac';
import { ROUTES } from '@/lib/constants/routes';
import type { ZodiacSign } from '@/types/horoscope.types';

export default function HoroscopoPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isLoading } = useTodayAllHoroscopes();

  const userSign = user?.birthDate ? getZodiacSignFromDate(new Date(user.birthDate)) : null;

  const handleSignSelect = (sign: ZodiacSign) => {
    router.push(ROUTES.HOROSCOPO_SIGN(sign));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-serif text-4xl">Horóscopo Diario</h1>
        <p className="text-muted-foreground">Selecciona tu signo para ver las predicciones</p>
      </div>

      {!isAuthenticated && (
        <div className="bg-muted/50 mb-8 rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">
            <Link href={ROUTES.REGISTER} className="text-primary hover:underline">
              Regístrate
            </Link>{' '}
            para ver tu horóscopo automáticamente
          </p>
        </div>
      )}

      {isAuthenticated && !userSign && (
        <div className="bg-accent/20 mb-8 rounded-lg p-4 text-center">
          <p className="text-sm">
            <Link href={ROUTES.PERFIL} className="text-primary hover:underline">
              Configura tu fecha de nacimiento
            </Link>
          </p>
        </div>
      )}

      {isLoading ? (
        <HoroscopeSkeleton variant="grid" />
      ) : (
        <ZodiacSignSelector userSign={userSign} onSelect={handleSignSelect} />
      )}
    </div>
  );
}
