'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { RitualPageContent } from '@/components/features/readings/RitualPageContent';
import { EncyclopediaInfoWidget } from '@/components/features/encyclopedia';
import { ROUTES } from '@/lib/constants/routes';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <RitualPageContent />
      <div className="mx-auto mt-8 max-w-2xl">
        <EncyclopediaInfoWidget slug="guia-tarot" href={ROUTES.ENCICLOPEDIA_GUIA('guia-tarot')} />
      </div>
    </div>
  );
}
