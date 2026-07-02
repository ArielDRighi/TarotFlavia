'use client';

import { useUserPlanFeatures } from '@/hooks/utils/useUserPlanFeatures';
import type { EditorialImage } from '@/lib/data/encyclopedia-editorial.data';
import { DashboardHero } from './DashboardHero';
import { QuickActions } from './QuickActions';
import { DidYouKnowSection } from './DidYouKnowSection';
import { StatsSection } from './StatsSection';
import UpgradeBanner from '@/components/features/readings/UpgradeBanner';
import { HoroscopeWidget } from '@/components/features/horoscope';
import { ChineseHoroscopeWidget } from '@/components/features/chinese-horoscope';
import { NumerologyWidget } from '@/components/features/numerology';
import { SacredEventsWidget } from './SacredEventsWidget';
import { PersonalizedRitualsWidget } from './PersonalizedRitualsWidget';
import { MyServicesWidget } from './MyServicesWidget';

// ─── Constants ──────────────────────────────────────────────────────────────────

/**
 * Themed header image for the welcome band (T-DASH-004). Reuses the Encyclopedia
 * canon (violeta/índigo + dorado, etéreo, sin texto); `DashboardHero` degrades to
 * its gradient band if the asset ever fails to load.
 */
const DASHBOARD_HERO_IMAGE: EditorialImage = {
  src: '/images/dashboard/dashboard-hero.webp',
  alt: 'Cartas de tarot etéreas sobre un cielo nocturno violeta con destellos dorados',
};

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * User Dashboard component for authenticated users
 *
 * Main home page for logged-in users. Displays:
 * - Welcome header with name and plan badge
 * - Quick action cards (Nueva Lectura, Historial, Carta del Día)
 * - Did You Know section with tarot facts
 * - Horoscope widget (All authenticated users)
 * - Chinese Horoscope widget (All authenticated users)
 * - Numerology widget (All authenticated users)
 * - Sacred Events widget (All authenticated users)
 * - Personalized Rituals widget (All users, Premium features)
 * - My Services widget (All users, hidden if no purchases)
 * - Stats section (Premium only)
 * - Upgrade banner (Free users only)
 *
 * Layout (T-DASH-001): the themed widgets are laid out in a single full-width
 * responsive grid (1 col on mobile, 2 on tablet via `sm`, 3 on wide desktop via
 * `xl` — kept at `xl` to avoid 3 cramped columns on smaller laptops) so the user
 * can scan all of them "at a glance" instead of having them stacked in a narrow
 * 1/3 side column with a large empty area beside it. `items-start` keeps each
 * card at its natural height. Plan-gated widgets (Stats / Upgrade banner) and
 * the self-hiding `MyServicesWidget` simply occupy (or free) a grid slot, so
 * the grid stays balanced for both FREE and PREMIUM users.
 *
 * @example
 * ```tsx
 * // In app/page.tsx
 * {isAuthenticated && <UserDashboard />}
 * ```
 */
export function UserDashboard() {
  const { isPremium } = useUserPlanFeatures();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="space-y-8">
        {/* Welcome Header - mystic band coherent with the Encyclopedia canon */}
        <DashboardHero image={DASHBOARD_HERO_IMAGE} />

        {/* Quick Actions */}
        <section>
          <QuickActions />
        </section>

        {/* Did You Know - full-width strip above the widget grid */}
        <DidYouKnowSection />

        {/* Themed widgets - single full-width responsive grid */}
        <section
          data-testid="dashboard-widget-grid"
          className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 xl:grid-cols-3"
        >
          {/* Horoscope Widget (Western) - For all users */}
          <HoroscopeWidget />

          {/* Chinese Horoscope Widget - For all users */}
          <ChineseHoroscopeWidget />

          {/* Numerology Widget - For all users */}
          <NumerologyWidget />

          {/* Sacred Events Widget - For all users */}
          <SacredEventsWidget />

          {/* Personalized Rituals Widget - For all users (Premium features) */}
          <PersonalizedRitualsWidget />

          {/* My Services Widget - hidden when there are no purchases */}
          <MyServicesWidget />

          {/* Stats Section - Only for Premium users */}
          {isPremium && <StatsSection />}
        </section>

        {/* Upgrade Banner - full-width footer, only for non-Premium users */}
        {!isPremium && <UpgradeBanner />}
      </div>
    </div>
  );
}
