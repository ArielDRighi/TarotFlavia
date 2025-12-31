import { HeroSection } from './HeroSection';
import { TryWithoutRegisterSection } from './TryWithoutRegisterSection';
import { PremiumBenefitsSection } from './PremiumBenefitsSection';
import { WhatIsTarotSection } from './WhatIsTarotSection';

export function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <TryWithoutRegisterSection />
      <PremiumBenefitsSection />
      <WhatIsTarotSection />
    </main>
  );
}
