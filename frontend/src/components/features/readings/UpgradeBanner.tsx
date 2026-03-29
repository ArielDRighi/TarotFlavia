'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePreapproval } from '@/hooks/api/useSubscription';
import { ROUTES } from '@/lib/constants/routes';

export default function UpgradeBanner() {
  const router = useRouter();
  const { user } = useAuth();
  const { mutate: createPreapproval, isPending } = useCreatePreapproval();

  const handleUpgradeClick = useCallback(() => {
    if (!user) {
      // Anonymous user → redirect to registration with premium redirect
      router.push(`${ROUTES.REGISTER}?redirect=${ROUTES.PREMIUM}`);
      return;
    }

    // Free user → initiate MercadoPago preapproval flow
    createPreapproval(undefined, {
      onSuccess: ({ initPoint }) => {
        window.location.href = initPoint;
      },
    });
  }, [user, router, createPreapproval]);

  return (
    <div
      data-testid="upgrade-banner"
      className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white shadow-lg"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Gem className="mt-1 h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="mb-1 font-semibold">💎 Desbloquea interpretaciones personalizadas</h3>
            <p className="text-sm text-white/90">
              Con Premium, obtén análisis detallados, lecturas ilimitadas y acceso a todas las
              tiradas especiales.
            </p>
          </div>
        </div>
        <Button
          onClick={handleUpgradeClick}
          disabled={isPending}
          variant="secondary"
          className="flex-shrink-0 bg-white text-purple-600 hover:bg-white/90"
        >
          {isPending ? 'Cargando...' : 'Upgrade a Premium'}
        </Button>
      </div>
    </div>
  );
}
