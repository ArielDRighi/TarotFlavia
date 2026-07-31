import type { Metadata } from 'next';

import { EnciclopediaHubContent } from '@/components/features/encyclopedia/EnciclopediaHubContent';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

/**
 * Enciclopedia Hub Page
 *
 * Route: /enciclopedia
 * Hub principal que muestra las 3 secciones: Tarot, Astrología, Guías.
 * All business logic is delegated to EnciclopediaHubContent component.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.enciclopedia;

export default function EnciclopediaPage() {
  return <EnciclopediaHubContent />;
}
