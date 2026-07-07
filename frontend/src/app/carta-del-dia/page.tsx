import { DailyCardExperience } from '@/components/features/daily-reading';
import { ServiceIntro } from '@/components/features/encyclopedia';
import { SERVICE_INTROS } from '@/lib/constants/service-intros.data';

/**
 * Carta del Día Page
 *
 * Page wrapper that renders the daily card experience component.
 * All business logic is delegated to DailyCardExperience component.
 */
export default function CartaDelDiaPage() {
  return (
    <div className="from-bg-main to-primary/5 min-h-screen bg-gradient-to-b p-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        {/* Header */}
        <h1 className="text-text-primary mb-8 text-center font-serif text-3xl md:text-4xl">
          Tarot del Día
        </h1>

        {/* Main Content - All logic delegated to feature component */}
        <DailyCardExperience />

        {/* Encyclopedia Widget */}
        <ServiceIntro data={SERVICE_INTROS['daily-card']} className="mt-8 w-full" />
      </div>
    </div>
  );
}
