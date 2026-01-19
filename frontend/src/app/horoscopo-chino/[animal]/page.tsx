/**
 * Chinese Horoscope Animal Detail Page
 *
 * Página de detalle para un animal del zodiaco chino específico
 * - Si es MI animal (usuario autenticado): muestra horóscopo directamente
 * - Si es OTRO animal: solicita año para calcular elemento
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ChineseHoroscopeDetail,
  ChineseAnimalSelector,
  YearInputBanner,
} from '@/components/features/chinese-horoscope';
import {
  useChineseHoroscopeByElement,
  useMyAnimalHoroscope,
  useCalculateAnimal,
} from '@/hooks/api/useChineseHoroscope';
import { CHINESE_ZODIAC_INFO } from '@/lib/utils/chinese-zodiac';
import { ROUTES } from '@/lib/constants/routes';
import { useAuthStore } from '@/stores/authStore';
import type {
  ChineseZodiacAnimal,
  ChineseElementCode,
  ChineseHoroscope,
} from '@/types/chinese-horoscope.types';

export default function ChineseHoroscopeAnimalPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const currentYear = new Date().getFullYear();

  const animal = params.animal as ChineseZodiacAnimal;

  // State para almacenar el año seleccionado (para calcular elemento)
  // Simple state sin persistencia - cada animal empieza sin año seleccionado
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Obtener elemento desde query param o calcular desde año
  const elementFromQuery = searchParams.get('element') as ChineseElementCode | null;

  // Calcular el animal del usuario si está autenticado
  const userBirthDate = user?.birthDate
    ? new Date(user.birthDate).toISOString().split('T')[0]
    : null;
  const { data: userAnimalData } = useCalculateAnimal(userBirthDate);

  // Determinar si el usuario está viendo su propio animal
  const isMyAnimal = useMemo(() => {
    if (!isAuthenticated || !userAnimalData) return false;
    return userAnimalData.animal === animal;
  }, [isAuthenticated, userAnimalData, animal]);

  // Calcular elemento cuando se selecciona un año
  const calculationBirthDate = useMemo(() => {
    if (!selectedYear) return null;
    return `${selectedYear}-01-01`;
  }, [selectedYear]);

  const { data: calculatedAnimalData } = useCalculateAnimal(calculationBirthDate);

  // Determinar qué elemento usar
  const element = useMemo<ChineseElementCode | null>(() => {
    if (elementFromQuery) return elementFromQuery;
    if (isMyAnimal && userAnimalData) return userAnimalData.birthElement;
    if (calculatedAnimalData) return calculatedAnimalData.birthElement;
    return null;
  }, [elementFromQuery, isMyAnimal, userAnimalData, calculatedAnimalData]);

  // Queries
  const {
    data: myHoroscopeData,
    isLoading: isLoadingMy,
    error: errorMy,
  } = useMyAnimalHoroscope(currentYear);

  const {
    data: elementHoroscopeData,
    isLoading: isLoadingElement,
    error: errorElement,
  } = useChineseHoroscopeByElement(currentYear, animal, element);

  // Determinar qué data mostrar
  const horoscopeData: ChineseHoroscope | undefined = isMyAnimal
    ? myHoroscopeData
    : elementHoroscopeData;
  const isLoading = isMyAnimal ? isLoadingMy : isLoadingElement;
  const error = isMyAnimal ? errorMy : errorElement;

  // Actualizar URL con elemento cuando se calcula
  useEffect(() => {
    if (element && !elementFromQuery) {
      const newUrl = `${ROUTES.HOROSCOPO_CHINO_ANIMAL(animal)}?element=${element}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [element, elementFromQuery, animal]);

  // Handler para cuando se selecciona un año
  const handleYearSubmit = async (year: number) => {
    setSelectedYear(year);
  };

  // Validar animal
  if (!CHINESE_ZODIAC_INFO[animal]) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl">Animal no válido</h1>
        <Button onClick={() => router.push(ROUTES.HOROSCOPO_CHINO)}>Ver todos los animales</Button>
      </div>
    );
  }

  const animalInfo = CHINESE_ZODIAC_INFO[animal];

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
          userAnimal={userAnimalData?.animal}
          onSelect={(a) => {
            router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL(a));
          }}
          className="!grid-cols-6 lg:!grid-cols-12"
        />
      </div>

      {/* Si NO es mi animal y NO tiene elemento, mostrar YearInputBanner */}
      {!isMyAnimal && !element && (
        <YearInputBanner onYearSubmit={handleYearSubmit} animalName={animalInfo.nameEs} />
      )}

      {/* Mostrar horóscopo cuando está disponible */}
      {element && (
        <>
          {isLoading ? (
            <div className="py-8 text-center">Cargando horóscopo...</div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Horóscopo no disponible para {currentYear}</p>
            </div>
          ) : horoscopeData ? (
            <ChineseHoroscopeDetail horoscope={horoscopeData} />
          ) : null}
        </>
      )}
    </div>
  );
}
