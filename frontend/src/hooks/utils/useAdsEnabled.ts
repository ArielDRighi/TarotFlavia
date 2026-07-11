'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useUserPlanFeatures } from './useUserPlanFeatures';
import { useAuthStore } from '@/stores/authStore';

/**
 * Prefijos de ruta donde NUNCA se muestran anuncios:
 * - `/admin`: panel interno, no es superficie de monetización.
 * - `/premium`: embudo de compra y activación de la suscripción.
 */
const AD_EXCLUDED_PATH_PREFIXES = ['/admin', '/premium'] as const;

/**
 * Segmento que identifica los flujos de pago de servicios holísticos
 * (`/servicios/<slug>/pago`, `/servicios/pago-exitoso`, `/servicios/pago-fallido`...).
 * Nunca se compite con un CTA de pago.
 */
const AD_EXCLUDED_PATH_SEGMENT = '/pago';

/**
 * Return type for useAdsEnabled hook
 */
export interface UseAdsEnabledReturn {
  /** ¿Se pueden renderizar anuncios en este momento y en esta ruta? */
  isEnabled: boolean;
  /** Publisher ID de AdSense (`ca-pub-...`), o null si el kill-switch está apagado */
  clientId: string | null;
}

function isExcludedPath(pathname: string): boolean {
  if (pathname.includes(AD_EXCLUDED_PATH_SEGMENT)) {
    return true;
  }

  return AD_EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Custom hook que centraliza el gating de Google AdSense.
 *
 * Un anuncio solo puede renderizarse cuando se cumplen las CUATRO condiciones:
 * 1. `NEXT_PUBLIC_ADSENSE_CLIENT` está seteada (kill-switch: vacía = ads apagados
 *    en dev/staging y sin ningún rastro de AdSense en el HTML).
 * 2. El `authStore` ya hidrató desde localStorage — sin esto, un Premium podría
 *    ver un flash de anuncio en el primer render.
 * 3. El plan del usuario NO es premium (anónimos y Free monetizan; Premium jamás).
 * 4. La ruta no está en una zona excluida (admin y flujos de pago).
 *
 * @example
 * ```tsx
 * const { isEnabled, clientId } = useAdsEnabled();
 * if (!isEnabled || !clientId) return null;
 * ```
 */
export function useAdsEnabled(): UseAdsEnabledReturn {
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const { isPremium } = useUserPlanFeatures();
  const pathname = usePathname();

  return useMemo(() => {
    const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || null;

    return {
      clientId,
      isEnabled: clientId !== null && hasHydrated && !isPremium && !isExcludedPath(pathname),
    };
  }, [hasHydrated, isPremium, pathname]);
}
