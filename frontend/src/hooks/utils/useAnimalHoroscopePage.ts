/**
 * useAnimalHoroscopePage Hook
 *
 * Encapsulates all business logic for the Chinese Horoscope Animal Detail Page.
 * This keeps the page component clean (only UI) following the architecture pattern.
 *
 * TASK-135: Simplified version - removed YearInputBanner logic.
 * Now shows ElementSelectorModal when element is missing.
 */

import { useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
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
  /** Current element (from query or user's element) */
  element: ChineseElementCode | null;
  /** Horoscope data */
  horoscopeData: ChineseHoroscope | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Current year for horoscope */
  currentYear: number;
  /** Whether to show the element selector modal */
  showElementModal: boolean;
  /** Handler when user selects an element from modal */
  handleElementSelect: (element: ChineseElementCode) => void;
}

/**
 * Custom hook that encapsulates all logic for the Chinese Horoscope Animal page.
 *
 * TASK-135: Simplified version that:
 * - Removes birth date calculation logic (use calculator on main page instead)
 * - Shows ElementSelectorModal when element is missing
 * - Cleaner UX without confusing flows
 *
 * @returns All state and handlers needed by the page component
 */
export function useAnimalHoroscopePage(): UseAnimalHoroscopePageResult {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const currentYear = new Date().getFullYear();

  const animal = params.animal as ChineseZodiacAnimal;

  // Get element from query param only
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

  // Determine which element to use:
  // 1. Element from query param (user selected or from navigation)
  // 2. User's own element if viewing own animal
  // 3. Otherwise null (show element selector)
  const element = useMemo<ChineseElementCode | null>(() => {
    if (elementFromQuery) return elementFromQuery;
    if (isMyAnimal && userAnimalData) return userAnimalData.birthElement;
    return null;
  }, [elementFromQuery, isMyAnimal, userAnimalData]);

  // Show element selector modal when:
  // - Not viewing own animal AND
  // - No element in query params
  const showElementModal = !isMyAnimal && !element;

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

  // Handler when user selects an element from modal
  const handleElementSelect = (selectedElement: ChineseElementCode) => {
    // Navigate to same page with element query param
    router.push(`${ROUTES.HOROSCOPO_CHINO_ANIMAL(animal)}?element=${selectedElement}`);
  };

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
    showElementModal,
    handleElementSelect,
  };
}
