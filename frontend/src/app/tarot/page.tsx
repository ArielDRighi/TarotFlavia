'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { TarotPageContent } from '@/components/features/readings/TarotPageContent';
import { EncyclopediaInfoWidget } from '@/components/features/encyclopedia';
import { ROUTES } from '@/lib/constants/routes';

/**
 * Tarot Page - Category Selector
 *
 * Protected page where users select a category before proceeding to questions.
 *
 * AUTHENTICATION REQUIRED:
 * - Redirects to /registro with message=register-for-readings if not authenticated
 *
 * All business logic and routing is handled by TarotPageContent component.
 */
export default function TarotPage() {
  useRequireAuth({
    redirectTo: '/registro',
    redirectQuery: { message: 'register-for-readings' },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto mb-8 max-w-2xl">
        <EncyclopediaInfoWidget slug="guia-tarot" href={ROUTES.ENCICLOPEDIA_GUIA('guia-tarot')} />
      </div>
      <TarotPageContent />
    </div>
  );
}
