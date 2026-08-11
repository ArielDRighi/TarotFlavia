import type { Metadata } from 'next';

import { ListingIntro } from '@/components/common/ListingIntro';
import { AstrologyHubContent } from '@/components/features/encyclopedia/AstrologyHubContent';
import { LISTING_INTROS } from '@/lib/constants/listing-intros.data';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

/**
 * Astrología Hub Page
 *
 * Route: /enciclopedia/astrologia
 * Hub de astrología con banda de marca y enlaces a signos, planetas y casas.
 *
 * Servía 70 palabras propias: tres tarjetas y el encabezado. La introducción
 * editorial le da contenido propio (T-SEO-003).
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.enciclopediaAstrologia;

export default function AstrologiaPage() {
  return (
    <>
      <AstrologyHubContent />
      <ListingIntro intro={LISTING_INTROS.enciclopediaAstrologia} />
    </>
  );
}
