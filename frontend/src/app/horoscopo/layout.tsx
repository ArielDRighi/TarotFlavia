import type { Metadata } from 'next';

import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

/**
 * La metadata vive en el layout porque `page.tsx` es un client component y
 * Next no admite `export const metadata` en uno (T-PROD-020).
 *
 * `/horoscopo/[sign]` la sobrescribe con su propia `generateMetadata`: un layout
 * padre solo aporta lo que el hijo no declara.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.horoscopo;

export default function HoroscopoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
