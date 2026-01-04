import { HeroSection } from './HeroSection';
import { TryWithoutRegisterSection } from './TryWithoutRegisterSection';
import { PlanComparison } from './PlanComparison';
import { HowItWorks } from './HowItWorks';
import { PremiumBenefitsSection } from './PremiumBenefitsSection';
import { WhatIsTarotSection } from './WhatIsTarotSection';

/**
 * LandingPage Component
 *
 * Main landing page for unauthenticated users.
 * Shows value proposition, plan comparison, and conversion CTAs.
 *
 * Structure:
 * 1. HeroSection - Main headline with Auguria branding + CTAs
 * 2. TryWithoutRegisterSection - Quick daily card CTA
 * 3. PlanComparison - Anonymous vs Free vs Premium comparison
 * 4. HowItWorks - 3-step process explanation
 * 5. PremiumBenefitsSection - Premium features highlight
 * 6. WhatIsTarotSection - Educational content
 */
export function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <TryWithoutRegisterSection />
      <PlanComparison />
      <HowItWorks />
      <PremiumBenefitsSection />
      <WhatIsTarotSection />
    </main>
  );
}
