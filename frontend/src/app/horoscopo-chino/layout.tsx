import type { Metadata } from 'next';

import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

/**
 * Metadata en el layout: `page.tsx` es un client component (T-PROD-020).
 * `/horoscopo-chino/[animal]` la sobrescribe con su `generateMetadata`.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.horoscopoChino;

export default function HoroscopoChinoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
