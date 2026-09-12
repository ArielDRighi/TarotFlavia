import type { Metadata } from 'next';

import { RitualsEditorialGuide } from '@/components/features/rituals/RitualsEditorialGuide';
import { RitualsPage } from '@/components/features/rituals/RitualsPage';
import { getRituals } from '@/lib/api/rituals-api';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';
import { resolveListingData } from '@/lib/metadata/route-data';

export const metadata: Metadata = STATIC_PAGE_METADATA.rituales;

/** El catálogo se edita desde el admin: una hora de ISR. */
export const revalidate = 3600;

/**
 * Hub de rituales (`/rituales`).
 *
 * Servía 223 palabras: la grilla llegaba por el cliente. Desde T-SEO-015 la
 * ruta resuelve el catálogo en el servidor y lo siembra en `RitualsPage`, así
 * los rituales —título, extracto, categoría, duración y fase— viajan en el
 * HTML; debajo va el índice editorial (`RitualsEditorialGuide`).
 */
export default async function Page() {
  const initialRituals = await resolveListingData(() => getRituals());

  return (
    <>
      <RitualsPage initialRituals={initialRituals} />
      <RitualsEditorialGuide />
    </>
  );
}
