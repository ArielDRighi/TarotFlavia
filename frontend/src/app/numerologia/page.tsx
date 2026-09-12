import type { Metadata } from 'next';

import { NumerologyGuide } from '@/components/features/numerology/NumerologyGuide';
import { NumerologyPage } from '@/components/features/numerology/NumerologyPage';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

export const metadata: Metadata = STATIC_PAGE_METADATA.numerologia;

/**
 * Numerología (`/numerologia`): la calculadora arriba, usable sin registro, y
 * debajo la nota de uso en el HTML (T-SEO-015).
 */
export default function Page() {
  return (
    <>
      <NumerologyPage />
      <NumerologyGuide className="container mx-auto max-w-4xl px-4 pb-12" />
    </>
  );
}
