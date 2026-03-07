'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import {
  ChineseAnimalSelector,
  AnimalCalculator,
  ElementSelectorModal,
} from '@/components/features/chinese-horoscope';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useChineseHoroscopeMainPage } from '@/hooks/utils/useChineseHoroscopeMainPage';
import { EncyclopediaInfoWidget } from '@/components/features/encyclopedia';
import { ROUTES } from '@/lib/constants/routes';
import { CHINESE_ZODIAC_INFO } from '@/lib/utils/chinese-zodiac';

export default function HoroscopoChinoPage() {
  const {
    currentYear,
    isAuthenticated,
    userBirthDate,
    myHoroscope,
    userAnimal,
    selectedAnimalForModal,
    isModalOpen,
    handleAnimalSelect,
    handleElementSelect,
    handleModalOpenChange,
    navigateToMyHoroscope,
  } = useChineseHoroscopeMainPage();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-serif text-4xl">Horóscopo Chino {currentYear}</h1>
        <p className="text-muted-foreground">Descubre las predicciones anuales según tu animal</p>
      </div>

      <EncyclopediaInfoWidget
        slug="guia-horoscopo-chino"
        href={ROUTES.ENCICLOPEDIA_CARD('guia-horoscopo-chino')}
        className="mb-6"
      />

      {/* User's horoscope card (if authenticated and has birthDate) */}
      {isAuthenticated && userBirthDate && myHoroscope && (
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
              <Button onClick={navigateToMyHoroscope}>Ver mi horóscopo completo</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prompt to configure birthDate (if authenticated but no birthDate) */}
      {isAuthenticated && !userBirthDate && (
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

      {/* Calculador para todos los usuarios (permite calcular signo para amigos/familiares) */}
      <div className="mx-auto mb-8 max-w-md">
        <AnimalCalculator onAnimalFound={handleAnimalSelect} />
      </div>

      {/* Section title */}
      <div className="mb-4">
        <h2 className="text-center font-serif text-2xl">
          {isAuthenticated && userAnimal ? 'Explora otros signos' : 'Selecciona un animal'}
        </h2>
      </div>

      {/* Selector de animales */}
      <ChineseAnimalSelector userAnimal={userAnimal} onSelect={handleAnimalSelect} />

      {/* Element Selector Modal */}
      {selectedAnimalForModal && (
        <ElementSelectorModal
          open={isModalOpen}
          animal={selectedAnimalForModal}
          animalNameEs={CHINESE_ZODIAC_INFO[selectedAnimalForModal].nameEs}
          animalEmoji={CHINESE_ZODIAC_INFO[selectedAnimalForModal].emoji}
          onSelectElement={handleElementSelect}
          onOpenChange={handleModalOpenChange}
        />
      )}
    </div>
  );
}
