'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { CategorySelector } from '@/components/features/readings/CategorySelector';

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
 */
export default function RitualPage() {
  useRequireAuth({
    redirectTo: '/registro',
    redirectQuery: { message: 'register-for-readings' },
  });

  return <CategorySelector />;
}
