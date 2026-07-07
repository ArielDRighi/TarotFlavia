'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { TarotPageContent } from '@/components/features/readings/TarotPageContent';
import { ServiceIntro } from '@/components/features/encyclopedia';
import { SERVICE_INTROS } from '@/lib/constants/service-intros.data';

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
      <TarotPageContent />
      <div className="mx-auto mt-8 max-w-2xl">
        <ServiceIntro data={SERVICE_INTROS.tarot} />
      </div>
    </div>
  );
}
