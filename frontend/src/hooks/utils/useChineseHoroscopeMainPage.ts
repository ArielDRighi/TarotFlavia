/**
 * useChineseHoroscopeMainPage Hook
 *
 * Encapsulates all business logic for the Chinese Horoscope main page.
 * This keeps the page component clean (only UI) following the architecture pattern.
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useMyAnimalHoroscope,
  useChineseHoroscopesByYear,
  useCalculateAnimal,
} from '@/hooks/api/useChineseHoroscope';
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
  /** Handle birth date confirmation from modal (format: YYYY-MM-DD) */
  handleBirthDateConfirm: (birthDate: string) => void;
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

  // State for birth date from modal (to calculate element via API)
  const [modalBirthDate, setModalBirthDate] = useState<string | null>(null);

  // Fetch user's horoscope if authenticated and has birthDate
  // Must use enabled: isAuthenticated to prevent 401 errors for anonymous users
  const { data: myHoroscope } = useMyAnimalHoroscope(currentYear, { enabled: isAuthenticated });
  useChineseHoroscopesByYear(currentYear);

  // Calculate element from modal birth date via API
  const { data: calculatedAnimalData } = useCalculateAnimal(modalBirthDate);

  const userAnimal = myHoroscope?.animal || null;

  // Navigate when calculation is complete
  useEffect(() => {
    if (calculatedAnimalData && selectedAnimalForModal && modalBirthDate) {
      const params = new URLSearchParams({ element: calculatedAnimalData.birthElement });
      router.push(`${ROUTES.HOROSCOPO_CHINO_ANIMAL(selectedAnimalForModal)}?${params.toString()}`);
      // Reset state after navigation (queued to next render)
      Promise.resolve().then(() => {
        setModalBirthDate(null);
        setSelectedAnimalForModal(null);
      });
    }
  }, [calculatedAnimalData, selectedAnimalForModal, modalBirthDate, router]);

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
        const params = new URLSearchParams({ element });
        router.push(`${ROUTES.HOROSCOPO_CHINO_ANIMAL(animal)}?${params.toString()}`);
        return;
      }

      // If user clicks their own animal, navigate directly
      if (userAnimal && animal === userAnimal) {
        router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL(animal));
        return;
      }

      // For other animals, show birth date selector modal
      setSelectedAnimalForModal(animal);
      setIsModalOpen(true);
    },
    [userAnimal, router]
  );

  const handleBirthDateConfirm = useCallback((birthDate: string) => {
    // Set birth date to trigger API calculation via useCalculateAnimal
    // Navigation will happen in useEffect when calculation completes
    setModalBirthDate(birthDate);
  }, []);

  const handleModalOpenChange = useCallback((open: boolean) => {
    setIsModalOpen(open);
    // Note: We don't reset state here because the modal might close
    // right after confirming, and we need to keep the state for the API call.
    // State is reset in the useEffect after successful navigation.
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
    handleBirthDateConfirm,
    handleModalOpenChange,
    navigateToMyHoroscope,
  };
}
