import type { Metadata } from 'next';

import { ListingIntro } from '@/components/common/ListingIntro';
import { EnciclopediaHubContent } from '@/components/features/encyclopedia/EnciclopediaHubContent';
import { LISTING_INTROS } from '@/lib/constants/listing-intros.data';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

/**
 * Enciclopedia Hub Page
 *
 * Route: /enciclopedia
 * Hub principal que muestra las 3 secciones: Tarot, Astrología, Guías.
 * All business logic is delegated to EnciclopediaHubContent component.
 *
 * El hub ya se renderizaba entero en el servidor, pero eran 70 palabras: tres
 * tarjetas y poco más. La introducción editorial le da contenido propio
 * (T-SEO-003).
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.enciclopedia;

export default function EnciclopediaPage() {
  return (
    <>
      <EnciclopediaHubContent />
      <ListingIntro intro={LISTING_INTROS.enciclopedia} />
    </>
  );
}
