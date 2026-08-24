import type { Metadata } from 'next';

import { AboutContent } from '@/components/features/about';
import { JsonLd } from '@/components/common/JsonLd';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';
import { buildAboutPageJsonLd } from '@/lib/metadata/structured-data';

/**
 * Sobre Nosotros
 *
 * Route: /sobre-nosotros
 *
 * Página de señales de autoría del sitio (T-SEO-011). Es estática y server
 * component: nada de lo que muestra depende de la API ni de la sesión, así que
 * el crawler recibe el contenido completo —y el JSON-LD— en el HTML inicial.
 *
 * Emite el `AboutPage` de esta URL, que referencia por `@id` al `Organization`
 * del sitio — declarado en el layout raíz, así que llega en toda página.
 *
 * ⚠️ NO va en `DISALLOWED_PATHS` de `robots.ts`: es de las páginas que más
 * queremos que se indexen.
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.sobreNosotros;

export default function SobreNosotrosPage() {
  return (
    <>
      <JsonLd id="about-page-jsonld" data={buildAboutPageJsonLd()} />
      <AboutContent />
    </>
  );
}
