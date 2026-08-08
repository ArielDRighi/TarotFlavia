import type { Metadata } from 'next';

import { EnciclopediaContent } from '@/components/features/encyclopedia/EnciclopediaContent';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

/**
 * Enciclopedia Tarot Page
 *
 * Route: /enciclopedia/tarot
 * Listado de las 78 cartas del tarot.
 * All business logic is delegated to EnciclopediaContent component.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.enciclopediaTarot;

export default function EnciclopediaTarotPage() {
  return <EnciclopediaContent />;
}
