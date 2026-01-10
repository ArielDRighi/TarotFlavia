'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useUserCapabilities } from '@/hooks/api/useUserCapabilities';
import { CategorySelector } from '@/components/features/readings/CategorySelector';
import { ReadingLimitReached } from '@/components/features/readings/ReadingLimitReached';

/**
 * Ritual Page - Category Selector
 *
 * Protected page where users select a category before proceeding to questions.
 *
 * AUTHENTICATION REQUIRED:
 * - Redirects to /registro with message=register-for-readings if not authenticated
 *
 * PLAN-BASED BEHAVIOR:
 * - FREE users: Automatically redirected to /ritual/tirada (no category selection)
 * - PREMIUM users: Select category first, then proceed to questions
 *
 * LIMIT VALIDATION:
 * - Users who reached their tarot reading limit see ReadingLimitReached modal
 * - Prevents poor UX where user selects category/question before seeing limit (TASK-REFACTOR-011)
 */
export default function RitualPage() {
  useRequireAuth({
    redirectTo: '/registro',
    redirectQuery: { message: 'register-for-readings' },
  });

  const { user } = useAuth();
  const { data: capabilities, isLoading: isCapabilitiesLoading } = useUserCapabilities();
  const router = useRouter();

  const canCreateTarotReading = capabilities?.canCreateTarotReading ?? false;
  const canUseCustomQuestions = capabilities?.canUseCustomQuestions ?? false;

  // Redirect to spread selector if FREE/ANONYMOUS and can create readings
  useEffect(() => {
    if (!isCapabilitiesLoading && user && canCreateTarotReading && !canUseCustomQuestions) {
      router.replace('/ritual/tirada');
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

  // Show category selector for PREMIUM users
  return <CategorySelector />;
}
