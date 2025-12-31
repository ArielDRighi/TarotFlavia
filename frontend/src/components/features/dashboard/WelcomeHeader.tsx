'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useUserPlanFeatures } from '@/hooks/utils/useUserPlanFeatures';
import { PlanBadge } from '@/components/ui/plan-badge';

/**
 * Welcome header component for authenticated users dashboard
 *
 * Displays:
 * - Personalized greeting with user name
 * - Plan badge (FREE, PREMIUM)
 * - Link to profile page
 *
 * @example
 * ```tsx
 * <WelcomeHeader />
 * ```
 */
export function WelcomeHeader() {
  const { user } = useAuth();
  const { plan } = useUserPlanFeatures();

  const displayName = user?.name || 'Usuario';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-3xl font-bold">¡Hola, {displayName}!</h1>
        <PlanBadge plan={plan} />
      </div>

      <Link
        href="/perfil"
        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        Ver perfil
      </Link>
    </div>
  );
}
