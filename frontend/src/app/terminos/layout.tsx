import type { Metadata } from 'next';

import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

/** Metadata en el layout: `page.tsx` es un client component (T-PROD-020). */
export const metadata: Metadata = STATIC_PAGE_METADATA.terminos;

export default function TerminosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
