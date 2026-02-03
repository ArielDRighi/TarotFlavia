/**
 * Chinese Horoscope Animal Detail Page Component
 *
 * Handles the business logic for displaying a specific animal's horoscope
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChineseHoroscopeDetail,
  ChineseAnimalSelector,
  ElementSelectorModal,
} from '@/components/features/chinese-horoscope';
import { useAnimalHoroscopePage } from '@/hooks/utils/useAnimalHoroscopePage';
import { ROUTES } from '@/lib/constants/routes';

export function AnimalHoroscopePage() {
  const router = useRouter();
  const {
    animal,
    isValidAnimal,
    animalInfo,
    userAnimal,
    element,
    horoscopeData,
    isLoading,
    error,
    currentYear,
    showElementModal,
    handleElementSelect,
  } = useAnimalHoroscopePage();

  // Track if user manually dismissed the modal
  // Use animal as key to reset state when animal changes
  const [userDismissedModal, setUserDismissedModal] = useState<Record<string, boolean>>({});

  // Show modal only if:
  // 1. showElementModal is true (no element and not user's animal)
  // 2. User hasn't dismissed it yet for this animal
  const shouldShowModal = showElementModal && !userDismissedModal[animal];

  const handleModalClose = (open: boolean) => {
    if (!open) {
      setUserDismissedModal((prev) => ({ ...prev, [animal]: true }));
    }
  };

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

      {/* Show element selector modal when element is missing */}
      <ElementSelectorModal
        open={shouldShowModal}
        animal={animal}
        animalNameEs={animalInfo.nameEs}
        animalEmoji={animalInfo.emoji}
        onSelectElement={handleElementSelect}
        onOpenChange={handleModalClose}
      />

      {/* Show info message with calculator link when user dismissed modal */}
      {!element && userDismissedModal[animal] && (
        <Alert className="mb-6">
          <Calculator className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Selecciona tu elemento para ver el horóscopo completo</span>
            <Button
              variant="link"
              size="sm"
              onClick={() => router.push(ROUTES.HOROSCOPO_CHINO)}
              className="ml-2"
            >
              ¿No sabes tu elemento? Usa el calculador
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Show horoscope when element is available */}
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
