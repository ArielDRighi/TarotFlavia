'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUserCapabilities } from '@/hooks/api/useUserCapabilities';
import { CategorySelector } from './CategorySelector';
import { ReadingLimitReached } from './ReadingLimitReached';

/**
 * Slugs de las 3 categorías permitidas para usuarios FREE.
 * Deben coincidir exactamente con los slugs de la tabla `reading_category`.
 */
const FREE_MODE_CATEGORY_SLUGS = ['amor-relaciones', 'salud-bienestar', 'dinero-finanzas'] as const;

/**
 * TarotPageContent Component
 *
 * Business logic component for tarot page.
 * Handles routing logic and conditional rendering based on user capabilities.
 *
 * PLAN-BASED BEHAVIOR:
 * - FREE users: See CategorySelector filtered to 3 categories (Amor, Salud, Dinero).
 *   On category click they navigate directly to /tarot/tirada (no questions step).
 * - PREMIUM users: See full CategorySelector (6 categories) and proceed to questions.
 *
 * LIMIT VALIDATION:
 * - Users who reached their tarot reading limit see ReadingLimitReached modal
 * - Prevents poor UX where user selects category before seeing limit (TASK-REFACTOR-011)
 *
 * T-FR-F01: Removed useEffect redirect for FREE users. CategorySelector now handles
 * the FREE flow directly via freeModeCategories prop.
 */
export function TarotPageContent() {
  const { user } = useAuth();
  const { data: capabilities, isLoading: isCapabilitiesLoading } = useUserCapabilities();

  const canCreateTarotReading = capabilities?.canCreateTarotReading ?? false;
  const canUseCustomQuestions = capabilities?.canUseCustomQuestions ?? false;

  if (!user || isCapabilitiesLoading) {
    return null;
  }

  // Show limit modal if user cannot create tarot readings
  if (!canCreateTarotReading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ReadingLimitReached />
      </div>
    );
  }

  // FREE users: show CategorySelector with the 3 allowed slugs
  if (!canUseCustomQuestions) {
    return <CategorySelector freeModeCategories={[...FREE_MODE_CATEGORY_SLUGS]} />;
  }

  // PREMIUM users: show full CategorySelector (no filter)
  return <CategorySelector />;
}
