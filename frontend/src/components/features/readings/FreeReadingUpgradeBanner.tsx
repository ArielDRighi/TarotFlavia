'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';

/**
 * FreeReadingUpgradeBanner
 *
 * Reutilizable banner shown to FREE users at the bottom of a reading result,
 * inviting them to upgrade to Premium for a personalized and deep interpretation.
 *
 * Usage:
 * - InterpretationSection (tarot readings) — HUS-006
 * - DailyCardExperience (carta del día)    — HUS-006
 */
export default function FreeReadingUpgradeBanner() {
  const router = useRouter();

  const handleUpgradeClick = useCallback(() => {
    router.push(ROUTES.PREMIUM);
  }, [router]);

  return (
    <div
      data-testid="free-reading-upgrade-banner"
      className="mt-6 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white shadow-lg"
    >
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <div className="flex-shrink-0">
          <Sparkles className="h-8 w-8 text-white/90" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 font-serif text-lg font-semibold">
            ✨ Llevá tu lectura al siguiente nivel
          </h3>
          <p className="text-sm text-white/90">
            Con Premium obtenés una interpretación personalizada y profunda para tu pregunta exacta.
            El universo tiene mucho más para decirte.
          </p>
        </div>
        <Button
          onClick={handleUpgradeClick}
          variant="secondary"
          className="flex-shrink-0 bg-white text-purple-700 hover:bg-white/90"
        >
          Conocer Premium
        </Button>
      </div>
    </div>
  );
}
