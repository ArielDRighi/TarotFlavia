/**
 * Chinese Horoscope Animal Detail Page
 *
 * Página de detalle para un animal del zodiaco chino específico
 * - Si es MI animal (usuario autenticado): muestra horóscopo directamente
 * - Si es OTRO animal: solicita año para calcular elemento
 *
 * All business logic is encapsulated in useAnimalHoroscopePage hook.
 */

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ChineseHoroscopeDetail,
  ChineseAnimalSelector,
  YearInputBanner,
} from '@/components/features/chinese-horoscope';
import { useAnimalHoroscopePage } from '@/hooks/utils/useAnimalHoroscopePage';
import { ROUTES } from '@/lib/constants/routes';

export default function ChineseHoroscopeAnimalPage() {
  const router = useRouter();
  const {
    animal,
    isValidAnimal,
    animalInfo,
    userAnimal,
    isMyAnimal,
    element,
    horoscopeData,
    isLoading,
    error,
    currentYear,
    handleBirthDateSubmit,
  } = useAnimalHoroscopePage();

  // Invalid animal - show error
  if (!isValidAnimal || !animalInfo) {
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
          userAnimal={userAnimal}
          onSelect={(a) => {
            router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL(a));
          }}
          className="!grid-cols-6 lg:!grid-cols-12"
        />
      </div>

      {/* If NOT my animal and NO element, show birth date input banner */}
      {!isMyAnimal && !element && (
        <YearInputBanner onBirthDateSubmit={handleBirthDateSubmit} animalName={animalInfo.nameEs} />
      )}

      {/* Show horoscope when available */}
      {element && (
        <>
          {isLoading ? (
            <div className="py-8 text-center">Cargando horóscopo...</div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Horóscopo no disponible para {currentYear}</p>
            </div>
          ) : horoscopeData ? (
            <ChineseHoroscopeDetail horoscope={horoscopeData} element={element} />
          ) : null}
        </>
      )}
    </div>
  );
}
