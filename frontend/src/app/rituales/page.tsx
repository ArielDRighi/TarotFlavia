import type { Metadata } from 'next';

import { RitualsPage } from '@/components/features/rituals/RitualsPage';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

export const metadata: Metadata = STATIC_PAGE_METADATA.rituales;

export default function Page() {
  return <RitualsPage />;
}
