import type { Metadata } from 'next';

import { NumerologyPage } from '@/components/features/numerology/NumerologyPage';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

export const metadata: Metadata = STATIC_PAGE_METADATA.numerologia;

export default function Page() {
  return <NumerologyPage />;
}
