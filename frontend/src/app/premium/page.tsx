import type { Metadata } from 'next';

import { PremiumPage } from '@/components/features/premium';
import { fetchPublicPlans } from '@/lib/api/public-plans-api';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';
import { resolveListingData } from '@/lib/metadata/route-data';

/**
 * Página de planes.
 *
 * Route: /premium
 *
 * Servía **3 palabras propias**, el peor caso del sitio junto con el horóscopo
 * chino: la comparativa, las FAQ y el resto del contenido estático estaban
 * detrás de un esqueleto que esperaba a `usePublicPlans` (T-SEO-003). Ahora la
 * ruta resuelve los planes en el servidor y el contenido ya no depende de eso.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.premium;

/** El precio se edita desde el admin: una hora de ISR. */
export const revalidate = 3600;

export default async function PremiumRoute() {
  const initialPlans = await resolveListingData(fetchPublicPlans);

  return <PremiumPage initialPlans={initialPlans} />;
}
