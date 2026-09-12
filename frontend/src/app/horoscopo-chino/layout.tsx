import type { Metadata } from 'next';

import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

/**
 * Metadata en el layout desde T-PROD-020 (cuando `page.tsx` era un client
 * component); la página es Server Component desde T-SEO-015 y se deja acá.
 * `/horoscopo-chino/[animal]` la sobrescribe con su `generateMetadata`.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.horoscopoChino;

export default function HoroscopoChinoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
