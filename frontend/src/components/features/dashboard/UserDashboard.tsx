'use client';

import { useState } from 'react';
import { useUserPlanFeatures } from '@/hooks/utils/useUserPlanFeatures';
import { WelcomeHeader } from './WelcomeHeader';
import { QuickActions } from './QuickActions';
import { DidYouKnowSection } from './DidYouKnowSection';
import { StatsSection } from './StatsSection';
import UpgradeBanner from '@/components/features/readings/UpgradeBanner';
import UpgradeModal from '@/components/features/readings/UpgradeModal';

/**
 * User Dashboard component for authenticated users
 *
 * Main home page for logged-in users. Displays:
 * - Welcome header with name and plan badge
 * - Quick action cards (Nueva Lectura, Historial, Carta del Día)
 * - Did You Know section with tarot facts
 * - Stats section (Premium only)
 * - Upgrade banner (Free users only)
 *
 * Layout is responsive and adapts to different screen sizes.
 *
 * @example
 * ```tsx
 * // In app/page.tsx
 * {isAuthenticated && <UserDashboard />}
 * ```
 */
export function UserDashboard() {
  const { isPremium } = useUserPlanFeatures();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const handleUpgradeClick = () => {
    setIsUpgradeModalOpen(true);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="space-y-8">
        {/* Welcome Header */}
        <WelcomeHeader />

        {/* Quick Actions */}
        <section>
          <QuickActions />
        </section>

        {/* Two-column layout for desktop */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column (2/3 width) */}
          <div className="space-y-8 lg:col-span-2">
            {/* Did You Know Section */}
            <DidYouKnowSection />

            {/* Upgrade Banner - Only for non-Premium users */}
            {!isPremium && <UpgradeBanner onUpgradeClick={handleUpgradeClick} />}
          </div>

          {/* Right column (1/3 width) */}
          <div className="space-y-8">
            {/* Stats Section - Only for Premium users */}
            {isPremium && <StatsSection />}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal open={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </div>
  );
}
