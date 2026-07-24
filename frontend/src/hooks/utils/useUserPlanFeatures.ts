'use client';

import { useMemo } from 'react';
import { useAuth } from '../useAuth';
import { useUserCapabilities } from '../api/useUserCapabilities';
import type { UserPlan } from '@/types';

/**
 * Plan labels in Spanish
 */
const PLAN_LABELS: Record<UserPlan, string> = {
  anonymous: 'ANÓNIMO',
  free: 'GRATUITO',
  premium: 'PREMIUM',
};

/**
 * Return type for useUserPlanFeatures hook
 */
export interface UseUserPlanFeaturesReturn {
  /** Current user plan */
  plan: UserPlan;
  /** Spanish label for the plan */
  planLabel: string;
  /** Can user generate personalized interpretations? */
  canUseAI: boolean;
  /** Can user use categories? */
  canUseCategories: boolean;
  /** Can user write custom questions? */
  canUseCustomQuestions: boolean;
  /** Can user share readings? (only authenticated users) */
  canShare: boolean;
  /** Is user on premium plan? */
  isPremium: boolean;
  /** Is user on free plan? */
  isFree: boolean;
  /** Is user anonymous (not registered)? */
  isAnonymous: boolean;
}

/**
 * Custom hook that returns feature permissions based on user's plan
 *
 * Centralizes all plan-based permissions logic to avoid duplication
 * across components. Returns computed flags for UI conditional rendering.
 *
 * IMPORTANT: For usage limits (daily readings, tarot readings, etc.),
 * use useUserCapabilities() instead - it's the single source of truth
 * for limits and usage counts.
 *
 * Features by plan:
 * - ANONYMOUS: Daily card only, basic interpretations, no custom questions, no sharing
 * - FREE: 1 card + 1 reading/day, basic interpretations, no custom questions, can share
 * - PREMIUM: 1 card + 3 readings/day, personalized interpretations, custom questions, can share
 *
 * @example
 * ```tsx
 * function ReadingForm() {
 *   const { canUseAI, isPremium } = useUserPlanFeatures();
 *   const { data: capabilities } = useUserCapabilities(); // For limits
 *
 *   return (
 *     <div>
 *       <input disabled={!isPremium} />
 *       {!canUseAI && <PremiumBadge />}
 *       <p>Readings: {capabilities?.tarotReadings.used} / {capabilities?.tarotReadings.limit}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUserPlanFeatures(): UseUserPlanFeaturesReturn {
  const { user } = useAuth();
  const { data: capabilities } = useUserCapabilities();

  // Source of truth for the plan is `capabilities.plan` (React Query, staleTime:0,
  // recomputed from the DB on every fetch). The persisted `authStore.user.plan` is
  // only a fallback for first paint while capabilities loads — it goes stale when
  // the plan changes without a re-login (webhook upgrade, subscription expiry), so
  // deriving gating from it caused "still free after paying" bugs.
  const capabilitiesPlan = capabilities?.plan as UserPlan | undefined;
  const authPlan = user?.plan as UserPlan | undefined;

  return useMemo(() => {
    const plan: UserPlan = capabilitiesPlan ?? authPlan ?? 'anonymous';
    const isPremium = plan === 'premium';
    const isFree = plan === 'free';
    const isAnonymous = plan === 'anonymous';

    return {
      plan,
      planLabel: PLAN_LABELS[plan],
      canUseAI: isPremium,
      canUseCategories: isPremium,
      canUseCustomQuestions: isPremium,
      canShare: !isAnonymous, // FREE and PREMIUM can share
      isPremium,
      isFree,
      isAnonymous,
    };
  }, [capabilitiesPlan, authPlan]);
}
