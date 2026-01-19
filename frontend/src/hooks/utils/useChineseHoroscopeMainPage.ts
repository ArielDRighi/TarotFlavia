/**
 * useChineseHoroscopeMainPage Hook
 *
 * Encapsulates all business logic for the Chinese Horoscope main page.
 * This keeps the page component clean (only UI) following the architecture pattern.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMyAnimalHoroscope, useChineseHoroscopesByYear } from '@/hooks/api/useChineseHoroscope';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants/routes';
import { CHINESE_ZODIAC_INFO } from '@/lib/utils/chinese-zodiac';
import type { ChineseZodiacAnimal, ChineseHoroscope } from '@/types/chinese-horoscope.types';

interface UseChineseHoroscopeMainPageResult {
  /** Current year */
  currentYear: number;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** User's birth date (if available) */
  userBirthDate: string | null;
  /** User's horoscope data */
  myHoroscope: ChineseHoroscope | undefined;
  /** User's zodiac animal */
  userAnimal: ChineseZodiacAnimal | null;
  /** Currently selected animal for modal */
  selectedAnimalForModal: ChineseZodiacAnimal | null;
  /** Whether year selector modal is open */
  isModalOpen: boolean;
  /** Get animal name in Spanish */
  getAnimalNameEs: (animal: ChineseZodiacAnimal) => string;
  /** Get animal emoji */
  getAnimalEmoji: (animal: ChineseZodiacAnimal) => string;
  /** Handle animal selection from selector */
  handleAnimalSelect: (animal: ChineseZodiacAnimal, element?: string) => void;
  /** Handle year confirmation from modal */
  handleYearConfirm: (year: number) => void;
  /** Handle modal open state change */
  handleModalOpenChange: (open: boolean) => void;
  /** Navigate to user's horoscope */
  navigateToMyHoroscope: () => void;
}

/**
 * Custom hook that encapsulates all logic for the Chinese Horoscope main page.
 *
 * Manages:
 * - User authentication state
 * - Horoscope data fetching
 * - Modal state for year selection
 * - Navigation handlers
 *
 * @returns All state and handlers needed by the page component
 */
export function useChineseHoroscopeMainPage(): UseChineseHoroscopeMainPageResult {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();

  // Modal state
  const [selectedAnimalForModal, setSelectedAnimalForModal] = useState<ChineseZodiacAnimal | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch user's horoscope if authenticated and has birthDate
  const { data: myHoroscope } = useMyAnimalHoroscope(currentYear);
  useChineseHoroscopesByYear(currentYear);

  const userAnimal = myHoroscope?.animal || null;

  // Utility functions
  const getAnimalNameEs = useCallback((animal: ChineseZodiacAnimal) => {
    return CHINESE_ZODIAC_INFO[animal]?.nameEs || '';
  }, []);

  const getAnimalEmoji = useCallback((animal: ChineseZodiacAnimal) => {
    return CHINESE_ZODIAC_INFO[animal]?.emoji || '';
  }, []);

  // Handlers
  const handleAnimalSelect = useCallback(
    (animal: ChineseZodiacAnimal, element?: string) => {
      // If element is provided (from AnimalCalculator), navigate with element
      if (element) {
        router.push(`${ROUTES.HOROSCOPO_CHINO_ANIMAL(animal)}?element=${element}`);
        return;
      }

      // If user clicks their own animal, navigate directly
      if (userAnimal && animal === userAnimal) {
        router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL(animal));
        return;
      }

      // For other animals, show year selector modal
      setSelectedAnimalForModal(animal);
      setIsModalOpen(true);
    },
    [userAnimal, router]
  );

  const handleYearConfirm = useCallback(
    (year: number) => {
      if (selectedAnimalForModal) {
        // TODO (TASK-128): Calculate element from year and navigate to specific horoscope
        console.log('Year selected:', year); // Will be used in TASK-128
        router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL(selectedAnimalForModal));
      }
    },
    [selectedAnimalForModal, router]
  );

  const handleModalOpenChange = useCallback((open: boolean) => {
    setIsModalOpen(open);
  }, []);

  const navigateToMyHoroscope = useCallback(() => {
    if (myHoroscope) {
      router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL(myHoroscope.animal));
    }
  }, [myHoroscope, router]);

  return {
    currentYear,
    isAuthenticated,
    userBirthDate: user?.birthDate || null,
    myHoroscope,
    userAnimal,
    selectedAnimalForModal,
    isModalOpen,
    getAnimalNameEs,
    getAnimalEmoji,
    handleAnimalSelect,
    handleYearConfirm,
    handleModalOpenChange,
    navigateToMyHoroscope,
  };
}
