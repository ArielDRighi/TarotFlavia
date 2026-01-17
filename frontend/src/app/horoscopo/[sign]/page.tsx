'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  HoroscopeDetail,
  HoroscopeSkeleton,
  ZodiacSignSelector,
} from '@/components/features/horoscope';
import { useTodayHoroscope } from '@/hooks/api/useHoroscope';
import { useAuthStore } from '@/stores/authStore';
import { getZodiacSignFromDate, ZODIAC_SIGNS_INFO } from '@/lib/utils/zodiac';
import { ROUTES } from '@/lib/constants/routes';
import { ZodiacSign } from '@/types/horoscope.types';

export default function HoroscopeSignPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const sign = params.sign as ZodiacSign;
  const { data, isLoading, error } = useTodayHoroscope(sign);

  if (!ZODIAC_SIGNS_INFO[sign]) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl mb-4">Signo no válido</h1>
        <Button onClick={() => router.push(ROUTES.HOROSCOPO)}>Ver todos los signos</Button>
      </div>
    );
  }

  const userSign = user?.birthDate ? getZodiacSignFromDate(new Date(user.birthDate)) : null;

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(ROUTES.HOROSCOPO)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Todos los signos
      </Button>

      <div className="mb-8 overflow-x-auto pb-2">
        <ZodiacSignSelector
          selectedSign={sign}
          userSign={userSign}
          onSelect={(s) => router.push(ROUTES.HOROSCOPO_SIGN(s))}
          className="!grid-cols-6 lg:!grid-cols-12"
        />
      </div>

      {isLoading ? (
        <HoroscopeSkeleton variant="detail" />
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Horóscopo no disponible</p>
        </div>
      ) : data ? (
        <HoroscopeDetail horoscope={data} />
      ) : null}
    </div>
  );
}
