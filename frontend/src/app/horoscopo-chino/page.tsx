'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import {
  ChineseAnimalSelector,
  AnimalCalculator,
  YearSelectorModal,
} from '@/components/features/chinese-horoscope';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMyAnimalHoroscope, useChineseHoroscopesByYear } from '@/hooks/api/useChineseHoroscope';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants/routes';
import { CHINESE_ZODIAC_INFO } from '@/lib/utils/chinese-zodiac';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

export default function HoroscopoChinoPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();

  const [selectedAnimalForModal, setSelectedAnimalForModal] = useState<ChineseZodiacAnimal | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch user's horoscope if authenticated and has birthDate
  const { data: myHoroscope } = useMyAnimalHoroscope(currentYear);
  useChineseHoroscopesByYear(currentYear);

  const userAnimal = myHoroscope?.animal || null;

  const handleAnimalSelect = (animal: ChineseZodiacAnimal) => {
    // If user clicks their own animal, navigate directly
    if (userAnimal && animal === userAnimal) {
      router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL(animal));
      return;
    }

    // For other animals, show year selector modal
    setSelectedAnimalForModal(animal);
    setIsModalOpen(true);
  };

  const handleYearConfirm = (year: number) => {
    if (selectedAnimalForModal) {
      // TODO (TASK-128): Calculate element from year and navigate to specific horoscope
      // Example: const element = calculateElementFromYear(year);
      // router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL_ELEMENT(selectedAnimalForModal, element));
      // For now, navigate to animal page only
      console.log('Year selected:', year); // Will be used in TASK-128
      router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL(selectedAnimalForModal));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-serif text-4xl">Horóscopo Chino {currentYear}</h1>
        <p className="text-muted-foreground">Descubre las predicciones anuales según tu animal</p>
      </div>

      {/* User's horoscope card (if authenticated and has birthDate) */}
      {isAuthenticated && user?.birthDate && myHoroscope && (
        <div className="mx-auto mb-8 max-w-2xl">
          <Card className="border-primary/50 bg-primary/5 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">{CHINESE_ZODIAC_INFO[myHoroscope.animal].emoji}</span>
                <span className="text-xl">
                  Tu Horóscopo:{' '}
                  {myHoroscope.fullZodiacType || CHINESE_ZODIAC_INFO[myHoroscope.animal].nameEs}{' '}
                  {currentYear}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                {myHoroscope.generalOverview}
              </p>
              <Button
                onClick={() => router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL(myHoroscope.animal))}
              >
                Ver mi horóscopo completo
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prompt to configure birthDate (if authenticated but no birthDate) */}
      {isAuthenticated && !user?.birthDate && (
        <div className="mx-auto mb-8 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Configura tu perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Para ver tu horóscopo chino personalizado, necesitamos tu fecha de nacimiento.
              </p>
              <Button asChild variant="outline">
                <Link href={ROUTES.PERFIL}>
                  <Settings className="mr-2 h-4 w-4" />
                  Ir a mi perfil
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calculador para usuarios no autenticados */}
      {!isAuthenticated && (
        <div className="mx-auto mb-8 max-w-md">
          <AnimalCalculator onAnimalFound={handleAnimalSelect} />
        </div>
      )}

      {/* Section title */}
      <div className="mb-4">
        <h2 className="text-center font-serif text-2xl">
          {isAuthenticated && userAnimal ? 'Explora otros signos' : 'Selecciona un animal'}
        </h2>
      </div>

      {/* Selector de animales */}
      <ChineseAnimalSelector userAnimal={userAnimal} onSelect={handleAnimalSelect} />

      {/* Year Selector Modal */}
      <YearSelectorModal
        open={isModalOpen}
        animalNameEs={
          selectedAnimalForModal ? CHINESE_ZODIAC_INFO[selectedAnimalForModal].nameEs : ''
        }
        animalEmoji={
          selectedAnimalForModal ? CHINESE_ZODIAC_INFO[selectedAnimalForModal].emoji : undefined
        }
        onConfirm={handleYearConfirm}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
