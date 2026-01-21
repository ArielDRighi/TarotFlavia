/**
 * Chinese Horoscope Animal Detail Page
 *
 * Página de detalle para un animal del zodiaco chino específico
 * - Si es MI animal (usuario autenticado): muestra horóscopo directamente
 * - Si NO hay elemento: muestra ElementSelectorModal para elegir
 *
 * TASK-135: Simplified version - removed YearInputBanner (confusing UX)
 * Now uses ElementSelectorModal + link to calculator for exact calculations.
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

export default function ChineseHoroscopeAnimalPage() {
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

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-open modal when element is missing
  // (Controlled by showElementModal flag from hook)
  const shouldShowModal = showElementModal && !isModalOpen;

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
        onOpenChange={setIsModalOpen}
      />

      {/* Show info message with calculator link when no element selected */}
      {!element && !showElementModal && (
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
