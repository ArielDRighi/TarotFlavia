'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserPlanFeatures } from '@/hooks/utils/useUserPlanFeatures';
import { ROUTES } from '@/lib/constants/routes';

/**
 * Botón "Premium" del header (T-SEO-015).
 *
 * Antes Premium era un ítem del menú editorial para el usuario Free. Como
 * `/premium` es página de venta con `noindex`, no puede estar en el menú que
 * un revisor recorre primero; pasa a ser un botón junto a los de sesión, para
 * el visitante sin sesión y para el usuario Free. El usuario Premium no lo ve.
 *
 * El gating sale de capabilities (`useUserPlanFeatures`), no del plan persistido
 * en el store, para que desaparezca apenas se activa la suscripción.
 */
export function PremiumHeaderButton() {
  const { isPremium } = useUserPlanFeatures();

  if (isPremium) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className="text-secondary hover:text-secondary/80 sm:h-9 sm:px-3"
    >
      <Link href={ROUTES.PREMIUM} data-testid="premium-header-button">
        <Star className="size-4 fill-current" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Premium</span>
      </Link>
    </Button>
  );
}
