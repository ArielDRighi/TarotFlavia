'use client';

import { useRouter } from 'next/navigation';
import { ChineseAnimalSelector } from '@/components/features/chinese-horoscope';
import { useChineseHoroscopesByYear } from '@/hooks/api/useChineseHoroscope';
import { ROUTES } from '@/lib/constants/routes';
import type { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

export default function HoroscopoChinoPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  useChineseHoroscopesByYear(currentYear);

  const handleAnimalSelect = (animal: ChineseZodiacAnimal) => {
    router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL(animal));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-serif text-4xl">Horóscopo Chino {currentYear}</h1>
        <p className="text-muted-foreground">Descubre las predicciones anuales según tu animal</p>
      </div>

      {/* Selector de animales */}
      <ChineseAnimalSelector onSelect={handleAnimalSelect} />
    </div>
  );
}
