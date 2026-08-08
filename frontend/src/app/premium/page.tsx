import type { Metadata } from 'next';

import { PremiumPage } from '@/components/features/premium';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

export const metadata: Metadata = STATIC_PAGE_METADATA.premium;

export default function PremiumRoute() {
  return <PremiumPage />;
}
