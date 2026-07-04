'use client';

import { useUserPlanFeatures } from '@/hooks/utils/useUserPlanFeatures';
import type { EditorialImage } from '@/lib/data/encyclopedia-editorial.data';
import { DashboardHero } from './DashboardHero';
import { QuickActions } from './QuickActions';
import { DidYouKnowSection } from './DidYouKnowSection';
import { RevealWidget } from './RevealWidget';
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
 * Layout (T-DASH-001): the themed widgets are laid out full-width across columns
 * (1 on mobile, 2 on tablet via `sm`, 3 on wide desktop via `xl` — kept at `xl`
 * to avoid 3 cramped columns on smaller laptops) so the user can scan them "at a
 * glance" instead of having them stacked in a narrow 1/3 side column.
 *
 * It uses a **CSS multi-column masonry** (`columns-*` + `break-inside-avoid`)
 * rather than a `grid`: with widgets of very different heights a grid with
 * `items-start` left large vertical holes under the shorter cards (a short
 * Horóscopo next to a tall Numerología). The masonry packs each column densely
 * (Pinterest-style), so short cards no longer leave gaps. Plan-gated widgets
 * (Stats / Upgrade banner) and the self-hiding `MyServicesWidget` simply add or
 * free a column item, keeping the layout balanced for FREE and PREMIUM users.
 * Reading/keyboard order follows the DOM order (unaffected by the visual
 * column flow); the reveal stagger keeps using each widget's `index`.
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

        {/*
          Themed widgets - single full-width responsive grid.

          Micro-interacciones de marca (T-DASH-006 / hallazgo DASH-006): cada widget
          aparece con un reveal fade-up escalonado (por `index`) al entrar en viewport
          y tiene hover de marca (lift + glow dorado). Los widgets que siempre
          renderizan van envueltos en `RevealWidget`; los que pueden auto-ocultarse
          (`StatsSection`, `MyServicesWidget`) reciben `index` y se envuelven ellos
          mismos, para que su `return null` siga liberando la celda del grid (T-DASH-001)
          sin dejar una celda "fantasma" vacía. `prefers-reduced-motion` se respeta en
          `Reveal` (aparición inmediata, sin animación).
        */}
        <section
          data-testid="dashboard-widget-grid"
          className="columns-1 gap-6 sm:columns-2 xl:columns-3 [&>*]:mb-6 [&>*]:break-inside-avoid"
        >
          {/* Horoscope Widget (Western) - For all users */}
          <RevealWidget index={0}>
            <HoroscopeWidget />
          </RevealWidget>

          {/* Chinese Horoscope Widget - For all users */}
          <RevealWidget index={1}>
            <ChineseHoroscopeWidget />
          </RevealWidget>

          {/* Numerology Widget - For all users */}
          <RevealWidget index={2}>
            <NumerologyWidget />
          </RevealWidget>

          {/* Sacred Events Widget - For all users */}
          <RevealWidget index={3}>
            <SacredEventsWidget />
          </RevealWidget>

          {/* Personalized Rituals Widget - For all users (Premium features) */}
          <RevealWidget index={4}>
            <PersonalizedRitualsWidget />
          </RevealWidget>

          {/* My Services Widget - self-hides (returns null) when there are no purchases */}
          <MyServicesWidget index={5} />

          {/* Stats Section - Only for Premium users; self-hides without capabilities */}
          {isPremium && <StatsSection index={6} />}
        </section>

        {/* Upgrade Banner - full-width footer, only for non-Premium users */}
        {!isPremium && <UpgradeBanner />}
      </div>
    </div>
  );
}
