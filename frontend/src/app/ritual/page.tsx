'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { RitualPageContent } from '@/components/features/readings/RitualPageContent';

/**
 * Ritual Page - Category Selector
 *
 * Protected page where users select a category before proceeding to questions.
 *
 * AUTHENTICATION REQUIRED:
 * - Redirects to /registro with message=register-for-readings if not authenticated
 *
 * All business logic and routing is handled by RitualPageContent component.
 */
export default function RitualPage() {
  useRequireAuth({
    redirectTo: '/registro',
    redirectQuery: { message: 'register-for-readings' },
  });

  return <RitualPageContent />;
}
