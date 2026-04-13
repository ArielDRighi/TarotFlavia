'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { useUserCapabilities } from '@/hooks/api/useUserCapabilities';
import { ROUTES } from '@/lib/constants/routes';
import { CategorySelector } from './CategorySelector';
import { ReadingLimitReached } from './ReadingLimitReached';

/**
 * TarotPageContent Component
 *
 * Business logic component for tarot page.
 * Handles routing logic and conditional rendering based on user capabilities.
 *
 * PLAN-BASED BEHAVIOR:
 * - FREE users: Automatically redirected to /tarot/tirada (no category selection)
 * - PREMIUM users: Select category first, then proceed to questions
 *
 * LIMIT VALIDATION:
 * - Users who reached their tarot reading limit see ReadingLimitReached modal
 * - Prevents poor UX where user selects category/question before seeing limit (TASK-REFACTOR-011)
 */
export function TarotPageContent() {
  const { user } = useAuth();
  const { data: capabilities, isLoading: isCapabilitiesLoading } = useUserCapabilities();
  const router = useRouter();

  const canCreateTarotReading = capabilities?.canCreateTarotReading ?? false;
  const canUseCustomQuestions = capabilities?.canUseCustomQuestions ?? false;

  // Redirect to spread selector if FREE/ANONYMOUS and can create readings
  useEffect(() => {
    if (!isCapabilitiesLoading && user && canCreateTarotReading && !canUseCustomQuestions) {
      router.replace(ROUTES.TAROT_TIRADA);
    }
  }, [isCapabilitiesLoading, user, canCreateTarotReading, canUseCustomQuestions, router]);

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

  // Show category selector for PREMIUM users only
  return <CategorySelector />;
}
