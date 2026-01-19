'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ChineseHoroscopeDetail,
  ChineseAnimalSelector,
} from '@/components/features/chinese-horoscope';
import { useChineseHoroscope } from '@/hooks/api/useChineseHoroscope';
import { CHINESE_ZODIAC_INFO } from '@/lib/utils/chinese-zodiac';
import { ROUTES } from '@/lib/constants/routes';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

export default function ChineseHoroscopeAnimalPage() {
  const params = useParams();
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const animal = params.animal as ChineseZodiacAnimal;
  const { data, isLoading, error } = useChineseHoroscope(currentYear, animal);

  if (!CHINESE_ZODIAC_INFO[animal]) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl">Animal no válido</h1>
        <Button onClick={() => router.push(ROUTES.HOROSCOPO_CHINO)}>Ver todos los animales</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(ROUTES.HOROSCOPO_CHINO)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Todos los animales
      </Button>

      <div className="mb-8 overflow-x-auto pb-2">
        <ChineseAnimalSelector
          selectedAnimal={animal}
          onSelect={(a) => router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL(a))}
          className="!grid-cols-6 lg:!grid-cols-12"
        />
      </div>

      {isLoading ? (
        <div className="py-8 text-center">Cargando...</div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Horóscopo no disponible para {currentYear}</p>
        </div>
      ) : data ? (
        <ChineseHoroscopeDetail horoscope={data} />
      ) : null}
    </div>
  );
}
