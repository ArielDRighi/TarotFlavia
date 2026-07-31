import type { Metadata } from 'next';

import { AstrologyHubContent } from '@/components/features/encyclopedia/AstrologyHubContent';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

/**
 * Astrología Hub Page
 *
 * Route: /enciclopedia/astrologia
 * Hub de astrología con banda de marca y enlaces a signos, planetas y casas.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.enciclopediaAstrologia;

export default function AstrologiaPage() {
  return <AstrologyHubContent />;
}
