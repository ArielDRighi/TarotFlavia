import type { Metadata } from 'next';

import { EditorialPolicyContent } from '@/components/features/editorial-policy';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';

/**
 * Política editorial
 *
 * Route: /politica-editorial
 *
 * Cómo se produce, revisa y corrige el contenido del sitio (T-SEO-017). Es
 * estática y server component: el crawler recibe el texto completo en el HTML
 * inicial. Se alcanza desde el footer de toda página y desde `/sobre-nosotros`.
 *
 * No emite JSON-LD propio: el `Organization` del layout raíz la declara como
 * `publishingPrinciples`, que es la propiedad de schema.org para esto.
 *
 * ⚠️ NO va en `DISALLOWED_PATHS` de `robots.ts`: es página de confianza.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.politicaEditorial;

export default function PoliticaEditorialPage() {
  return <EditorialPolicyContent />;
}
