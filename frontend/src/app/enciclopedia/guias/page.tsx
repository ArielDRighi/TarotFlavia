import type { Metadata } from 'next';

import { GuiasContent } from '@/components/features/encyclopedia/GuiasContent';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

/**
 * Guías List Page
 *
 * Route: /enciclopedia/guias
 * Listado de las 7 guías prácticas de espiritualidad.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.enciclopediaGuias;

export default function GuiasPage() {
  return <GuiasContent />;
}
