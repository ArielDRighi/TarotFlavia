/**
 * useAnimalHoroscopePage Hook
 *
 * Encapsulates all business logic for the Chinese Horoscope Animal Detail Page.
 * This keeps the page component clean (only UI) following the architecture pattern.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
  ChineseZodiacInfo,
} from '@/types/chinese-horoscope.types';

interface UseAnimalHoroscopePageResult {
  /** The current animal from URL params */
  animal: ChineseZodiacAnimal;
  /** Whether the current animal is valid */
  isValidAnimal: boolean;
  /** Animal info from the zodiac constant */
  animalInfo: ChineseZodiacInfo | null;
  /** User's own animal (if authenticated) */
  userAnimal: ChineseZodiacAnimal | undefined;
  /** Whether viewing own animal */
  isMyAnimal: boolean;
  /** Current element (calculated or from query) */
  element: ChineseElementCode | null;
  /** Horoscope data */
  horoscopeData: ChineseHoroscope | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Current year for horoscope */
  currentYear: number;
  /** Handle year submission for element calculation */
  handleYearSubmit: (year: number) => void;
}

/**
 * Custom hook that encapsulates all logic for the Chinese Horoscope Animal page.
 *
 * Manages:
 * - URL parameter extraction
 * - User authentication state
 * - Element calculation from year
 * - Horoscope data fetching
 * - URL synchronization
 *
 * @returns All state and handlers needed by the page component
 */
export function useAnimalHoroscopePage(): UseAnimalHoroscopePageResult {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const currentYear = new Date().getFullYear();

  const animal = params.animal as ChineseZodiacAnimal;

  // State for selected year (to calculate element)
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Get element from query param or calculate from year
  const elementFromQuery = searchParams.get('element') as ChineseElementCode | null;

  // Calculate user's animal if authenticated
  const userBirthDate = user?.birthDate
    ? new Date(user.birthDate).toISOString().split('T')[0]
    : null;
  const { data: userAnimalData } = useCalculateAnimal(userBirthDate);

  // Determine if user is viewing their own animal
  const isMyAnimal = useMemo(() => {
    if (!isAuthenticated || !userAnimalData) return false;
    return userAnimalData.animal === animal;
  }, [isAuthenticated, userAnimalData, animal]);

  // Calculate element when year is selected
  const calculationBirthDate = useMemo(() => {
    if (!selectedYear) return null;
    return `${selectedYear}-01-01`;
  }, [selectedYear]);

  const { data: calculatedAnimalData } = useCalculateAnimal(calculationBirthDate);

  // Determine which element to use
  const element = useMemo<ChineseElementCode | null>(() => {
    if (elementFromQuery) return elementFromQuery;
    if (isMyAnimal && userAnimalData) return userAnimalData.birthElement;
    if (calculatedAnimalData) return calculatedAnimalData.birthElement;
    return null;
  }, [elementFromQuery, isMyAnimal, userAnimalData, calculatedAnimalData]);

  // Queries for horoscope data
  // Only fetch my horoscope when viewing own animal (optimization)
  const {
    data: myHoroscopeData,
    isLoading: isLoadingMy,
    error: errorMy,
  } = useMyAnimalHoroscope(currentYear, { enabled: isMyAnimal });

  const {
    data: elementHoroscopeData,
    isLoading: isLoadingElement,
    error: errorElement,
  } = useChineseHoroscopeByElement(currentYear, animal, element);

  // Determine which data to show
  const horoscopeData: ChineseHoroscope | undefined = isMyAnimal
    ? myHoroscopeData
    : elementHoroscopeData;
  const isLoading = isMyAnimal ? isLoadingMy : isLoadingElement;
  const error = (isMyAnimal ? errorMy : errorElement) as Error | null;

  // Update URL with element when calculated
  useEffect(() => {
    if (element && !elementFromQuery) {
      const newUrl = `${ROUTES.HOROSCOPO_CHINO_ANIMAL(animal)}?element=${element}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [element, elementFromQuery, animal]);

  // Handler for year selection
  const handleYearSubmit = useCallback((year: number) => {
    setSelectedYear(year);
  }, []);

  // Validate animal
  const isValidAnimal = !!CHINESE_ZODIAC_INFO[animal];
  const animalInfo = isValidAnimal ? CHINESE_ZODIAC_INFO[animal] : null;

  return {
    animal,
    isValidAnimal,
    animalInfo,
    userAnimal: userAnimalData?.animal,
    isMyAnimal,
    element,
    horoscopeData,
    isLoading,
    error,
    currentYear,
    handleYearSubmit,
  };
}
