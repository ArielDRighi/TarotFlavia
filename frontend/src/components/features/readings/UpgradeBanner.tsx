import { Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradeBannerProps {
  onUpgradeClick: () => void;
}

export default function UpgradeBanner({ onUpgradeClick }: UpgradeBannerProps) {
  return (
    <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Gem className="mt-1 h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="mb-1 font-semibold">
              💎 Desbloquea interpretaciones personalizadas con IA
            </h3>
            <p className="text-sm text-white/90">
              Con Premium, obtén análisis detallados, lecturas ilimitadas y acceso a todas las
              tiradas especiales.
            </p>
          </div>
        </div>
        <Button
          onClick={onUpgradeClick}
          variant="secondary"
          className="flex-shrink-0 bg-white text-purple-600 hover:bg-white/90"
        >
          Upgrade a Premium
        </Button>
      </div>
    </div>
  );
}
