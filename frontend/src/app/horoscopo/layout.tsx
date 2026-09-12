import type { Metadata } from 'next';

import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

/**
 * La metadata vive en el layout desde T-PROD-020 (cuando `page.tsx` era un
 * client component y Next no admitía `export const metadata` en uno). La página
 * es Server Component desde T-SEO-015; se deja acá para no mover lo que
 * funciona.
 *
 * `/horoscopo/[sign]` la sobrescribe con su propia `generateMetadata`: un layout
 * padre solo aporta lo que el hijo no declara.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.horoscopo;

export default function HoroscopoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
