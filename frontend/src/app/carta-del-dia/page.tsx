import { DailyCardExperience } from '@/components/features/daily-reading';

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
          Carta del Día
        </h1>

        {/* Main Content - All logic delegated to feature component */}
        <DailyCardExperience />
      </div>
    </div>
  );
}
