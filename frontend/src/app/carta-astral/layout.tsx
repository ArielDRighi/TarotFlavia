import type { Metadata } from 'next';

import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

/**
 * Declaraba `title: 'Carta Astral | Auguria'` a mano, y como el `title.template`
 * del root layout (`%s | Auguria`) SÍ aplica a los segmentos hijos, la ruta
 * renderizaba `<title>Carta Astral | Auguria | Auguria</title>` (T-PROD-020).
 * Pasa por el builder compartido, que además completa el `openGraph`.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.cartaAstral;

export default function BirthChartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
